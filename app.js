const express = require("express");
const session = require("express-session");
const app = express();
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { connect, getUser ,addUser} = require("./db.js");
const cors = require("cors");

const dotenv = require("dotenv");
const protectedRouter = require("./Router/protectedapis");
const connectionDetails = require("./pgDBconnectionDetails");
const authApisRouter = require('./Router/authapis')

dotenv.config();

const pgPool = new pg.Pool(connectionDetails);

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
  res.send("welcome");
});

app.use('/auth',authApisRouter);

app.use("/protectedRoute", protectedRouter);

app.listen(3001, async (req, res) => {
  await connect();
  console.log("server started");
});
