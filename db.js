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

const getUser = async (user) => {
  let res = await pool
    .query(`select * from user_data where username='${user}' limit 1`)
    .then((r) => r)
    .catch((err) => console.log(err));
  return res;
};

module.exports = { connect, getUser };
