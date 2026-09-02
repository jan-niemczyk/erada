function logToFile (data) {
  const timestamp =require('time-stamp');
  const fs = require('fs');
  const path = require('path');

  const today = timestamp();
  const time = (timestamp('DD-MM-YYYY HH:mm:ss'));
  const logDir = path.join(__dirname, 'log');
  const pathToLog = path.join(logDir, `log-${today}.txt`);
  const dataToSave = `${time} ${data};\n`;

  fs.mkdirSync(logDir, { recursive: true });

  fs.access(pathToLog, fs.F_OK, (err) => {
    if (err) {
      fs.writeFile(pathToLog, dataToSave, function (err) {
        if (err) return console.log(err);
      });
    }
    fs.appendFile(pathToLog, dataToSave, function (err) {
      if (err) throw err;
    });
  })


}

module.exports = logToFile;
