function requiresLogin(req, res, next) {
  if (req.session && req.session.loggedUser) {
    req.session.touch();
    return next();
  } else {
    req.session.destroy(err => {
      if (err) console.log(err);
      res.clearCookie('user');
      req.session = null;
      return res.sendStatus(401);
    });
  }
}

module.exports = requiresLogin;
