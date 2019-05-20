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

// Add support for named parameters in queries.
db.config.queryFormat = (query, values) => {
	if (!values) return query;
	
	// Keep unnamed parameter support.
	if (Array.isArray(values)) {
		let i = 0;
		return query.replace(/\?/g, () => db.escape(values[i++]));
	}
	
	return query.replace(/:(\w+)/g, (match, key) => db.escape(values[key]));
};

// Promisify query function for async/await.
db.query = util.promisify(db.query);

module.exports = db;
