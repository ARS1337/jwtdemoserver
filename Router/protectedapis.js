const express = require("express");
const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const Router = express.Router();

Router.use(jwtAuthenticate);

Router.use((req, res, next) => {
  console.log("req.jwtAuthentication: ",req.jwtAuthentication)
  if (req.jwtAuthentication.success == 1) {
    next()
  } else {
    res
      .status(req.jwtAuthentication.status)
      .json({ success: 0, message: "please login first" });
  }
});

Router.get("/", (req, res) => {
  res.send("protected route root");
});

Router.get("/test", (req, res) => {
  res.send("protected route test");
});

module.exports = Router;
