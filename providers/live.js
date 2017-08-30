const request = require('request');

function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

function toSeconds(time) {
	return (time.substr(0, 2) * 60 * 60) + (time.substr(3, 2) * 60) + time.substr(6, 2);
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

module.exports.getSiri = (id, cb) => {
	
	request(`https://soiduplaan.tallinn.ee/siri-stop-departures.php?stopid=${id}`, { timeout: 500 }, (err, res, data) => {
		
		if (err) return void cb();
		
		const lines = data.split('\n');
		const trips = [];
		
		if (lines[0].indexOf('ERROR') > -1) return void cb();
		
		lines.shift();
		lines.shift();
		lines.pop();
		
		if (!lines.length) return void cb();
		
		for (const line of lines) trips.push({
			sort: line.split(',')[2],
			type: line.split(',')[0],
			shortName: line.split(',')[1],
			longName: line.split(',')[4],
			time: toCountdown(line.split(',')[2]),
			altTime: toTime(line.split(',')[2]),
			gps: line.split(',')[2] === line.split(',')[3] ? 'off' : line.split(',')[0]
		});
		
		cb(trips);
		
	});
	
};

module.exports.getElron = (id, cb) => {
	
	request(`http://www.elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`, { timeout: 500 }, (err, res, data) => {
		
		if (err) return void cb();
		
		const lines = JSON.parse(data).data;
		const trips = [];
		
		if (!lines) return void cb();
		if (lines.text) return void cb();
		
		for (const line of lines) if (toSeconds(line.plaaniline_aeg) >= getSeconds()) trips.push({
			type: 'train',
			shortName: line.reis,
			longName: line.liin.split(' - ')[1],
			time: toCountdown(toSeconds(line.plaaniline_aeg)),
			altTime: line.plaaniline_aeg,
			gps: 'off'
		});
		
		cb(trips.slice(0, 15));
		
	});
	
};
