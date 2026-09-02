module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const bcrypt = require('bcrypt-nodejs');
  const sessionMid = require('./session');
  const logToDB = require('./log');
  const logToFile = require('./logToFile');
  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router
    .get('/set-uy', (req, res) => {})

    .post('/login', (req, res) => {
      let email = req.body.email;
      let password = req.body.password;

      dbcon.query('SELECT * FROM `users` WHERE `email`=?', [email], (err, results, fields) => {
        if (err) {
          logToFile(err);
          res.sendStatus(503);
          return;
        }
        if (results.length === 0) {
          logToDB(dbcon, 'Błędne logowanie! '+password, email);
          res.sendStatus(400);
        } else {
          const hashedPassword = results[0].password;
          const compareResult = bcrypt.compareSync(password, hashedPassword);
          if (compareResult) {
            let uuid = results[0].uuid;
            let role = results[0].role;
            let name = results[0].name;
            let email = results[0].email;
            let surname = results[0].surname;
            let can_vote = results[0].can_vote;

            req.session.loggedUser = {
              uuid: uuid,
              role: role,
              name: name,
              email: email,
              surname: surname,
              can_vote: can_vote,
            };
            if (role == 'user') {
              dbcon.query('SELECT `c`.`id` FROM `councillors` AS c ' +
                'INNER JOIN `users` as u ON `c`.`users_id` = `u`.`id` ' +
                'WHERE `u`.`uuid`=?', [uuid], (err, results, fields) => {
                if (err) {
                  logToDB(dbcon, err, req.session.loggedUser.email);
                  res.sendStatus(500);
                  return;
                }
                  req.session.loggedUser.councillors_id = results[0].id;
                  res.json({user: req.session.loggedUser});
                }
              )
            } else {
              dbcon.query('', (err, results, fields) => {

              });
              logToDB(dbcon,"Zalogowano ", req.session.loggedUser.email);
              res.json({user: req.session.loggedUser})
            }
          } else {
            logToDB(dbcon, 'Błędne logowanie! '+password, email);
            res.sendStatus(400);
          }
        }
      });
    })
    .delete('/logout', sessionMid, (req, res) => {
      logToDB(dbcon,"Wylogowanie", req.session.loggedUser.email);
      req.session.destroy(err => {

        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.send('Brak uprawnien');
        }
        res.json({ok: "ok"});
      })
    })
    .get('/constituencies', sessionMid, (req, res) => {
      dbcon.query('SELECT constituency FROM `constituency_ward`', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        let c = [];
        results.forEach((e, i, arr) => {
          c.push(e.constituency);
        });
        res.json({constituencies: c});
      });
    });

  return toExport.router;
};
