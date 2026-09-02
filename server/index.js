const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const DBConfig = require('./conf/DBConfig');
const path = require('path');
const mysql = require('mysql2');

const server = require('http').Server(app);
const io = require('socket.io')(server);
const AppConfig = require('./conf/AppConfig');

const dbcon = mysql.createPool({
    connectionLimit: 108,
    host: DBConfig.dbhost,
    database: DBConfig.dbname,
    user: DBConfig.dbuser,
    password: DBConfig.dbpassword
  });

dbcon.on('error', function (err) {
  console.log("Error z cl: "+err);
  //logToDB(dbcon, err, 'DB error')
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    throw err;
    console.log("Blad1: "+err);
    //dbcon.end();
  }
/*  else if (err.code === 'ETIMEDOUT') {
    res.sendStatus(501);
    return;                   // cannot connect to mysql server
  }*/
  else {
    //logToDB(dbcon, err, 'DB error');// connnection idle timeout (the wait_timeout
    console.log("Błąd: "+err);
    throw err;
  }
});

const ApiRouter = require('./router')(app, io, dbcon);
const SittingsRouter = require('./routers/router_sittings')(app, io, dbcon);
const TermsRouter = require('./routers/router_terms')(app, io, dbcon);
const VotingsRouter = require('./routers/router_votings')(app, io, dbcon);
const CouncillorsRouter = require('./routers/router_councillors')(app, io, dbcon);
const ConfigsRouter = require('./routers/router_configs')(app, io, dbcon);
const UsersRouter = require('./routers/router_users')(app, io, dbcon);
const addToResponse = require('./middlewares/addToResponse');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port =  AppConfig.port;        // set our port
const sessionStore = new MySQLStore(DBConfig);
app.set('trust proxy', 1);

app.use(session({
  httpOnly: true,
  store: sessionStore,
  secret: process.env.SESSION_SECRET || '$2a$10$e8C4XrOPBO3iErdwsx6rXeCPpe4y.WCMrHqsx7TeFzwUk5QR55aIq',
  resave: true,
  saveUninitialized: false,
  cookie: { secure: process.env.COOKIE_SECURE === 'true', maxAge: 9990000 }
}));
app.use(addToResponse);
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api', ApiRouter);
app.use('/api/', SittingsRouter);
app.use('/api/', TermsRouter);
app.use('/api/', VotingsRouter);
app.use('/api/', CouncillorsRouter);
app.use('/api/', UsersRouter);
app.use('/api/', ConfigsRouter);
app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// START THE SERVER
// =============================================================================
server.listen(port, '0.0.0.0', () => {
  console.log(`erada server listening on port ${port}`);
});
io.on('connection', function (socket) {});
