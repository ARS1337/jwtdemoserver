const myPool = require("../PostGresConnectionPool");
const { currentTimestamp } = require("../utils/customMoment");
var CronJob = require("cron").CronJob;
const { removeExpiredToken, addCronLog } = require("../db");
const checkQueryResult = require("../utils/checkQueryResult");

const currDate = currentTimestamp();

const main = async () => {
  let startTime, endTime;
  try {
    startTime = currentTimestamp();
    let queryResult = await removeExpiredToken(currDate);
    endTime = currentTimestamp();
    let res = await addCronLog(
      "removeExpiredTokens",
      startTime,
      endTime,
      true,
      "cron successfully finished"
    );
  } catch (err) {
    let res = await addCronLog(
      "removeExpiredTokens",
      startTime,
      endTime,
      false,
      err
    );
    console.log(err);
  }
};

module.exports = main;
