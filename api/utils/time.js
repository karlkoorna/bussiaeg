// Returns seconds since midnight.
function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

// Converts HH:mm:ss to seconds since midnight.
function toSeconds(hms) {
	return new Date(`01 Jan 1970 ${hms} GMT`).getTime() / 1000;
}

module.exports = {
	getSeconds,
	toSeconds
};
