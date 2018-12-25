const fs = require('fs');
const dotenv = require('dotenv');
const fastify = require('fastify');
const chalk = require('chalk');

// Show splash.
const package = require('./package.json');
console.log(chalk`\n{yellow ${package.description}} {blue v${package.version}} {gray (${package.license})}\n`);

// Load environmental variables from file.
dotenv.config();

const db = require('./db.js');
const data = require('./data.js');
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
	debug.info(`Started listening on port ${chalk.blue(port)}`);
});

// Schedule actions.
setInterval(() => {
	
	const date = new Date();
	const time = date.getHours().toFixed(0, 2) + date.getMinutes().toFixed(0, 2) + date.getSeconds().toFixed(0, 2);
	
	switch (time) {
		
		// Update data and clear caches at 6 AM.
		case '060000':
			data.update();
			cache.clear();
			break;
		
		// Delete favorite shares at midnight.
		case '000000':
			db.query('DELETE FROM favorites');
			break;
		
	}
	
}, 1000);
