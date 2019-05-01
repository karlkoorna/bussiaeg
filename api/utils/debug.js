const chalk = require('chalk');
const moment = require('moment');

const timers = {};

// Inject parameters into message.
function inject(msg, params) {
	let i = 0;
	return msg.replace(/\?/g, () => chalk.white(params[i++]));
}

// Log info message with timestamp.
function info(msg, ...params) {
	console.info(chalk.blueBright('[INFO] ' + inject(msg, params), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`)));
}

// Log warning message with error object if provided and timestamp.
function warn(msg, ...params) {
	console.warn(chalk.yellowBright('[WARN] ' + inject(msg, params.slice(params[0] instanceof Error))), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`), params[0] instanceof Error ? '\n' + chalk.yellow(params[0].stack) : '');
}

// Log error message with error object and timestamp, stop process with code 1.
function error(msg, err, ...params) {
	console.error(chalk.redBright('[ERR1] ' + inject(msg, params)), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`), '\n' + chalk.red(err.stack));
	process.exit(1);
}

// Start timing, display message if provided.
function time(id, msg) {
	if (msg) console.log(chalk.yellow('[TIME] ' + msg));
	
	timers[id] = {
		time: new Date(),
		msg
	};
}

// Display timing result.
function timeEnd(id, msg) {
	const timer = timers[id];
	delete timers[id];
	
	console.log(chalk.green('[TIME] ' + msg), chalk.gray(`(${((new Date() - timer.time) / 1000).toFixed(3)}s)`));
}

module.exports = {
	info,
	warn,
	error,
	time,
	timeEnd
};
