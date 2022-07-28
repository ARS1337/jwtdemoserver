const jwt = require("jsonwebtoken");

const jwtAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let data = { success: 0 };
    res.locals.jwtAuthentication = data;

    if (token == null) {
      data.status = 401;
      return next();
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      // console.log("error while verifying: ",err)
      if (err) {
        data.status = 403;
        data.err = err;
        data.success = 0;
        if (err?.message && (err.message == "invalid signature" || err.message == "jwt malformed" ||err.message == "invalid token")) {
          data.status = 200;
          data.success = 0;
        }  else {
          return next(err);
        }
      } else {
        data.status = 200;
        data.user = user;
        data.success = 1;
      }
    });
    res.locals.jwtAuthentication = data;
    next();
  } catch (err) {
    console.log("catch err",err);
    next(err);
  }
};

module.exports = jwtAuthenticate;
