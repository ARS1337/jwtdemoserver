const express = require("express");
const https = require('https');
const session = require("express-session");
const app = express();
const { createHmac } = require("crypto");
const bodyParser = require("body-parser");
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { connect, getUser } = require("./db.js");
const cors = require("cors");
var jwt = require("jsonwebtoken");

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

app.get('/',(req,res)=>{
  res.send("sdfsdfsdf")
})

app.post("/login", async (req, res) => {
  const user = req.body.user;
  const pwd = req.body.pwd;
  console.log("pwd : ", pwd);
  let userExits = await getUser(user);
  console.log("userExits.rows[0].password  : ", userExits.rows[0].password);
  console.log(userExits);
  if (userExits.rows[0].password === pwd) {
    status = "login success";
    console.log("login success");
    var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
    // res.send({ success: 1, error: 0,data:'login successfull' });
  } else {
    status = "login failed";
    // res.send({success:0,error:0,data:'password dont match'})
  }
  userExits.token = token;
  //   console.log(userExits);
  res.json(userExits || {});
});

app.listen(3001, async (req, res) => {
  await connect();
  var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
  console.log(token)
  console.log("server started");
})