const fs = require('fs');
const dotenv = require('dotenv');
const fastify = require('fastify');
const moment = require('moment');
const chalk = require('chalk');

// Show splash.
const splash = require('./package.json');
console.log(chalk`\n{yellow ${splash.description}} {blue v${splash.version}} {gray (${splash.license})}\n`);

// Load environmental variables from file.
dotenv.config();

require('./db.js');
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

// Update data and start listening on port.
data.update().then(async () => {
	const port = process.env['PORT'];
	await app.listen(port, process.env['HOST']);
	debug.log(`Started listening on port ${chalk.blue(port)}`);
}).catch((ex) => {
	console.log(ex);
	process.exit(1);
});

// Scheduled functions.
setInterval(() => {
	switch (moment().format('HHmmss')) {
		// Update data and clear caches at 6 AM.
		case '060000':
			data.update();
			cache.clear();
			break;
	}
}, 1000);
