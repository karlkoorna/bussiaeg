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

// Initialize database if needed.
db.query(fs.readFileSync('db/init.sql').toString());

// Promisify for async/await.
db.query = promisify(db.query);

module.exports = db;
