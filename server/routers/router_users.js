module.exports = (app, io, dbcon) => {
  const toExport = {};

  const bcrypt = require('bcrypt-nodejs');
  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router
    .get('/users', sessionMid, (req, res) => {
      dbcon.query('SELECT `uuid`, `name`, `surname`, `role` FROM `users` ' +
        'ORDER BY `surname`', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({users: results});
      });
    })
    .get('/users/logged', sessionMid, (req, res) => {
      // dbcon.query('SELECT uuid, name, surname FROM `users` ' +
      //   'ORDER BY `surname`', (err, results, fields) => {
      //   if (err) throw err;
      //});
//   res.json({users: results});
      res.json({user: req.session.loggedUser});
    })
    .get('/users/:uuid(\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b)', sessionMid, (req, res) => {
      let uuid = req.params.uuid;

      dbcon.query('SELECT `uuid`, `name`, `surname`, `can_vote`, `email` FROM `users` ' +
        'WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({user: results[0]});
      });
    })
    .get('/users/usable', sessionMid, (req, res) => {
      dbcon.query('SELECT `u`.`uuid`, `u`.`name`, `u`.`surname` FROM `users` AS u ' +
        'INNER JOIN councillors as c ON `u`.`id` != `c`.`users_id` ' +
        'WHERE `u`.`can_vote`=1 ' +
        'GROUP BY `u`.`id` ' +
        'ORDER BY `surname`', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({users: results});
      });
    })
    .post('/users', sessionMid, (req, res) => {
      let name = req.body.name;
      let surname = req.body.surname;
      let email = req.body.email;
      let password = bcrypt.hashSync(req.body.password);
      let role = req.body.role;
      let can_vote = req.body.can_vote;

      dbcon.query('INSERT INTO `users` (`uuid`, `name`, `surname`, `password`, `role`,`email`, `can_vote`, `created_at`) VALUES (uuid(),?,?,?,?,?,?,CURRENT_TIMESTAMP)', [name, surname, password, role, email, can_vote], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        let insertId = results.insertId;
        res.json({insertId: insertId});
      });
    })
    .put('/users', sessionMid, (req, res) => {
      const name = req.body.name;
      const uuid = req.body.uuid;
      const surname = req.body.surname;
      const email = req.body.email;
      const can_vote = req.body.can_vote;
      const role = req.body.role;

      dbcon.query('UPDATE `users` SET `name`=?, `surname`=?, `email`=?, `can_vote`=?, `role`=?  WHERE `uuid`=?', [name, surname, email, can_vote, role, uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    })
    .delete('/users/:uuid', sessionMid, (req, res) => {
      let uuid = req.params.uuid;

      dbcon.query('DELETE FROM `users` WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    });
  return toExport.router;
};
