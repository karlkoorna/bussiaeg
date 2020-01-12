const chalk = require('chalk');
const moment = require('moment');

const times = {};

// Current timestamp.
function timestamp() {
	return `[${moment().format('YY-MM-DDTHH:mm:ssZ')}]`;
}

// Concatenate string and highlight parameters.
function highlight(parts, params) {
	return parts.reduce((prev, next, i) => {
		const param = params[i - 1];
		if (param == null || param instanceof Error) return prev + next;
		return prev + chalk.magentaBright(param) + next;
	});
}

// Format error stacktrace form parameters.
function stacktrace(colorFn, params) {
	const err = params.find((param) => param instanceof Error);
	if (err) return '\n' + colorFn(err.stack);
	return '';
}

// Log info message.
function info(parts, ...params) {
	console.info(chalk.blueBright(timestamp(), '[INFO] ' + highlight(parts, params)));
}

// Log warning message with optional stacktrace.
function warn(parts, ...params) {
	console.warn(chalk.yellowBright(timestamp(), '[WARN] ' + highlight(parts, params), stacktrace(chalk.yellow, params)));
}

// Log error message with optional stacktrace.
function error(parts, ...params) {
	console.error(chalk.redBright(timestamp(), '[ERR] ' + highlight(parts, params), stacktrace(chalk.red, params)));
}

// Set time reference message.
function time(id) {
	times[id] = new Date();
}

// Log time message.
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
