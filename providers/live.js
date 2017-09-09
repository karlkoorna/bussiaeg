const request = require('request');
const utils = require('../utils.js');

let elron = {};

setInterval(() => {
	elron = {};
}, 3600);

function getTLT(id, cb) {
	
	request(`https://soiduplaan.tallinn.ee/siri-stop-departures.php?stopid=${id}`, { timeout: 1000 }, (err, res, data) => {
		
		if (err) return void cb([]);
		
		const lines = data.split('\n');
		const trips = [];
		
		if (lines[0].indexOf('ERROR') > -1) return void cb([]);
		
		lines.shift();
		lines.shift();
		lines.pop();
		
		if (!lines.length) return void cb([]);
		
		for (const line of lines) trips.push({
			sort: line.split(',')[2],
			type: line.split(',')[0],
			shortName: line.split(',')[1],
			longName: line.split(',')[4],
			time: utils.toCountdown(line.split(',')[2]),
			altTime: utils.toTime(line.split(',')[2]),
			gps: line.split(',')[2] === line.split(',')[3] ? 'off' : line.split(',')[0]
		});
		
		cb(trips);
		
	});
	
}

function getElronCache(id, cb) {
	
	const trips = [];
	
	for (const line of elron[id]) if (utils.toSeconds(line.plaaniline_aeg) >= utils.getSeconds()) trips.push({
		type: 'train',
		shortName: line.reis,
		longName: line.liin.split(' - ')[1],
		time: utils.toCountdown(utils.toSeconds(line.plaaniline_aeg)),
		altTime: line.plaaniline_aeg,
		gps: 'off'
	});
	
	cb(trips.slice(0, 15));
	
}

function getElron(id, cb) {
	
	if (elron[id]) return void getElronCache(id, cb);
	
	request(`http://www.elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`, { timeout: 1000 }, (err, res, data) => {
		
		if (err) return void cb([]);
		
		const lines = JSON.parse(data).data;
		
		if (!lines) return void cb([]);
		if (lines.text) return void cb([]);
		
		elron[id] = lines;
		
		getElronCache(id, cb);
		
	});
	
}

module.exports = { getTLT, getElron };
