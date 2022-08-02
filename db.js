const session = require("express-session");
const pool = require("./PostGresConnectionPool");

const runQuery = async (query) => {
  let res = await pool
    .query(query)
    .then((r) => r)
    .catch((err) => {
      console.log("error for query : ", query);
      console.log(err);
    });
  return res;
};

const getUser = async (email) => {
  let query = `select * from user_data_new where email='${email}' limit 1`;
  let res = await runQuery(query);
  return res;
};

const addUser = async (first_name, last_name, email, password) => {
  let query = `insert into user_data_new (first_name,last_name,email,password) values('${first_name}','${last_name}','${email}','${password}') returning id`;
  let res = await runQuery(query);
  return res;
};

const resetPassword = async (newPassword, telno) => {
  let query = `update user_data_new set password='${newPassword}' where telno='${telno}' returning id`;
  let res = await runQuery(query);
  return res;
};

const changePassword = async (newPassword, email) => {
  let query = `update user_data_new set password = '${newPassword}' where email='${email}' returning id`;
  let res = await runQuery(query);
  return res;
};

const addToken = async (email, token, session_id, expiry_timestamp) => {
  let query = `insert into user_tokens(email,token,session_id,expiry_timestamp) values('${email}','${token}','${session_id}','${expiry_timestamp}') returning id`;
  let res = await runQuery(query);
  return res;
};

const removeToken = async (email, token, session_id) => {
  let query = `delete from user_tokens where email='${email}' and token='${token}' and session_id='${session_id}' returning id`;
  let res = await runQuery(query);
  return res;
};

const removeSession = async (session_id) => {
  let query = `delete from user_session where sid = '${session_id}' returning sid`;
  let res = await runQuery(query);
  return res;
};

const getToken = async (token) => {
  let query = `select * from user_tokens where token ='${token}' ;`;
  let res = await runQuery(query);
  return res;
};

const getAllTokensForEmail = async (email) => {
  let query = `select token from user_tokens where email='${email}' `;
  let res = await runQuery(query);
  return res;
};

const removeAllTokensExceptThisOne = async (email, token) => {
  let query = `delete from user_tokens where email='${email}' and token != '${token}' returning id`;
  let res = await runQuery(query);
  return res;
};

const getAllSessionIdForEmail = async (email, current_session_id) => {
  let query = `select sid from user_session where sess->>'email'= '${email}' and sid !='${current_session_id}'`;
  let res = await runQuery(query);
  return res;
};

const getAllCrons = async () => {
  let query = `select * from cron_data`;
  let res = await runQuery(query);
  return res;
};

const removeExpiredToken = async (currDate) => {
  let query = `delete from user_tokens where expiry_timestamp < '${currDate}' returning id`;
  let res = await runQuery(query);
  return res;
};

const addCronLog = async (
  name,
  run_start_timestamp,
  run_end_timestamp,
  success,
  msg
) => {
  let query = `insert into cron_log (name,run_start_timestamp,run_end_timestamp,success,msg) values (
    '${name}','${run_start_timestamp}','${run_end_timestamp}','${success}','${msg}'
  )`;
  let res = await runQuery(query);
  return res;
};

module.exports = {
  getUser,
  addUser,
  resetPassword,
  changePassword,
  addToken,
  removeToken,
  removeSession,
  getToken,
  getAllTokensForEmail,
  removeAllTokensExceptThisOne,
  getAllSessionIdForEmail,
  getAllCrons,
  removeExpiredToken,
  addCronLog,
};
