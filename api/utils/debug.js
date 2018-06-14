const chalk = require('chalk');
const ora = require('ora');
const moment = require('moment');

const timers = {};

// Display info message with time.
function info(text, time) {
	console.log(chalk`{blueBright ℹ} {cyan ${text}}`, chalk.gray(`(${moment().format('HH:mm:ss - DD.MM.YYYY')})`));
}

// Start timing and display spinner if text provided.
function time(id, text) {
	
	const timer = {
		time: new Date()
	};
	
	if (text) timer.spinner = ora({
		text: chalk.yellow(`${text}...`),
		spinner: {
			interval: 80,
			frames: [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ]
		}
	}).start();
	
	timers[id] = timer;
	
}

// Display timing results.
function timeEnd(id, text) {
	
	const timer = timers[id];
	const spinner = timer.spinner;
	
	if (spinner) spinner.stop();
	
	console.log(chalk.green('✔'), chalk`{green ${text}} {gray (${((new Date() - timer.time) / 1000).toFixed(3)}s)}`);
	
}

module.exports = {
	info,
	time,
	timeEnd
}
