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

// Load routes dynamically from folder.
for (const file of fs.readdirSync('routes')) app.register(require(`./routes/${file}`));

// Update data and start listening on port.
data.update().then(async () => {
	const port = process.env['PORT'];
	await app.listen(port, '0.0.0.0');
	debug.info(`Started listening on port ${chalk.blue(port)}`);
});

// Schedule data update.
setInterval(() => {
	
	const date = new Date();
	const time = date.getHours().toFixed(0, 2) + date.getMinutes().toFixed(0, 2) + date.getSeconds().toFixed(0, 2);
	
	switch (time) {
		case '060000': return void data.update();
		case '000000': return void db.query('DELETE FROM favorites');
	}
	
}, 1000);
