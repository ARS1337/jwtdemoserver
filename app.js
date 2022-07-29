const express = require("express");
const session = require("express-session");
const app = express();
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { connect, getUser, addToken, removeToken, removeSession, getAllSessionIdForEmail } = require("./db.js");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const protectedRouter = require("./Router/protectedapis");
const connectionDetails = require("./pgDBconnectionDetails");
const authApisRouter = require("./Router/authapis");
const { default: helmet } = require("helmet");
const translator = require("./middlewares/translator.js");
const { timestamp30MinsForward } = require("./utils/customMoment.js");
const { default: axios } = require("axios");
const pgPool = new pg.Pool(connectionDetails);

dotenv.config();

app.disable('x-powered-by')
app.use(helmet())

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
      maxAge:0.01666666666*60*60*1000
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

app.use((req, res, next) => {
  res.status(404).send({success:0,msg:"Sorry can't find that!"})
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send({success:0,msg:'Something broke!'})
})

app.listen(3001, async (req, res) => {
  await connect();
  let r = await getAllSessionIdForEmail('abhaysingh@gmail.com','4710ad47-48bb-46d5-b027-999f8ca273df')
  console.log(r)
  console.log("server started");
});
