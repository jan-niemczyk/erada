module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router
    .get('/councillors', sessionMid, (req, res) => {
      dbcon.query('SELECT `c`.`constituency`, `c`.`uuid`, `c`.`committee`, `u`.`name`, `u`.`surname`, `u`.`can_vote` FROM `councillors` as c ' +
        'INNER JOIN `users` as u ON `c`.`users_id` = `u`.`id` ' +
        'INNER JOIN `terms` as t ON `c`.`terms_id` = `t`.`id` ' +
        'WHERE t.active=1',
        (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          res.json({councillors: results});
        });
    })
    .get('/councillors/:uuid', sessionMid, (req, res) => {
      let uuid = req.params.uuid;

      dbcon.query('SELECT `c`.`constituency`, `c`.`uuid`, `c`.`committee`, `c`.`terms_id`, `c`.`created_at`,`c`.`updated_at`,`u`.`name`, `u`.`surname`, `u`.`can_vote`, `u`.`uuid` AS users_uuid FROM `councillors` as c ' +
        'INNER JOIN `users` as u ON `c`.`users_id` = `u`.`id` ' +
        'INNER JOIN `terms` as t ON `c`.`terms_id` = `t`.`id` ' +
        'WHERE c.uuid=?',
        [uuid],
        (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          res.json({councillor: results[0]});
        })
    })
    .post('/councillor', sessionMid, (req, res) => {
      let committee = req.body.committee;
      let terms_id = req.body.terms_id;
      let constituency = req.body.constituency;
      let users_uuid = req.body.users_uuid;
      let users_id;

      dbcon.query('SELECT `id` FROM `users` WHERE `uuid`=?', [users_uuid], (err, results_id, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        users_id = results_id[0].id;

        dbcon.query('INSERT INTO `councillors` (`uuid`, `committee`, `terms_id`, `constituency`,`users_id`,`created_at`) VALUES (uuid(),?,?,?,?,CURRENT_TIMESTAMP)',
          [committee, terms_id, constituency, users_id], (err, results, fields) => {
            if (err) {
              logToDB(dbcon, err, req.session.loggedUser.email);
              res.json({error: err});
            } else {
              res.json({insertId: results.insertId});
            }
          });
      });
    })
    .put('/councillor', sessionMid, (req, res) => {
      let uuid = req.body.uuid;
      let committee = req.body.committee;
      let terms_id = req.body.terms_id;
      let constituency = req.body.constituency;
      let users_uuid = req.body.users_uuid;
      let users_id;

      dbcon.query('SELECT `id` FROM `users` WHERE `uuid`=?', [users_uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        users_id = results[0].id;

        dbcon.query('UPDATE `councillors` SET `committee`=?, `terms_id`=?, `constituency`=?,`users_id`=? WHERE `uuid`=?', [committee, terms_id, constituency, users_id, uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.json({error: err});
          } else {
            res.json({affectedRows: results.affectedRows});
          }
        });
      });
    })
    .delete('/councillors/:uuid', sessionMid, (req, res) => {
      const uuid = req.params.uuid;

      dbcon.query('DELETE FROM `councillors` WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    });

  return toExport.router;
};
