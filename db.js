const { Pool } = require("pg");

var pool;

const connect = () => {
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    port: 5432,
    password: "admin",
    database: "postgres",
  });
};

const runQuery = async (query) => {
  let res = await pool
    .query(query)
    .then((r) => r)
    .catch((err) => console.log("error for query : ", query));
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

module.exports = { connect, getUser, addUser, resetPassword, changePassword };
