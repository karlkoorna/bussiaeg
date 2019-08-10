const chalk = require('chalk');
const moment = require('moment');

const times = {};

// Return current timestamp.
function timestamp() {
	return `[${moment().format('YY-MM-DDTHH:mm:ssZ')}]`;
}

// Return concatenated string with highlighted parameters.
function highlight(parts, params) {
	return parts.reduce((prev, next, i) => {
		const param = params[i - 1];
		if (param == null || param instanceof Error) return prev + next;
		return prev + chalk.magentaBright(param) + next;
	});
}

// Return colored stacktrace form parameters if found.
function stack(color, params) {
	const err = params.find((param) => param instanceof Error);
	if (err) return '\n' + chalk[color](err.stack);
	return '';
}

// Log info message.
function info(parts, ...params) {
	console.info(chalk.blueBright(timestamp(), '[INFO] ' + highlight(parts, params)));
}

// Log warning message with optional error object.
function warn(parts, ...params) {
	console.warn(chalk.yellowBright(timestamp(), '[WARN] ' + highlight(parts, params), stack('yellow', params)));
}

// Log error message with error object, stop process with exit code 1.
function error(parts, ...params) {
	console.error(chalk.redBright(timestamp(), '[ERR1] ' + highlight(parts, params), stack('red', params)));
}

// Save timestamp for future reference.
function time(id) {
	times[id] = new Date();
}

// Log time message with duration.
function timeEnd(id) {
	return (parts, ...params) => {
		console.info(chalk.green(timestamp(), '[TIME] ' + highlight(parts, params), chalk.gray(`(${((new Date() - times[id]) / 1000).toFixed(2) + 's'})`)));
		delete times[id];
	};
}

module.exports = {
	info,
	warn,
	error,
	time,
	timeEnd
};
