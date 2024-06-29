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
import activitiesRouter from './routes/activities.js';
import mainWindowRouter from './routes/main-window.js';
import userRouter from './routes/user.js';

// Chai/Express rendering issue fix
app.use((req, res, next) => {
  if (req.path == '/multiply') {
    res.set('Content-Type', 'application/json');
  } else {
    // res.set('Content-Type', 'text/html')
  };
  next();
});

// routes
app.use('/sessions', sessionRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/secretWord', auth, secretWordRouter);
app.use('/food-items', auth, foodItemsRouter);
app.use('/activities', auth, activitiesRouter);
app.use('/main-window', auth, mainWindowRouter);
app.use('/edit-profile', auth, userRouter);

app.get('/', (req, res) => {
  res.render('index');
});

// test route
app.get('/multiply', (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = 'NaN';
  } else if (result == null) {
    result = 'null';
  }
  res.json({ result: result });
});

app.get('/calendar', (req, res) => {
  res.render('calendar.ejs');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

let port = process.env.PORT || 3000;
const server = await (async () => {
  let mongoURL = process.env.MONGO_URI;
  try {
    if (process.env.NODE_ENV == 'test') {
      mongoURL = process.env.MONGO_URI_TEST;
      port = 3001;
    };
    console.log(`Running in ${process.env.NODE_ENV || 'dev'} env`);

    await connectDB(mongoURL, console.log('Connected to the DB'));
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
})();

export { app, server, port };
