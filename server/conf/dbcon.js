const mysql = require('mysql2');
const DBConfig = require('../conf/DBConfig');

const dbcon = mysql.createPool({
  connectionLimit: 108,
  host: DBConfig.dbhost,
  database: DBConfig.dbname,
  user: DBConfig.dbuser,
  password: DBConfig.dbpassword
});

module.exports = dbcon;
