module.exports = (app, io, dbcon) => {
  const toExport = {};

  const express = require('express');
  const sessionMid = require('../session');
  const logToDB = require('../log');
  const createHtmlFile = require('../Utils/createHtmlFile');

  toExport.router = express.Router();

// w tych adresach nie potrzebuje prefixu api - dodaje go node
  toExport.router

    .get('/votingTypes', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM vote_types', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({votingTypes: results});
      });
    })
    .get('/votings', sessionMid, (req, res) => {
      let query = "";
      if (req.session.loggedUser.role == 'admin') {
        query = 'SELECT `v`.*, `vt`.`name` AS `vote_type_name`, `s`.`number` AS sitting_number, `s`.`uuid`  AS sitting_uuid, COUNT(`vr`.`id`) AS votes ' +
          'FROM `votings` AS v ' +
          'LEFT JOIN `votings_results` AS vr ON `v`.`id`=`vr`.`votings_id` ' +
          'INNER JOIN `vote_types` as vt ON `v`.`vote_type_id` = `vt`.`id` ' +
          'INNER JOIN `sittings` AS s ON `v`.`sitting_id` = `s`.`id` ' +
          'WHERE `s`.`active`= 1 ' +
          'GROUP BY `v`.`id`, `s`.`id`, `vt`.`id`  ' +
          'ORDER BY `v`.`queue` AND `v`.`active` DESC ';

        dbcon.query(query,
          (err, results, fields) => {
            if (err) throw err;
            let votings = results;

            query = 'SELECT `s`.`uuid` AS sitting_uuid, COUNT(`sp`.`id`) AS presence_number  ' +
              'FROM `sittings` AS s ' +
              'LEFT JOIN `sittings_presence` as sp ON `s`.`id`=`sp`.`sittings_id` ' +
              'LEFT JOIN `councillors` AS c ON `sp`.`councillors_id` = `c`.`id` ' +
              'INNER JOIN `terms` AS t ON `s`.`term_id` = `t`.`id` ' +
              'WHERE `s`.`active`= 1 ';
            dbcon.query(query, [], (err, results, fields) => {
              if (err) {
                logToDB(dbcon, err, req.session.loggedUser.email);
                res.sendStatus(500);
              }
              if (results.length > 0) {
                results.forEach((presence, i) => {
                  votings.forEach((voting, i2) => {
                    if (presence.sitting_uuid === voting.sitting_uuid && presence.presence_number > 0) {
                      voting.presence_number = presence.presence_number;
                    }
                  })
                })
              }
              res.json({votings: votings});

            })

          });
      } else {
        query = 'SELECT `v`.*, `vt`.`name` AS `vote_type_name`, `s`.`number` AS sitting_number, COUNT(`vr`.`id`) AS votes ' +
          'FROM `votings` AS v ' +
          'LEFT JOIN `votings_results` AS vr ON `v`.`id`=`vr`.`votings_id` ' +
          'INNER JOIN `vote_types` as vt ON `v`.`vote_type_id` = `vt`.`id` ' +
          'INNER JOIN `sittings` AS s ON `v`.`sitting_id` = `s`.`id` ' +
          'INNER JOIN `sittings_presence` AS sp ON `s`.`id`=`sp`.`sittings_id` ' +
          'WHERE `s`.`active`= 1 ' +
          'AND `v`.`active`=1 ' +
          'AND `sp`.`councillors_id`=? ' +
          'ORDER BY `v`.`created_at` DESC';

        dbcon.query(query, [req.session.loggedUser.councillors_id], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          votings = results;
          dbcon.query('SELECT `v`.uuid, COUNT(`vr`.`id`) AS v, vr.result  FROM `votings` AS v ' +
            'LEFT JOIN `votings_results` AS vr ON `v`.`id`=`vr`.`votings_id` ' +
            'INNER JOIN `vote_types` as vt ON `v`.`vote_type_id` = `vt`.`id` ' +
            'INNER JOIN `sittings` AS s ON `v`.`sitting_id` = `s`.`id` ' +
            'WHERE `s`.`active`= 1 AND `v`.`active`=1 AND `vr`.`councillors_id`=?  ' +
            'GROUP BY v.id, vr.id', [req.session.loggedUser.councillors_id], (err, results, fields) => {
            if (err) {
              logToDB(dbcon, err, req.session.loggedUser.email);
              res.sendStatus(500);
            }
            res.json({votings: votings, v: results});
          });
        });
      }

    })
    .get('/votings/active', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM votings WHERE `active` = 1', (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        if (!results == []) {
          res.json({activeVoting: results[0]});
        } else
          res.json({activeVoting: []});
      });
    })
    .get('/votings/:uuid', sessionMid, (req, res) => {
      dbcon.query('SELECT * FROM votings WHERE uuid=?', [req.params.uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        res.json({voting: results[0]});
      });
    })
    .get('/votings/last/:id', sessionMid, (req, res) => {
      let sitting_id = req.params.id;
      dbcon.query('SELECT COALESCE(COUNT(id), 0) AS last_queue FROM `votings` AS v WHERE `sitting_id`=?', [sitting_id], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.send(results[0]);
      });
    })
    .post('/voting', sessionMid, (req, res) => {
      let queue = req.body.queue;
      let name = req.body.name;
      let sitting_id = req.body.sitting_id;
      let vote_type_id = req.body.vote_type_id;
      let active = req.body.active;

      if (active) {
        dbcon.query('UPDATE `votings` SET `active`=0, `updated_at` = CURRENT_TIMESTAMP WHERE `active`=1', [], (err, results, fields) => {
          // dbcon.query('INSERT INTO `votings` (`uuid`, `name`, `queue`,`sitting_id`, `vote_type_id`, `active`,`created_at`) VALUES (uuid(),TRIM(?),?,?,?,?,CURRENT_TIMESTAMP)',
          //   [name, queue, sitting_id, vote_type_id, active], (err, results, fields) => {
          //   if (err) console.log(err);
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          io.sockets.emit('new-voting-active');
          //   res.json({insertId: results.insertId});
          // });
        });
      }
      dbcon.query('INSERT INTO `votings` (`uuid`, `name`, `queue`,`sitting_id`, `vote_type_id`, `active`,`created_at`) VALUES (uuid(),TRIM(?),?,?,?,?,CURRENT_TIMESTAMP)',
        [name, queue, sitting_id, vote_type_id, active], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          //   io.sockets.emit('new-voting-active');
          res.json({insertId: results.insertId});
        });
    })
    .post('/votings/vote', sessionMid, (req, res) => {
      if (!req.session.loggedUser.can_vote) {
        res.send('Nie możesz głosować');
        return;
      }
      const result = req.body.result;
      const voting_uuid = req.body.uuid;

      dbcon.query('SELECT `id` FROM `votings` WHERE `uuid`=?', [voting_uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.json({error: err});
        } else {
          const votings_id = results[0].id;
          const councillors_id = req.session.loggedUser.councillors_id;
          dbcon.query('INSERT INTO `votings_results` (`councillors_id`, `votings_id`, `result`, `created_at`) VALUES (?,?,?, CURRENT_TIMESTAMP)',
            [councillors_id, votings_id, result], (err, results, fields) => {
              logToDB(dbcon, `Oddany głos ${result} w glosowaniu ${votings_id}`, req.session.loggedUser.email);
              if (err) {
                logToDB(dbcon, err, req.session.loggedUser.email);
                res.json(err);
              } else {
                io.sockets.emit('vote', {voting_uuid: voting_uuid, user: req.session.loggedUser, result: result});
                res.json({'status': 'ok'});
              }
            });
        }
      })
    })
    .put('/voting', sessionMid, (req, res) => {
      let name = req.body.name;
      let queue = req.body.queue;
      let sitting_id = req.body.sitting_id;
      let vote_type_id = req.body.vote_type_id;
      let active = req.body.active;
      let uuid = req.body.uuid;
      let id = req.body.id;

      if (active) {
        dbcon.query('UPDATE `votings` SET `active`=0, `updated_at` = CURRENT_TIMESTAMP WHERE `active`=1', [], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          io.sockets.emit('new-voting-active');
        });
      }

      dbcon.query('UPDATE `votings` SET `name`=?, `queue`=?,`sitting_id`=?, `vote_type_id`=?, `active`=?,`updated_at`=CURRENT_TIMESTAMP WHERE `uuid`=?', [name, queue, sitting_id, vote_type_id, active, uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });

    })
    .delete('/votings/:uuid', sessionMid, (req, res) => {
      let uuid = req.params.uuid;
      dbcon.query('DELETE FROM `votings` WHERE `uuid`=?', [uuid], (err, results, fields) => {
        logToDB(dbcon, `Usunieto glosowanie ${uuid}`, req.session.loggedUser.email);

        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    })
    .delete('/vote/:id', sessionMid, (req, res) => {
      let id = req.params.id;
      dbcon.query('DELETE FROM `votings_results` WHERE `id`=?', [id], (err, results, fields) => {
        logToDB(dbcon, `Usunieto glos ${id}`, req.session.loggedUser.email);
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        res.json({affectedRows: results.affectedRows});
      });
    })
    .post('/votings/print-result/:uuid', sessionMid, (req, res) => {

      res.send(createHtmlFile(req.body));
    })
    .get('/votings/result/:uuid', sessionMid, (req, res) => {
      let vr_uuid = req.params.uuid;
      dbcon.query('Select `vr`.`result`, `vr`.`id` AS vr_id, `c`.`id` AS councillors_id, `u`.`name`, `u`.`surname` FROM votings_results AS vr ' +
        'INNER JOIN votings as v ON `vr`.`votings_id`=`v`.`id` ' +
        'INNER JOIN sittings AS s ON `v`.`sitting_id`=`s`.`id` ' +
        'INNER JOIN councillors as c ON `vr`.`councillors_id`=`c`.`id` ' +
        'INNER JOIN users as u ON `c`.`users_id` = `u`.`id` ' +
        'WHERE `v`.`uuid`=? ' +
        'ORDER BY `u`.`surname`', [vr_uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        //wynik glosowania kazdego radnego
        const councillors_result = results;
        dbcon.query('Select COUNT(`sp`.`id`) AS presence_number,`v`.`name`, `v`.`queue`, `s`.`number`, `s`.`uuid` AS uuid, `s`.`date` AS date, `t`.`start_date`, `t`.`end_date` FROM `sittings` AS s ' +
          'INNER JOIN votings AS v ON `s`.`id`=`v`.`sitting_id` ' +
          'INNER JOIN terms AS t ON `s`.`term_id`=`t`.`id` ' +
          'INNER JOIN sittings_presence AS sp on `s`.`id`=`sp`.`sittings_id` ' +
          'WHERE `v`.`uuid`=? ', [vr_uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
            return;
          }
          const sitting = results[0]
          dbcon.query('Select `sp`.`councillors_id`, `u`.`name`, `u`.`surname` From `sittings_presence` AS sp ' +
            'INNER JOIN sittings AS s on `s`.`id`=`sp`.`sittings_id` ' +
            'INNER JOIN votings AS v ON `s`.`id`=`v`.`sitting_id` ' +
            'INNER JOIN councillors AS c ON `sp`.`councillors_id`=`c`.`id` ' +
            'INNER JOIN users as u ON `c`.`users_id` = `u`.`id` ' +
            'WHERE `v`.`uuid`=? ', [vr_uuid], (err, results, fields) => {
            if (err) {
              logToDB(dbcon, err, req.session.loggedUser.email);
              res.sendStatus(500);
              return;
            }
            const present = results;
            dbcon.query('Select `votings`.`active` From `votings` ' +
              'WHERE `votings`.`uuid`=? ', [vr_uuid], (err, results, fields) => {
              if (err) {
                logToDB(dbcon, err, req.session.loggedUser.email);
                res.sendStatus(500);
                return;
              }
              const isVotingActive = results[0].active;
              res.json({result: councillors_result, sitting: sitting, present: present, active: isVotingActive});
            })
          })
        })
      })
    })
    .put('/voting/setActive', sessionMid, (req, res) => {
      let uuid = req.body.uuid;

      dbcon.query('UPDATE `votings` SET `active`=0 WHERE `active`=1', [], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
        }
        dbcon.query('UPDATE `votings` SET `active`=1 WHERE `uuid`=?', [uuid], (err, results, fields) => {
          if (err) {
            logToDB(dbcon, err, req.session.loggedUser.email);
            res.sendStatus(500);
          }
          io.sockets.emit('new-voting-active');
          res.json({affectedRows: results.affectedRows});
        });
      });
    })
    .put('/voting/setNotActive', sessionMid, (req, res) => {
      let uuid = req.body.uuid;

      dbcon.query('UPDATE `votings` SET `active`=0 WHERE `uuid`=?', [uuid], (err, results, fields) => {
        if (err) {
          logToDB(dbcon, err, req.session.loggedUser.email);
          res.sendStatus(500);
          return;
        }
        io.sockets.emit('voting-not-active');
        res.json({affectedRows: results.affectedRows});
      });
    })

  return toExport.router;
};
