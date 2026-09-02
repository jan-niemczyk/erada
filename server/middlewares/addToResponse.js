const timestamp = require('time-stamp');

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
const requestTime = function (req, res, next) {
  if (!(req.session === null || req.session === undefined) && (req.session.loggedUser != undefined) ) {
    //const expires = (req.session.cookie._expires).toString().replace('T',' ');
    const toExpire = +(new Date(req.session.cookie._expires));
    const now = + new Date();
    res.header('timeToLogout', toExpire);
  }
  next();
}

module.exports = requestTime;
