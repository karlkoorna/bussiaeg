const chalk = require('chalk');
const moment = require('moment');

const timers = {};

// Log info message with timestamp.
function info(msg) {
	console.info(chalk.blueBright('[INFO] ' + msg), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`));
}

// Log warning message with timestamp.
function warn(msg, err) {
	console.warn(chalk.yellowBright('[WARN] ' + msg), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`), err ? '\n' + chalk.yellow(err.stack) : '');
}

// Log error message with timestamp and stop process with error code.
function error(msg, err, code = 1) {
	console.error(chalk.redBright(`[ERR${code}] ` + msg), chalk.gray(`(${moment().format('DD.MM.YYYY-HH:mm:ss')})`), '\n' + chalk.red(err.stack));
	process.exit(code);
}

// Start timing, display message if provided.
function time(id, msg) {
	if (msg) process.stdout.write(chalk.yellow('[TIME] ' + msg));
	
	timers[id] = {
		time: new Date(),
		msg
	};
}

// Display timing result.
function timeEnd(id, msg) {
	const timer = timers[id];
	if (timer.msg) process.stdout.write('\r\x1b[K'); // Move to start of previous line.
	console.log(chalk.green('[TIME] ' + msg), chalk.gray(`(${((new Date() - timer.time) / 1000).toFixed(3)}s)`));
}

module.exports = {
	info,
	warn,
	error,
	time,
	timeEnd
};
