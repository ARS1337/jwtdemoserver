const express = require("express");
const Router = express.Router();

Router.get("/", (req, res) => {
  res.send("protected route root");
});

Router.get('/test',(req,res)=>{
    res.send('protected route test')
})

module.exports = Router;
