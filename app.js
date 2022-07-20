const express = require("express");
const https = require("https");
const session = require("express-session");
const app = express();
const { createHmac } = require("crypto");
const bodyParser = require("body-parser");
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { connect, getUser } = require("./db.js");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const protectedRouter = require("./Router/protectedapis");
const jwtAuthenticate = require("./middlewares/jwtAuthenticate.js");
const i18n = require("./i18n.js");
const path = require("path");

dotenv.config();
// console.log("TOKEN_SECRET: ", process.env.TOKEN_SECRET);

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};

const pgPool = new pg.Pool({
  //postgres connection details
  host: "localhost",
  password: "admin",
  port: 5432,
  user: "postgres",
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret key",
    store: new pgSession({
      pool: pgPool,
      tableName: "user_session",
    }),
  })
);

app.get("/", (req, res) => {
  res.send("sdfsdfsdf");
});

app.post("/login", async (req, res) => {
  const receivedLanguages = req.acceptsLanguages() || "en";
  console.log("i18n will translate into ",receivedLanguages[0])
  req.session.translate = i18n(receivedLanguages[0])
  console.log("receivedLanguages : ", receivedLanguages);
  const user = req.body.user;
  const pwd = req.body.pwd;
  let data = {};
  let greeting = req.session.translate("hello");
  data.greeting = greeting;
  data.receivedLanguages = receivedLanguages;
  let userExits = await getUser(user);
  if (userExits && userExits?.rows[0]?.password === pwd) {
    console.log("login success");
    data.token = generateAccessToken({ user: user });
    data.success = 1;
    data.loginStatus = req.session.translate("login success");
  } else {
    data.success = 0;
    data.loginStatus = req.session.translate("login failed");
    console.log("login failed");
  }
  res.json(data || {});
});

app.use("/protectedRoute", jwtAuthenticate);

app.post("/protectedRoute", (req, res) => {
  // console.log('req.jwtAuthentication ',req.jwtAuthentication)
  if (req.jwtAuthentication.success == 1)
    res.status(req.jwtAuthentication.status).json({ success: 1 });
  else res.status(req.jwtAuthentication.status).json({ success: 0 });
});

// app.use('/protectedRoute',protectedRouter)

app.listen(3001, async (req, res) => {
  await connect();
  console.log("server started");
});
