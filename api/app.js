const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const chalk = require('chalk');

const package = require('./package.json');

// Show splash.
console.log(chalk`
{yellow ${package.description}} {blue v${package.version}} {gray (${package.license})}
`);

// Setup environmental variables from file.
dotenv.config();

// Setup database singleton.
require('./db.js');

const data = require('./data.js');

const app = express();

// Load routes dynamically from folder.
for (const file of fs.readdirSync('routes')) app.use(require(`./routes/${file}`));

// Update data and start listening on port.
data.update(() => {
	
	const port = process.env['PORT'];
	
	console.log(chalk`{green Started listening on port} {blueBright ${port}}`);
	
	app.listen(port);
	
});

// Schedule data update at 6 AM.
setInterval(() => {
	
	const date = new Date();
	
	if (date.getHours() === 6 && date.getMinutes() === 0 && date.getSeconds === 0) data.update();
	
}, 1000);
