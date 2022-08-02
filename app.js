const express = require("express");
const session = require("express-session");
const app = express();
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const compression = require('compression')
const { connect, getUser, addToken, removeToken, removeSession,getAllCrons, getAllSessionIdForEmail } = require("./db.js");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const protectedRouter = require("./Router/protectedapis");
const connectionDetails = require("./PostGresConnectionPool");
const authApisRouter = require("./Router/authapis");
const { default: helmet } = require("helmet");
const translator = require("./middlewares/translator.js");
const pgPool = require('./PostGresConnectionPool')
const disableTraceRequests = require('./middlewares/disableTraceRequests')
const cronRunner = require('./crons/cronRunner')

dotenv.config();

//disable powered-by header 
app.disable('x-powered-by')
//sets security headers
app.use(helmet())

//disable trace request
app.use(disableTraceRequests)

app.use(compression())

app.use(
  cors({
    origin: process.env.ClientUrl,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.secretKey,
    store: new pgSession({
      pool: pgPool,
      tableName: "user_session",
      ttl : 12*60*60,//session will live for 12 hours in db
      pruneSessionInterval :8*60*60 // expired sessions will be deleted from db after 8 hours
    }),
    saveUninitialized: true,
    resave:false,
    genid: function () {
      return uuidv4();
    },
    saveUninitialized: true,
    secure: false,
    name:"anotherNumber",
    cookie:{
      maxAge:0.01666666666*60*60*1000,
      httpOnly:false,
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//translator middleware
app.use(translator)

app.get("/", (req, res) => {
  res.send("welcome");
});

app.use("/auth", authApisRouter);

app.use("/protectedRoute", protectedRouter);

//404 handler
app.use((req, res, next) => {
  res.status(404).send({success:0,msg:"Sorry can't find that!"})
})

//500 handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({success:0,msg:'Something broke!'})
})

app.listen(3001, async (req, res) => {
  //start crons
  cronRunner()
  console.log("server started");
});
