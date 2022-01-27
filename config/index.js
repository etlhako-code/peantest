require("dotenv").config();
const { Pool } = require("pg");


const isProduction = process.env.NODE_ENV === "production";
const database =
  process.env.NODE_ENV === "test"
    ? process.env.PGDATABASE_TEST
    : process.env.PGDATABASE;

//const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${database}`;
const connectionString = `postgresql://root:12345@localhost:5432/bakery`;

const pool = new Pool({
  connectionString: isProduction
    ? process.env.DATABASE_URL 
    : connectionString,
  /*
    SSL is not supported in development
    Alternatively, you can omit the ssl configuration object
  
    */
  ssl: isProduction //
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),  //returns pool 
  end: () => pool.end(),
};
