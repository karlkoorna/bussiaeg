function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

function toSeconds(str) {
	return (str.substr(0, 2) * 60 * 60) + (str.substr(3, 2) * 60) + (parseInt(str.substr(6, 2)) || 0);
}

function toHMS(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return [ hours, minutes, seconds - (minutes * 60) - (hours * 3600) ];
}

function toCountdown(seconds) {
	const diff = seconds - getSeconds();
	const hms = toHMS(Math.abs(diff));
	return (diff < 0 ? '-' : '') + (hms[0] ? `${hms[0]}h ` : '') + (hms[1] ? `${hms[1]}m ` : '') + (hms[0] ? '' : `${hms[2]}s`);
}

function toTime(seconds) {
	const hms = toHMS(seconds);
	return `${hms[0].toString().padStart(2, '0')}:${hms[1].toString().padStart(2, '0')}`;
}

function toDate(str) {
	return new Date(str.substr(0, 4), str.substr(4, 2) - 1, str.substr(6, 2));
}

module.exports = { getSeconds, toSeconds, toHMS, toCountdown, toTime, toDate };
