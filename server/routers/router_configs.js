module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router
    .get('/configs', sessionMid,(req, res) => {
      const configName = req.params.configName;

      dbcon.query('SELECT `key`, `value` FROM `configs`', [configName],(err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json(results);
      });
    })
    .get('/configs', sessionMid,(req, res) => {
      const configName = req.params.configName;

      dbcon.query('SELECT `key`, `value` FROM `configs`',(err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json(results);
      });
    })
    .put('/configs', sessionMid,(req, res) => {
      const configName = req.body.configKey;
      const configValue = req.body.configValue;

      dbcon.query('UPDATE `configs` SET `value`=? WHERE `key`=?', [configValue, configName],(err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json(results.affectedRows);
      });
    });
  return toExport.router;
};
