function logToDB(dbcon, value, login) {
  const logToFile = require('./logToFile');
  logToFile(`${value} ${login}`)
  dbcon.query('INSERT INTO `logs` (`value`, `login`) VALUES (?,?)', [value.toString(), login],(err, results, fields) => {
    if (err) console.log(err);
  });
}

module.exports = logToDB;
