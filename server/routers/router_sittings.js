module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router

    .get('/sittings', sessionMid, (req, res) => {
      let query;
      if (req.session.loggedUser.role === 'admin') {
        query = 'SELECT `s`.`date`, `s`.`number`, `s`.`term_id`, `s`.`active`,`s`.`created_at`, `s`.`uuid`, `s`.`id`, COUNT(`sp`.`sittings_id`) AS presence_number ' +
          'FROM `sittings` AS s ' +
          'LEFT JOIN `sittings_presence` as sp ON `s`.`id`=`sp`.`sittings_id` ' +
          'INNER JOIN `terms` AS t ON `s`.`term_id` = `t`.`id` ' +
          'WHERE `t`.`active` = 1 ' +
          'GROUP BY `sp`.`sittings_id`, `s`.`id` ' +
          'ORDER BY `s`.`date` DESC';
        dbcon.query(query, (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          res.json({sittings: results});
        });
      } else {
        const sittings_uuid = req.body.sittings_uuid;
        let sittings_id;
        dbcon.query('SELECT `id` FROM `sittings` WHERE `uuid`=?', [sittings_uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          sittings_id = results[0];
          query = 'SELECT `s`.`date`, `s`.`number`, `s`.`term_id`, `s`.`active`,`s`.`created_at`, `s`.`uuid`, `s`.`id`, COUNT(`sp`.`councillors_id`) AS presence_number ' +
            'FROM `sittings` AS s ' +
            'LEFT JOIN `sittings_presence` as sp ON `s`.`id`=`sp`.`sittings_id` ' +
            'LEFT JOIN `councillors` AS c ON `sp`.`councillors_id` = `c`.`id` ' +
            'INNER JOIN `terms` AS t ON `s`.`term_id` = `t`.`id` ' +
            'WHERE `t`.`active` = 1 AND `s`.active = 1 ' +
            'ORDER BY `s`.`date` DESC';
          dbcon.query(query, (err, results, fields) => {
            if (err) {
              logToDB(dbcon, err, req.session.loggedUser.email);
              res.sendStatus(500);
              return;
            }
            let sittings = results;
            query = 'SELECT `s`.`uuid` AS sittings_uuid, COUNT(`sp`.`id`) AS iam ' +
              'FROM `sittings` AS s ' +
              'LEFT JOIN `sittings_presence` AS sp ON `s`.`id`=`sp`.`sittings_id` ' +
              'LEFT JOIN `councillors` AS c ON `sp`.`councillors_id` = `c`.`id` ' +
              'INNER JOIN `terms` AS t ON `s`.`term_id` = `t`.`id` ' +
              'WHERE `sp`.`councillors_id` = ? AND `t`.`active` = 1 ' +
              'GROUP BY sittings_uuid ';
            dbcon.query(query, [req.session.loggedUser.councillors_id], (err, results, fields) => {
              if (err) {
                logToDB(dbcon, err, req.session.loggedUser.email);
                res.sendStatus(500);
                return;
              }
              const presences = results;
              if (presences.length > 0) {
                presences.forEach((presence) => {
                  sittings.forEach((sitting) => {
                    if (sitting.uuid === presence.sittings_uuid && presence.iam !== 0) {
                      sitting.iam = 1;
                    }
                  })
                })
              }
              res.json({sittings: sittings});
            });
          });
        });
      }
    })
    .get('/sitting/presence-list/:sitting_uuid', sessionMid, (req, res) => {
      let sitting_uuid = req.params.sitting_uuid;
      let query;
      if (req.session.loggedUser.role === 'admin') {
        query = 'SELECT sp.uuid ,u.name, u.surname, c.committee, c.constituency, sp.created_at FROM `users` AS u ' +
          'INNER JOIN `councillors` AS c ON u.id=c.users_id ' +
          'INNER JOIN `sittings_presence` AS sp ON c.id=sp.councillors_id ' +
          'INNER JOIN `sittings` AS s ON s.id = sp.sittings_id ' +
          'WHERE s.uuid=? ' +
          'ORDER BY u.surname';
        dbcon.query(query, [sitting_uuid], (err, results) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          let sitting_presence_list = results;
          query = 'SELECT s.uuid, s.number, s.date, t.start_date, t.end_date FROM `sittings` as s ' +
            'INNER JOIN `terms` as t ON s.term_id=t.id ' +
            'WHERE s.uuid=?';
          dbcon.query(query, [sitting_uuid], (err, results) => {
            if (err) {
              logToDB(dbcon, err, req.session.loggedUser.email);
              res.sendStatus(500);
              return;
            }
            res.json({sitting_presence_list: sitting_presence_list, sitting: results});
          });
        });
      }
    })
    .delete('/sittings/presence/:uuid', (req, res) => {
      const uuid = req.params.uuid;
      dbcon.query('DELETE FROM `sittings_presence` WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({affectedRows: results.affectedRows});
      });

    })
    .get('/sittings/active', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM sittings WHERE `active` = 1', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        if (!results == []) {
          res.json({activeSitting: results[0]});
        } else
          res.json({activeSitting: []});
      });
    })
    .get('/sittings/:uuid', sessionMid, (req, res) => {
      dbcon.query('SELECT `s`.*, COUNT(`sp`.`sittings_id`) AS presence_number FROM `sittings` AS s  ' +
        'LEFT JOIN `sittings_presence` as sp ON `s`.`id`=`sp`.`sittings_id` ' +
        'WHERE `s`.`uuid`=?',
        [req.params.uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          res.json({sitting: results[0]});
        });
    })
    .post('/sitting', sessionMid, (req, res) => {
      let date = req.body.date;
      let number = req.body.number;
      let term_id = req.body.term_id;
      let active = req.body.active;

      if (active) {
        dbcon.query('UPDATE `sittings` SET `active`=0, `updated_at` = CURRENT_TIMESTAMP WHERE `active`=1', [], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          io.sockets.emit('sittings-active');
        });
      }

      dbcon.query('INSERT INTO `sittings` (`date`, `number`, `term_id`, `active`,`created_at`, `uuid`) VALUES (?,?,?,?,CURRENT_TIMESTAMP, uuid())', [date, number, term_id, active], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({insertId: results.insertId});
      });
    })
    .put('/sitting', sessionMid, (req, res) => {
      let date = req.body.date;
      let number = req.body.number;
      let term_id = req.body.term_id;
      let active = req.body.active;
      let id = req.body.id;

      if (active) {
        dbcon.query('UPDATE `sittings` SET `active`=0, `updated_at` = CURRENT_TIMESTAMP WHERE `active`=1', [], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          io.sockets.emit('sittings-active');
        });
      }

      dbcon.query('UPDATE `sittings` SET `date`=?, `number`=?, `term_id`=?, `active`=?, `updated_at` = CURRENT_TIMESTAMP WHERE `id`=?', [date, number, term_id, active, id], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({affectedRows: results.affectedRows});
      });

    })
    .put('/sitting/setActive', sessionMid, (req, res) => {
      let uuid = req.body.uuid;

      dbcon.query('UPDATE `sittings` SET `active`=0 WHERE `active`=1', [], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        dbcon.query('UPDATE `sittings` SET `active`=1 WHERE `uuid`=?', [uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          io.sockets.emit('sittings-active');
          res.json({affectedRows: results.affectedRows});
        });
      });
    })
    .delete('/sittings/:uuid', sessionMid, (req, res) => {
      let uuid = req.params.uuid;
      dbcon.query('DELETE FROM `sittings` WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    })
    .post('/sittings/presence', sessionMid, (req, res) => {
      let sittings_id = req.body.sittings_id;
      // let users_uuid = req.session.loggedUser.uuid;
      let councillors_id = req.session.loggedUser.councillors_id;

      dbcon.query('INSERT INTO `sittings_presence` (`uuid`, `sittings_id`, `councillors_id`, `created_at`) VALUES (uuid(), ?,?, CURRENT_TIMESTAMP) ',
        [sittings_id, councillors_id], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            switch (err.errno) {
              case 1062:
                res.sendStatus(422);
                return;
            }
          }
          io.sockets.emit('sittings-presence', {sittings_id: sittings_id, user: req.session.loggedUser});
          res.json({ok: true});
        });
    });

  return toExport.router;
};
