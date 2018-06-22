const fs = require('fs');
const mysql = require('mysql2');
const chalk = require('chalk');

// Open database connection.
const db = mysql.createConnection({
	host: process.env['DB_HOST'],
	port: process.env['DB_PORT'],
	user: process.env['DB_USER'],
	password: process.env['DB_PASS'],
	database: process.env['DB_NAME'],
	multipleStatements: true
});

// Setup tables.
db.query(fs.readFileSync('sql/tables.sql').toString());

module.exports = db;
