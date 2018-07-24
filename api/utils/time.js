// Returns seconds since midnight.
function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

// Converts HH:mm:ss to seconds.
function toSeconds(hms) {
	return (new Date(`01 Jan 1970 ${hms} GMT`)).getTime() / 1000;
}

// Converts seconds to raw hour, minute and second values.
function toHMS(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return [ hours, minutes, seconds - (minutes * 60) - (hours * 3600) ];
}

// Converts seconds to countdown from current time.
function toCountdown(seconds) {
	const diff = seconds - getSeconds();
	const hms = toHMS(Math.abs(diff));
	return (diff < 0 ? '-' : '') + (hms[0] ? `${hms[0]}h ` : '') + (hms[1] ? `${hms[1]}m` : '0m');
}

// Converts seconds to HH:mm.
function toTime(seconds) {
	const hms = toHMS(seconds);
	return `${hms[0].toString().padStart(2, '0')}:${hms[1].toString().padStart(2, '0')}`;
}

module.exports = {
	getSeconds,
	toSeconds,
	toCountdown,
	toTime
};
