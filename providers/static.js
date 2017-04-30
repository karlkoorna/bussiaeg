const request = require('request');
const csv = require('csv-parser');
const fs = require('fs');

var _stops  = [];
var _times  = [];
var _trips  = [];
var _days   = [];
var _routes = [];

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

function processStops(cb) {
	
	_stops = [];
	
	request('http://elron.ee/api/v1/stops', (err, res, data) => {
		
		var stops = JSON.parse(data).data;
		
		for (var i = 0; i < stops.length; i++) {
			var stop = stops[i];
			
			_stops.push({
				id:   stop.peatus,
				name: stop.peatus,
				type: 'train',
				lat:  parseFloat(stop.latitude),
				lng:  parseFloat(stop.longitude)
			});
			
		}
		
		fs.createReadStream('providers/gtfs/stops.txt').pipe(csv()).on('data', (line) => {
			
			_stops.push({
				id:   line.stop_id,
				name: line.stop_name,
				type: null,
				lat:  parseFloat(line.stop_lat),
				lng:  parseFloat(line.stop_lon)
			});
			
		}).on('end', cb);
		
	});
	
}

function processTimes(cb) {
	
	_times = [];
	
	fs.createReadStream('providers/gtfs/stop_times.txt').pipe(csv()).on('data', (line) => {
		
		_times.push({
			stop_id: line.stop_id,
			trip_id: line.trip_id,
			time:    toSeconds(line.arrival_time)
		});
		
	}).on('end', () => {
		
		_times = _times.sort((a, b) => {
			return a.time - b.time;
		});
		
		cb();
		
	});
	
}

function processTrips(cb) {
	
	_trips = [];
	
	fs.createReadStream('providers/gtfs/trips.txt').pipe(csv()).on('data', (line) => {
		
		_trips.push({
			id:         line.trip_id,
			route_id:   line.route_id,
			service_id: line.service_id
		});
		
	}).on('end', cb);
	
}

function processDays(cb) {
	
	_days = [];
	
	fs.createReadStream('providers/gtfs/calendar.txt').pipe(csv()).on('data', (line) => {
		
		_days.push({
			service_id: line.service_id,
			service: [ line.monday, line.tuesday, line.wednesday, line.thursday, line.friday, line.saturday, line.sunday ]
		});
		
	}).on('end', cb);
	
}

function processRoutes(cb) {
	
	_routes = [];
	
	fs.createReadStream('providers/gtfs/routes.txt').pipe(csv()).on('data', (line) => {
		
		_routes.push({
			id:         line.route_id,
			type:       line.route_color === 'E6FA32' || line.route_color === 'F55ADC' || line.route_color === '00933C' ? 'coach' : line.route_type == 3 ? 'bus' : line.route_type == 800 ? 'trol' : line.route_type == 0 ? 'tram' : null,
			short_name: line.route_short_name,
			long_name:  line.route_long_name.split('-').slice(-1).pop(),
			owner:      line.competent_authority === 'Pärnu LV' ? 'parnu' : line.competent_authority.indexOf('Tartu') !== -1 ? 'tartu' : null
		});
		
	}).on('end', cb);
	
}

function processTypes(cb) {
	
	if (!fs.existsSync('./providers/gtfs/types.txt')) {
		
		var data = '';
		
		for (var i = 0; i < _stops.length; i++) {
			var stop = _stops[i];
			
			if (stop.type !== null) continue;
			
			var times = getTimesForStop(stop.id);
			var types = [];
			
			for (var j = 0; j < (times.length > 25 ? 25 : times.length); j++) {
				var time = times[j];
				
				types.push(getRouteForTrip(getTripForTime(time)).type);
				
			}
			
			var type = types.indexOf('trol') !== -1 ? 'trol' : types.indexOf('tram') !== -1 ? 'tram' : types.indexOf('bus') !== -1 || types.indexOf('coach') !== -1 ? 'bus' : null;
			
			process.stdout.write('Generating types... ' + parseFloat((i * 100) / _stops.length).toFixed(2) + '%\r');
			
			if (!type) continue;
			
			data += '\n' + stop.id + '\u00A4' + type;
			
		}
		
		process.stdout.write('Generating types...       \n');
		
		try {
			fs.writeFileSync('./providers/gtfs/types.txt', data.substr(1), 'utf8');
		} catch(ex) {}
		
	}
	
	var types = fs.readFileSync('./providers/gtfs/types.txt', 'utf8').toString().split('\n');
	
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		for (var j = 0; j < types.length; j++) {
			var type = types[j];
			
			if (stop.id === type.split('¤')[0]) stop.type = type.split('¤')[1];
			
		}
		
		process.stdout.write('Processing types... ' + parseFloat((i * 100) / _stops.length).toFixed(2) + '%\r');
		
	}
	
	process.stdout.write('Processing types...       \n');
	
	cb();
	
}

function getTypeForStop(id) {
	
	for (var j = 0; j < _types.length; j++) {
		var type = _types[j];
		
		if (type.id === id) return type.type;
		
	}
	
}

function getStopById(id) {
	
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		if (stop.id === id) return stop;
		
	}
	
	return null;
	
}

function getTimesForStop(id) {
	
	var times = [];
	
	for (var i = 0; i < _times.length; i++) {
		var time = _times[i];
		
		if (time.stop_id === id) times.push(time);
		
	}
	
	return times;
	
}

function getTripForTime(time) {
	
	for (var i = 0; i < _trips.length; i++) {
		var trip = _trips[i];
		
		if (trip.id === time.trip_id) return trip;
		
	}
	
}

function isDayForTrip(trip) {
	
	for (var i = 0; i < _days.length; i++) {
		var day = _days[i];
		
		if (day.service_id !== trip.service_id) continue;
		if (day.service[new Date().getDay()] == false) continue;
		
		return day;
		
	}
	
}

function getRouteForTrip(trip) {
	
	for (var i = 0; i < _routes.length; i++) {
		var route = _routes[i];
		
		if (route.id === trip.route_id) return route;
		
	}
	
}

function getStops(lat_min, lat_max, lng_min, lng_max) {
	
	var stops = [];
	
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		if (stop.lat > lat_min || stop.lat < lat_max) continue;
		if (stop.lng > lng_min || stop.lng < lng_max) continue;
		
		if (!stop.type) continue;
		
		stops.push({
			id: stop.id,
			type: stop.type,
			lat: stop.lat,
			lng: stop.lng
		});
		
	}
	
	return stops;
	
}

function getTrips(id, coaches) {
	
	var trips = [];
	var last = {};
	
	var times = getTimesForStop(id);
	
	for (var i = 0; i < times.length; i++) {
		var time = times[i];
		
		var trip = getTripForTime(time);
		
		if (!isDayForTrip(trip)) continue;
		if (time.time < getSeconds()) continue;
		
		if (trips.length >= 15) break;
		
		var route = getRouteForTrip(trip);
		
		if (coaches && route.type !== 'coach') continue;
		
		try {
			if (time.time === last.time && route.name === last.name) continue;
		} catch(ex) {}
		
		last.time = time.time;
		last.name = route.name;
		
		trips.push({
			sort: time.time,
			type: route.type,
			short_name: route.short_name,
			long_name: route.long_name,
			time: toCountdown(time.time),
			alt_time: toTime(time.time),
			owner: route.owner
		});
		
	}
	
	return trips;
	
}

function update(cb) {
	
	console.log('Downloading static data...');
	request({ url: 'http://peatus.ee/gtfs/gtfs.zip', encoding: null }, (err, res, data) => {
		
		if (err) {
			console.log('Failed to download data!');
			process.exit();
		}
		
		console.log('Extracting static data...');
		try {
			
			var zip = new require('adm-zip')(new Buffer(data));
			
			zip.extractEntryTo('stops.txt',      'providers/gtfs', false, true);
			zip.extractEntryTo('stop_times.txt', 'providers/gtfs', false, true);
			zip.extractEntryTo('trips.txt',      'providers/gtfs', false, true);
			zip.extractEntryTo('calendar.txt',   'providers/gtfs', false, true);
			zip.extractEntryTo('routes.txt',     'providers/gtfs', false, true);
			
		} catch(ex) {
			console.log('Failed to extract data!');
			process.exit();
		}
		
		console.log('Processing stops...');
		processStops(() => {console.log('Processing times...');
			processTimes(() => {console.log('Processing trips...');
				processTrips(() => {console.log('Processing days...');
					processDays(() => {console.log('Processing routes...');
						processRoutes(() => {
							processTypes(cb);
						});
					});
				});
			});
		});
		
	});
	
}

module.exports = (cb) => {
	
	update(() => {
		cb({ getStops: getStops, getStop: getStopById, getTrips: getTrips, update: update });
	});
	
};