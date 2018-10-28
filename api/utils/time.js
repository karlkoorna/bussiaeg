// Returns seconds since midnight.
function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

// Converts HH:mm:ss to seconds.
function toSeconds(hms) {
	return (new Date(`01 Jan 1970 ${hms} GMT`)).getTime() / 1000;
}

// Converts seconds to raw hour, minute and second values.
function toTime(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return [ hours, minutes, seconds - (minutes * 60) - (hours * 3600) ];
}

// Converts seconds to countdown from current time.
function toCountdown(seconds) {
	return toTime(Math.abs(seconds - getSeconds()));
}

module.exports = {
	getSeconds,
	toSeconds,
	toTime,
	toCountdown
};
