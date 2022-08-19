const express = require("express");
const Router = express.Router();
const {
  getUser,
  addUser,
  resetPassword,
  changePassword,
  addToken,
} = require("../db.js");
const i18n = require("../i18n.js");
const jwt = require("jsonwebtoken");
const {
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  doesUserExistSchema,
  saveNumberSchema,
  checkOtpSchema,
  changePasswordSchema,
} = require("../validationSchemas/authApisSchemas");
const validator = require("../middlewares/validator");
const {
  currentTimestamp,
  timestamp30MinsForward,
  timestamp24HoursForward,
} = require("../utils/customMoment");
const returnHash = require("../utils/hash.js");
const { random } = require("../random.js");

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
  async (req, res, next) => {
    try {
      const first_name = req.body.first_name;
      const last_name = req.body.last_name;
      const email = req.body.email;
      const password = req.body.password;
      let passwordHash = await returnHash(password);
      const policyAccepted = req.body.policyAccepted;
      let data = {};
      let userExits = await getUser(email);
      if (!policyAccepted) {
        let data = {};
        data.success = 1;
        data.msg = res.locals.translate("Please accept privacy policy");
        res.json(data);
      }
      if (userExits && userExits?.rows[0]) {
        data.success = 0;
        data.msg = res.locals.translate(
          "User already exists. Try different email"
        );
      } else {
        let isUserAdded = await addUser(
          first_name,
          last_name,
          email,
          passwordHash
        );
        if (isUserAdded.rows[0].id) {
          data.success = 1;
          data.msg = res.locals.translate("User added successfully!");
        } else {
          data.success = 0;
          data.msg = res.locals.translate("Error Occurred, please try later");
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
      if (userExists && userExists?.rows[0]) {
        data.success = 0;
        data.msg = res.locals.translate("user already exists");
      } else {
        data.success = 1;
        data.msg = res.locals.translate("username available");
      }
      res.send(data || {});
    } catch (err) {
      next(err);
    }
  }
);

Router.post("/login", addLoginSchema, validator, async (req, res, next) => {
  try {
    const email = req.body.email;
    let password = req.body.password;
    let passwordHash = await returnHash(password);
    let data = {
      success: "0",
      message: "Invalid login credentials",
    };
    if (random()) {
      data = {
        success: "1",
        message: "Logged in successfully!",
        data: {
          id: 5,
          vendor_name: "Karan",
          is_verified: "Y",
          last_login: "2022-08-19T05:29:59.289648Z",
          remember_token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3RcL3BhY2t1bHQtd2ViXC92ZW5kb3JhcGlcL2xvZ2luX2FwaSIsImlhdCI6MTY2MDg4Njk5OCwiZXhwIjoxNjc2NjExNzk5LCJuYmYiOjE2NjA4ODY5OTksImp0aSI6IlhLeHpsZVlDcTNiMUp2eEsiLCJzdWIiOjUsInBydiI6IjkyM2E3Mzc1YjY1NmNhNWJiOWE3MjE2MjNmZTU5ZWI1ZjQ1MWYzZTkifQ.cpyyTNLB8GsbiDOmVSctpBg9g_7RmuA1C1v7c4bKAc8",
          vendor_company_name: "Kar Company",
          vendor_email: "karan@mail.com",
          vendor_address: null,
          pincode: null,
          phone_country_id: 1,
          phone: "7777777777",
          whatsapp_country_id: 0,
          whatsapp_no: null,
          currency_id: 0,
          is_featured: "0",
          gstin: "10AABCU9603R1ZO",
          gst_certificate: "5_certificate_02082022170128.jpg",
          approval_status: "accepted",
          approved_on: "2022-07-27 10:42:53",
          approved_by: 1,
          admin_remark: "",
          meta_title: null,
          meta_description: null,
          meta_keyword: null,
          status: "1",
          created_by: 0,
          updated_by: 0,
          deleted_at: null,
          created_at: "2022-07-27T17:41:50.000000Z",
          updated_at: "2022-08-05T11:37:40.000000Z",
          load_page: "home",
          currency: null,
          phone_country: {
            id: 1,
            phone_code: "91",
            country_name: "India",
          },
        },
      };
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
      req.session.otpEnterAttempts = 0;
      let prefix = req.body.prefix;
      let otp = Math.floor(100000 + Math.random() * 900000);
      req.session.otp = otp;
      //call the api to send otp via sms here
      req.session.noOfOTPsSent = 1;
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
      else {
        req.session.otpEnterAttempts = req.session.otpEnterAttempts + 1;
        if (req.session.otpEnterAttempts > 3) {
          req.session.destroy();
          res.json({
            success: 0,
            msg: res.locals.translate("Too many attempts"),
            redirectTo: "login",
          });
        } else {
          res.json({
            success: 0,
            msg: res.locals.translate("OTP didn't match"),
          });
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

Router.post("/forgotPassword/getNewOtp", async (req, res, next) => {
  try {
    console.log(req.sessionID);
    if (req.sessionID && req.session.noOfOTPsSent) {
      let otp = Math.floor(100000 + Math.random() * 900000);
      req.session.otp = otp;
      req.session.noOfOTPsSent = req.session.noOfOTPsSent + 1;
      console.log("otps send ", req.session.noOfOTPsSent);
      if (req.session.noOfOTPsSent > 10) {
        req.session.destroy();
        res.json({
          success: 0,
          msg: res.locals.translate("Too many attempts"),
        });
      } else {
        console.log("otp is : ", otp);
        //call api to send otp to phone number
        res.json({ success: 1, msg: "Another OTP sent!" });
      }
    } else {
      res.json({
        success: 0,
        msg: res.locals.translate("Please enter your number and try again"),
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

Router.post(
  "/forgotPassword/resetPassword",
  addResetPasswordSchema,
  validator,
  async (req, res, next) => {
    try {
      let telno = req.session.telno;
      let password = req.body.password;
      let passwordHash = await returnHash(password);
      let confirmPassword = req.body.confirmPassword;
      let data = {};
      if (password === confirmPassword) {
        data.success = 0;
        let result = await resetPassword(passwordHash, telno);
        if (result && result?.rows[0]) {
          data.success = 1;
        }
      } else {
        data.success = 0;
        data.msg = res.locals.translate("Passwords do not match");
      }
      res.json(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

module.exports = Router;
