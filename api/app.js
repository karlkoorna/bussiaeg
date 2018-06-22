const fs = require('fs');
const dotenv = require('dotenv');
const fastify = require('fastify');
const chalk = require('chalk');

const package = require('./package.json');

// Show splash.
console.log(chalk`\n{yellow ${package.description}} {blue v${package.version}} {gray (${package.license})}\n`);

// Setup environmental variables from file.
dotenv.config();

const debug = require('./utils/debug.js');
const data = require('./data.js');

const app = fastify();

// Load routes dynamically from folder.
for (const file of fs.readdirSync('routes')) app.use(require(`./routes/${file}`));

// Update data and start listening on port.
const port = process.env['PORT'];

data.update().then(async () => {
	const port = process.env['PORT'];
	await app.listen(port);
	debug.info(`Started listening on port ${chalk.blue(port)}`);
});

// Schedule data update at 6 AM.
setInterval(() => {
	const date = new Date();
	if (date.getHours() === 6 && date.getMinutes() === 0 && date.getSeconds === 0) data.update();
}, 1000);
