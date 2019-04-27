const fs = require('fs');
const dotenv = require('dotenv');
const fastify = require('fastify');
const moment = require('moment');
const chalk = require('chalk');

// Show splash.
const splash = require('./package.json');
console.log(chalk`\n{underline.magentaBright ${splash.description} v${splash.version}} {gray (${splash.license})}\n`);

// Load environment variables from file.
dotenv.config();

require('./db.js');
const data = require('./data.js');
const banner = require('./routes/banner.js');
const cache = require('./utils/cache.js');
const debug = require('./utils/debug.js');

// Initialize HTTP server.
const app = fastify();

// Register custom error handler.
app.setErrorHandler((err, req, res) => {
	res.send(err.stack);
});

// Dynamically register routes from folder.
for (const file of fs.readdirSync('routes')) {
	const route = require(`./routes/${file}`);
	app.register(route.handler || route);
}

// Update data and start listening on port.
data.update().then(async () => {
	try {
		await app.listen(process.env['PORT'], process.env['HOST']);
		debug.info('Started listening on port ' + process.env['PORT']);
	} catch (ex) {
		debug.error('Failed to start listening on port ' + process.env['PORT'], ex);
	}
}).catch((ex) => {
	debug.error('Failed to update data', ex);
});

// Scheduled functions.
setInterval(() => {
	switch (moment().format('HHmmss')) {
		case '000000': // Update banner at midnight.
			banner.update();
			break;
		case '060000': // Update data and clear cache at 6 AM.
			data.update();
			cache.clear();
			break;
	}
}, 1000);
