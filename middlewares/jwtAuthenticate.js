const jwt = require("jsonwebtoken");
const { getToken } = require("../db");
const checkQueryResult = require("../utils/checkQueryResult");

const jwtAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let tokenQueryResult = await getToken(token);
    let isTokenValid = checkQueryResult(tokenQueryResult);
    let data = { success: 0, token: token };
    res.locals.jwtAuthentication = data;

    if (token == null || !isTokenValid) {
      data.status = 401;
      data.msg = "Unauthorized request, please login and try again";
      return next();
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
      // console.log("error while verifying: ",err)

      if (err) {
        data.status = 403;
        data.err = err;
        data.success = 0;
        if (
          err?.message &&
          (err.message == "invalid signature" ||
            err.message == "jwt malformed" ||
            err.message == "invalid token" ||
            err.message == "jwt expired")
        ) {
          data.status = 403;
          data.success = 0;
        } else {
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
    console.log("catch err", err);
    next(err);
  }
};

module.exports = jwtAuthenticate;
