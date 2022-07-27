const Joi = require("joi");

const createAccountSchema = Joi.object({
  first_name: Joi.string()
    .required()
    .min(1)
    .messages({ "string.base": `"a" should be a type of 'text'` }),
  last_name: Joi.string().required().min(1),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
  policyAccepted: Joi.boolean().required().messages({
    "boolean.base": "Please check the privacy policy before proceeding",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(30),
});

const doesUserExistSchema = Joi.object({
  email: Joi.string().required().email(),
});

const saveNumberSchema = Joi.object({
  telno: Joi.number().required().min(0000000000).max(9999999999),
  prefix: Joi.string().required().min(3).max(3),
});

const checkOtpSchema = Joi.object({
  otp: Joi.number().required().min(000000).max(999999),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(8).max(30),
  confirmPassword: Joi.string().required().min(8).max(30),
});

const changePasswordSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(30),
  newPassword: Joi.string().required().min(8).max(30),
});

module.exports = {
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  doesUserExistSchema,
  saveNumberSchema,
  checkOtpSchema,
  changePasswordSchema,
};
