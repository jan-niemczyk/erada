module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router
    .get('/terms', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM `terms` ORDER By `start_date` DESC', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({terms: results});
      });
    })
    .get('/terms/active', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM `terms` WHERE `active` = 1', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        if (!results == []) res.json({activeTerm: results[0]});
      });
    })
    .get('/terms/:id', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM `terms` WHERE `id`=?', [req.params.id], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({term: results[0]});
      });
    })
    .post('/term', sessionMid, (req, res) => {
      let sdate = req.body.start_date;
      let edate = req.body.end_date;
      let active = req.body.active;

      if (active) {
        dbcon.query('UPDATE `terms` SET `active`=0 WHERE `active`=1', [], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
        });
      }

      dbcon.query('INSERT INTO `terms` (`start_date`, `end_date`, `active`, `created_at`, `uuid`) VALUES (?,?,?,CURRENT_TIMESTAMP, uuid())', [sdate, edate, active], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        let insertId = results.insertId;
        res.json({insertId: insertId});
      });
    })
    .put('/term', sessionMid, (req, res) => {
      let sdate = req.body.start_date;
      let edate = req.body.end_date;
      let active = req.body.active;
      let id = req.body.id;

      if (active) {
        dbcon.query('UPDATE `terms` SET `active`=0, `updated_at` = CURRENT_TIMESTAMP WHERE `active`=1', [], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
        });
      }

      dbcon.query('UPDATE `terms` SET `start_date`=?, `end_date`=?, `active`=?, `updated_at` = CURRENT_TIMESTAMP WHERE `id`=?', [sdate, edate, active, id], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({affectedRows: results.affectedRows});
      });

    })
    .delete('/terms/:id', sessionMid, (req, res) => {
      let id = req.params.id;

      dbcon.query('DELETE FROM `terms` WHERE `id`=?', [id], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({affectedRows: results.affectedRows});
      });
    });

  return toExport.router;
};
