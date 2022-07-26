const express = require("express");
const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const Router = express.Router();

Router.use(jwtAuthenticate);

Router.use((req, res, next) => {
  if (res.locals.jwtAuthentication.success == 1) {
    next()
  } else {
    res
      .status(res.locals.jwtAuthentication.status)
      .json({ success: 0, message: "please login first" });
  }
});

Router.post("/", (req, res) => {
  if (res.locals.jwtAuthentication.success == 1)
      res.status(res.locals.jwtAuthentication.status).json({ success: 1 });
    else res.status(res.locals.jwtAuthentication.status).json({ success: 0 });
});

Router.get("/test", (req, res) => {
  res.send("protected route test");
});

module.exports = Router;
