const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

let secret = process.env.hashingKey;

const returnHash = async (plainText) => {
  let hash = await crypto
    .createHmac("sha256", secret)
    .update(plainText)
    .digest("base64");
  return hash;
};

module.exports = returnHash;