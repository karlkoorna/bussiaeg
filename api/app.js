const fs = require('fs');
const tls = require('tls');
const dotenv = require('dotenv');
const fastify = require('fastify');
const moment = require('moment');
const chalk = require('chalk');

// Show splash.
const splash = require('./package.json');
console.log(chalk`\n{underline.magentaBright ${splash.description} v${splash.version}} {gray (${splash.license})}\n`);

// Load environment variables from file.
dotenv.config();

// Allow requests to sites with TLSv1 certificates.
tls.DEFAULT_MIN_VERSION = 'TLSv1';

const db = require('./db.js');
const data = require('./data.js');
const cache = require('./utils/cache.js');
const debug = require('./utils/debug.js');

// Initialize HTTP server.
const app = fastify();

// Register custom error handler.
app.setErrorHandler((err, req, res) => {
	res.send(err.stack);
});

// Dynamically register routes from folder.
for (const file of fs.readdirSync('routes')) app.register(require(`./routes/${file}`));

// Initialize database if needed, update data and start listening on port.
(async function() {
	try {
		await db.query(fs.readFileSync('data/init.sql').toString());
	} catch (ex) {
		debug.error('Failed to initialize database', ex);
	}
	
	await data.update();
	
	try {
		await app.listen(process.env['PORT'], process.env['HOST']);
		debug.info('Started listening on port ' + process.env['PORT']);
	} catch (ex) {
		debug.error('Failed to start listening on port ' + process.env['PORT'], ex);
	}
})();

// Scheduled functions.
setInterval(() => {
	switch (moment().format('HHmmss')) {
		case '060000': // Update data and clear cache at 6 AM.
			data.update();
			cache.clear();
			break;
	}
}, 1000);
