const chalk = require('chalk');
const ora = require('ora');
const moment = require('moment');

const timers = {};

// Log message with current time.
function log(message) {
	console.log(chalk`{cyan ℹ} {cyan ${message}}`, chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`));
}

// Start timing and display spinner if message provided.
function time(id, message) {
	const timer = {
		time: new Date()
	};
	
	if (message) timer.spinner = ora({
		text: chalk.yellow(`${message}...`),
		color: 'yellow',
		spinner: {
			interval: 80,
			frames: [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ]
		}
	}).start();
	
	timers[id] = timer;
}

// Display timing result.
function timeEnd(id, message) {
	const timer = timers[id];
	if (timer.spinner) timer.spinner.stop();
	console.log(chalk.green('✔'), chalk`{green ${message}} {gray (${((new Date() - timer.time) / 1000).toFixed(3)}s)}`);
}

module.exports = {
	log,
	time,
	timeEnd
};
