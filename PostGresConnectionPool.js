const pg = require("pg");

const connectionDetails = {
  //postgres connection details
  host: "localhost",
  password: "admin",
  port: 5432,
  user: "postgres",
};

const pgPool = new pg.Pool(connectionDetails);

module.exports = pgPool;
