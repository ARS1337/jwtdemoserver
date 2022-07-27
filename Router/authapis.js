const express = require("express");
const Router = express.Router();
const { getUser, addUser, resetPassword } = require("../db.js");
const i18n = require("../i18n.js");
const jwt = require("jsonwebtoken");
const {
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  doesUserExistSchema,
  saveNumberSchema,
  checkOtpSchema,
} = require("../validationSchemas/authApisSchemas");
const validator = require("../middlewares/validator");

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
};

const addSaveNumberSchema = (req, res, next) => {
  res.locals.schema = saveNumberSchema;
  next();
};

const addCheckOtpSchema = (req, res, next) => {
  res.locals.schema = checkOtpSchema;
  next();
};

const addCreateAccountSchema = (req, res, next) => {
  res.locals.schema = createAccountSchema;
  next();
};

const addLoginSchema = (req, res, next) => {
  res.locals.schema = loginSchema;
  next();
};

const addDoesUserExistsSchema = (req, res, next) => {
  res.locals.schema = doesUserExistSchema;
  next();
};

const addResetPasswordSchema = (req, res, next) => {
  res.locals.schema = resetPasswordSchema;
  next();
};

Router.post(
  "/createAccount",
  addCreateAccountSchema,
  validator,
  async (req, res) => {
    try {
      const first_name = req.body.first_name;
      const last_name = req.body.last_name;
      const email = req.body.email;
      const password = req.body.password;
      const policyAccepted = req.body.policyAccepted;
      let data = {};
      let userExits = await getUser(email);
      if (!policyAccepted) {
        let data = {};
        (data.success = 1), (data.msg = "Please accept privacy policy");
        res.json(data);
      }
      if (userExits && userExits?.rows[0]) {
        data.success = 0;
        data.msg = "User already exists. Try different email.";
      } else {
        let isUserAdded = await addUser(first_name, last_name, email, password);
        if (isUserAdded.rows[0].id) {
          data.success = 1;
          data.msg = "User added successfully!";
        } else {
          data.success = 0;
          data.msg = "Error Occurred, please try later.";
        }
      }
      res.json(data || {});
    } catch (err) {
      next(err);
    }
  }
);

Router.post(
  "/doesUserExist",
  addDoesUserExistsSchema,
  validator,
  async (req, res, next) => {
    try {
      let email = req.body.email;
      let data = {};
      let userExists = await getUser(email);
      if (userExists && userExits?.rows[0]) {
        data.success = 0;
        data.msg = "user already exists";
      } else {
        data.success = 1;
        data.msg = "username available";
      }
      res.send(data || {});
    } catch (err) {
      next(err);
    }
  }
);

Router.post("/login", addLoginSchema, validator, async (req, res, next) => {
  try {
    const receivedLanguages = req.acceptsLanguages() || "en";
    req.session.translate = i18n(receivedLanguages[0]);
    const email = req.body.email;
    const password = req.body.password;
    let data = {};
    let userExits = await getUser(email);
    if (userExits && userExits?.rows[0]?.password === password) {
      data.token = generateAccessToken({ user: email });
      data.success = 1;
      data.msg = req.session.translate("login success");
    } else {
      data.success = 0;
      data.msg = req.session.translate("login failed");
    }
    res.json(data || {});
  } catch (err) {
    next(err);
  }
});

Router.post(
  "/forgotPassword/saveNumber",
  addSaveNumberSchema,
  validator,
  async (req, res) => {
    try {
      req.session.telno = req.body.telno;
      let otp = Math.floor(100000 + Math.random() * 900000);
      req.session.otp = otp;
      console.log("otp is : ", otp);
      res.json({ success: 1 });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

Router.post(
  "/forgotPassword/checkOtp",
  addCheckOtpSchema,
  validator,
  async (req, res) => {
    try {
      let receivedOtp = req.body.otp;
      if (String(receivedOtp) === String(req.session.otp))
        res.json({ success: 1 });
      else res.json({ success: 0, msg: "OTP didn't match" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

Router.post(
  "/forgotPassword/resetPassword",
  addResetPasswordSchema,
  validator,
  async (req, res) => {
    try {
      let telno = req.session.telno;
      let password = req.body.password;
      let confirmPassword = req.body.confirmPassword;
      let data = {};
      if (password === confirmPassword) {
        data.success = 0;
        console.log("setting new password to : ", password);
        let result = await resetPassword(password, telno);
        if (result && result?.rows[0]) {
          data.success = 1;
        }
      } else {
        data.success = 0;
        data.msg = "Passwords do not match";
      }
      res.json(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

module.exports = Router;
