const moment = require("moment");

const formatForInsertingToken = "yyyy-MM-DD hh:mm:ss";

const timestamp24HoursForward = (format = formatForInsertingToken) => {
  try {
    let date = moment().add(24, "hours").format(format);
    return date;
  } catch (err) {
    console.log(err);
  }
};

const currentTimestamp = (format = formatForInsertingToken) => {
  try {
    let date = moment().format(format);
    return date;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  currentTimestamp,
  timestamp24HoursForward,
};
