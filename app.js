import { config } from 'dotenv';
config();
import 'express-async-errors';
import express from 'express';
import csrf from 'host-csrf';
import cookieParser from 'cookie-parser';

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// CSRF module
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
const csrf_options = {
  protected_operations: ['PATCH'],
  protected_content_types: ['application/json'],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options);

// swagger
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./swagger.yaml');

// session and connectDB
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import connectDB from './db/connect.js';

// db
const MongoDBStore = ConnectMongoDBSession(session);
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: 'mySessions',
});
store.on('error', error => console.log(error));

// session
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: 'strict' },
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
  csrf_development_mode = false;
};
app.use(session(sessionParams));

// passport init
import passport from 'passport';
import passportInit from './passport/passportInit.js';
passportInit();
app.use(passport.initialize());
app.use(passport.session());

// tools and middleware
import connectFlash from 'connect-flash';
import storeLocals from './middleware/storeLocals.js';
import auth from './middleware/auth.js';
app.use(csrf_middleware);
app.use(connectFlash());
app.use(storeLocals);

//static
app.use(express.static('./static'));

//error handler
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';

// routers
import secretWordRouter from './routes/secretWord.js';
import sessionRouter from './routes/sessionRoutes.js';
import foodItemsRouter from './routes/food-items.js';

// routes
app.use('/sessions', sessionRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/secretWord', auth, secretWordRouter);
app.use('/food-items', auth, foodItemsRouter);

app.get('/', (req, res) => {
  res.render('index');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI, console.log('Connected to the DB'));
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
})();
