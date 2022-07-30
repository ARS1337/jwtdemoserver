const express = require("express");
const {
  getUser,
  changePassword,
  removeToken,
  removeSession,
  removeAllTokensExceptThisOne,
} = require("../db");
const jwtAuthenticate = require("../middlewares/jwtAuthenticate");
const validator = require("../middlewares/validator");
const checkQueryResult = require("../utils/checkQueryResult");
const Router = express.Router();
const {
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  doesUserExistSchema,
  saveNumberSchema,
  checkOtpSchema,
  changePasswordSchema,
  logoutSchema,
} = require("../validationSchemas/authApisSchemas");

Router.use(jwtAuthenticate);

Router.use((req, res, next) => {
  if (res.locals.jwtAuthentication.success == 1) {
    next();
  } else if (res.locals.jwtAuthentication.status != 200) {
    res
      .status(res.locals.jwtAuthentication.status)
      .json({ success: 0, msg: res.locals.jwtAuthentication.msg });
  } else {
    res
      .status(res.locals.jwtAuthentication.status)
      .json({ success: 0, msg: "Bad token, please login and try again" });
  }
});

const addChangePasswordSchema = (req, res, next) => {
  res.locals.schema = changePasswordSchema;
  next();
};

const addLogoutSchema = (req, res, next) => {
  res.locals.schema = logoutSchema;
  next();
};

Router.post("/", (req, res) => {
  try {
    if (res.locals.jwtAuthentication.success == 1)
      res.status(res.locals.jwtAuthentication.status).json({ success: 1 });
    else
      res
        .status(res.locals.jwtAuthentication.status)
        .json({ success: 0, data: res.locals.jwtAuthentication });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

Router.post(
  "/changePassword",
  addChangePasswordSchema,
  validator,
  async (req, res, next) => {
    try {
      let email = req.body.email;
      let password = req.body.password;
      let newPassword = req.body.newPassword;
      let token = res.locals.jwtAuthentication.token;
      let data = {};
      data.success = 0;
      let userDetails = await getUser(email);
      let userData;
      if (userDetails && userDetails?.rows) {
        userData = userDetails?.rows[0];
        if (email !== userData.email) {
          data.msg = res.locals.translate("Email doesn't match");
        } else if (userData.password !== password) {
          data.msg = res.locals.translate("Please Enter your correct password");
        } else {
          let updateResult = await changePassword(newPassword, email);
          if (updateResult && updateResult?.rows[0]) {
            console.log(updateResult?.rows[0].id);
            data.success = 1;
            data.msg = res.locals.translate("Password updated successfully");
            //check session store and remove all the sessions of this email excluding the one with same session id
            let removeAllTokensExceptThisOneResult =
              await removeAllTokensExceptThisOne(email, token);
            //
            if (removeAllTokensExceptThisOneResult?.rows) {
              data.success = 1;
              data.msg = res.locals.translate("Password updated successfully");
            } else {
              data.success = 0;
              data.msg = res.locals.translate(
                "Error Occurred, please try later"
              );
            }
          } else {
            console.log("failed to change password");
            data.msg = res.locals.translate("Error Occurred, please try later");
          }
        }
      } else {
        data.msg = res.locals.translate("User not found");
      }
      res.json(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

Router.post("/logout", addLogoutSchema, validator, async (req, res, next) => {
  try {
    let token = res.locals.jwtAuthentication.token;
    let email = req.body.email;
    let data = { success: 0, msg: "an error occurred" };
    let removeTokenResult = await removeToken(email, token, req.sessionID);
    if (checkQueryResult(removeTokenResult)) {
      req.session.destroy();
      data.success = 1;
      data.msg = res.locals.translate("logged out successfully");
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = Router;
