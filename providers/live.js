const request = require('request');

function getSeconds() {
	return ~~((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

function toSeconds(time) {
	var hours = time.substr(0, 2);
	var minutes = time.substr(3, 5);
	return (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60);
}

function toHMS(seconds) {
	var hours = ~~(seconds / 3600);
	var minutes = ~~((seconds % 3600) / 60);
	seconds = seconds - (minutes * 60) - (hours * 3600);
	return { h: hours, m: minutes, s: seconds };
}

function toCountdown(seconds) {
	seconds = seconds - getSeconds();
	var time = toHMS(Math.abs(seconds));
	return (seconds < 0 ? '-' : '') + (!!time.h ? time.h + 'h ' : '') + (!!time.m ? !!time.h && time.m < 10 ? ('0' + time.m).slice(-2) + 'm ' : time.m + 'm ' : '') + (!time.h ? time.s + 's' : '');
}

function toTime(seconds) {
	var time = toHMS(seconds);
	return ('0' + time.h).slice(-2) + ':' + ('0' + time.m).slice(-2);
}

function getSiri(id, cb) {
	
	request('http://soiduplaan.tallinn.ee/siri-stop-departures.php?stopid=' + id + '&trip=' + ~~(new Date().getTime() / 100), (err, res, data) => {
		
		if (err) return cb(null);
		
		var lines = data.split('\n');
		var trips = [];
		
		if (lines[0].indexOf('ERROR') !== -1) return cb(null);
		
		lines.shift();
		lines.shift();
		
		if (lines.length < 1) return cb(null);
		
		for (var i = 0; i < (lines.length > 15 ? 15 : lines.length - 1); i++) {
			var line = lines[i];
			
			trips.push({
				sort: line.split(',')[2],
				type: line.split(',')[0],
				short_name: line.split(',')[1],
				long_name: line.split(',')[4],
				time: line.split(',')[2] !== line.split(',')[3] ? toCountdown(line.split(',')[2]) + '<img class="trip-gps" src="//bussiaeg.ee/assets/gps_' + line.split(',')[0] + '.png" alt=""></img>' : toCountdown(line.split(',')[3]) + '<img class="trip-gps" src="//bussiaeg.ee/assets/gps.png" alt="">',
				alt_time: toCountdown(line.split(',')[3]),
				panel: toTime(line.split(',')[3])
			});
			
		}
		
		cb(trips);
		
	});
	
}

function getElron(id, cb) {
	
	request('http://elron.ee/api/v1/stop?stop=' + encodeURIComponent(id), (err, res, data) => {
		
		if (err) return cb(null);
		
		var lines = JSON.parse(data).data;
		var trips = [];
		
		try {
			if (lines.text) return cb(null);
		} catch(ex) { return cb(null); }
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (toSeconds(line.plaaniline_aeg) < getSeconds()) continue;
			
			trips.push({
				type: 'train',
				short_name: line.reis,
				long_name: line.liin,
				time: toCountdown(toSeconds(line.plaaniline_aeg)) + '<img class="trip-gps" src="//bussiaeg.ee/assets/gps.png" alt="">',
				alt_time: line.plaaniline_aeg
			});
			
		}
		
		cb(trips.splice(0, 15));
		
	});
	
}

module.exports.getSiri = getSiri;
module.exports.getElron = getElron;