const fs = require('fs');
const { promisify } = require('util');
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

// Recreate tables (only in production).
if (process.env['NODE_ENV'] !== 'development') db.query(fs.readFileSync('sql/init.sql').toString());

// Promisify for async/await.
db.query = promisify(db.query);

module.exports = db;
