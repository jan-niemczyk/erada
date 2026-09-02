const Config = {};

// Main application database ("erada")
Config.dbname = process.env.DB_NAME || 'erada';
Config.dbhost = process.env.DB_HOST || '127.0.0.1';
Config.dbuser = process.env.DB_USER || 'erada';
Config.dbpassword = process.env.DB_PASSWORD || 'erada';

// Session store database ("session"), used by express-mysql-session
Config.database = process.env.SESSION_DB_NAME || 'session';
Config.host = process.env.DB_HOST || '127.0.0.1';
Config.user = process.env.DB_USER || 'erada';
Config.password = process.env.DB_PASSWORD || 'erada';

module.exports = Config;
