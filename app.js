const express = require("express");
const session = require("express-session");
const app = express();
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { connect, getUser } = require("./db.js");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const protectedRouter = require("./Router/protectedapis");
const connectionDetails = require("./pgDBconnectionDetails");
const authApisRouter = require("./Router/authapis");
const { default: helmet } = require("helmet");
const translator = require("./middlewares/translator.js");

dotenv.config();

app.disable('x-powered-by')
app.use(helmet())

const pgPool = new pg.Pool(connectionDetails);

app.use(
  session({
    secret: process.env.secretKey,
    store: new pgSession({
      pool: pgPool,
      tableName: "user_session",
    }),
    saveUninitialized: true,
    genid: function () {
      return uuidv4();
    },
    saveUninitialized: true,
    secure: false,
    name:"anotherNumber"
  })
);
app.use(
  cors({
    origin: process.env.ClientUrl,
    credentials: true,
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
  console.log("server started");
});
