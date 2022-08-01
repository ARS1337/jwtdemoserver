const path = require("path");
const { getAllCrons } = require("../db");
const checkQueryResult = require("../utils/checkQueryResult");
var CronJob = require("cron").CronJob;

const returnAllCrons = async () => {
  let queryResult = await getAllCrons();
  if (checkQueryResult(queryResult)) {
    return queryResult.rows;
  } else return [];
};

const makeCronJob = (schedule, functionName) => {
    let functionToRun =require(path.join(__dirname, functionName))
  if (!functionToRun || typeof functionToRun != "function") {
    return new CronJob("* * * * *", () => {
      console.log("function not found");
    });
  }
  return new CronJob(schedule, functionToRun);
};

const cronRunner = async () => {
  let crons = await returnAllCrons();
  if (crons?.length && crons.length > 0) {
    console.log('running crons: ')
    let allCronJobs = await crons.map((cron) => {
        console.log('\t ',cron)
      return makeCronJob(cron.schedule, cron.name);
    });
    await allCronJobs.map((job) => job.start());
  } else {
    console.log("no crons found");
  }
};

module.exports = cronRunner;
