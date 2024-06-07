import { config } from 'dotenv';
config();
import 'express-async-errors';
import express from 'express';

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// swagger
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./swagger.yaml')

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
  collection: "mySessions",
});
store.on("error", error => console.log(error));

// session
const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParams.cookie.secure = true; // serve secure cookies
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

app.use(connectFlash());
app.use(storeLocals);

// routers
import secretWordRouter from './routes/secretWord.js';
import sessionRouter from './routes/sessionRoutes.js';

// routes
app.use("/sessions", sessionRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use("/secretWord", auth, secretWordRouter);

app.get("/", (req, res) => {
  res.render("index");
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
}); 

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
