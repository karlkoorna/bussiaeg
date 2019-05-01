const util = require('util');
const mysql = require('mysql');

// Open the database connection.
const db = mysql.createConnection({
	host: process.env['DB_HOST'],
	port: process.env['DB_PORT'],
	user: process.env['DB_USER'],
	password: process.env['DB_PASS'],
	database: process.env['DB_NAME'],
	multipleStatements: true
});

// Promisify query function for async/await.
db.query = util.promisify(db.query);

module.exports = db;
