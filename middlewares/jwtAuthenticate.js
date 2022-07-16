const jwt = require("jsonwebtoken");

const jwtAuthenticate = (req, res, next) => {
  console.log("jwtAuthenticate");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("authHeader is ", authHeader);
  console.log("received token is ", token);
  let data = { success: 0 };
  req.jwtAuthentication = data;

  if (token == null) {
    data.status = 401;
    return next();
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) {
      data.status =403
      return next(err);
    }
    data.status =200
    data.user = user;
    data.success = 1;
  });
  req.jwtAuthentication = data;
  next();
};

module.exports = jwtAuthenticate;
