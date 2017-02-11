// Declarations

const request = require('request'),
	  csv = require('csv-parser'),
	  fs = require('fs');

var _stops  = new Array(),
	_times  = new Array(),
	_trips  = new Array(),
	_routes = new Array();

// Functions (Time)

function toSeconds(time) {
	var hours   = time.substr(0, 2),
		minutes = time.substr(3, 5),
		seconds = time.substr(6, 8);
	return (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60) + parseInt(seconds);
}

function getSecondsSinceMidnight() {
	return Math.floor((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

// Functions (Initialization)

function processStops(cb) {
	fs.createReadStream('tmp/stops.txt').pipe(csv())
		.on('data', (line) => {
			
			_stops.push({
				id:   parseInt(line.stop_id),
				name: line.stop_name,
				desc: line.stop_desc,
				lat:  parseFloat(line.stop_lat),
				lng:  parseFloat(line.stop_lon)
			});
			
		}).on('end', () => {
			cb();
		});
}

function processTimes(cb) {
	fs.createReadStream('tmp/stop_times.txt').pipe(csv())
		.on('data', (line) => {
			
			_times.push({
				stop_id: parseInt(line.stop_id),
				trip_id: parseInt(line.trip_id),
				time:    toSeconds(line.arrival_time)
			});
			
		}).on('end', () => {
			_times = _times.sort((a, b) => {
				return a.time - b.time;
			}); cb();
		});
}

function processTrips(cb) {
	fs.createReadStream('tmp/trips.txt').pipe(csv())
		.on('data', (line) => {
			
			_trips.push({
				id:         parseInt(line.trip_id),
				route_id:   line.route_id,
				service_id: parseInt(line.service_id)
			});
			
		}).on('end', () => {
			cb();
		});
}

function processRoutes(cb) {
	fs.createReadStream('tmp/routes.txt').pipe(csv())
		.on('data', (line) => {
			
			_routes.push({
				id:      line.route_id,
				type:    parseInt(line.route_type),
				number:  line.route_short_name,
				color:   line.route_color
			});
			
		}).on('end', () => {
			cb();
		});
}

// Functions (Stops)

function getStopById(id) {
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		if (stop.id === id) return stop;
	}
	return null;
}

function getTimesForStop(id) {
	var times = new Array();
	
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

function getRouteForTrip(trip) {
	for (var i = 0; i < _routes.length; i++) {
		var route = _routes[i];
		
		if (route.id === trip.route_id) return route;
	}
}

// Functions (Generators)

function generateTypeOverrides() {
	var content = '';
	
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		var times = getTimesForStop(stop.id),
			types = new Array();
		
		for (var j = 0; j < times.length; j++) {
			var time = times[j];
			
			var trip = null,
				route = null;
			
			try {
				trip = getTripForTime(time);
				route = getRouteForTrip(trip);
				
				types.push(route.type);
			} catch(e) {}								
			
		}
		
		var type = types.indexOf(800) !== -1 ? 'trol' : types.indexOf(0) !== -1 ? 'tram' : types.indexOf(2) !== -1 ? 'train' : types.indexOf(4) !== -1 ? 'port' : null;
		
		if (!type) continue;
		
		process.stdout.write('Generating file... ' + parseFloat((i * 100) / _stops.length).toFixed(2) + '%\r');
		content += '\n' + stop.id + '\u00A4' + type;
	}
	
	process.stdout.write('Generating file... 100%   '); console.log(''); 
	try {
		fs.writeFile('./overrides/types.txt', content.substr(1), 'utf8'); console.log('File created!');
	} catch(e) {
		console.log('Failed to create file!');
	}
	
}

// Initialization

console.log('Downloading data...');
request({url: 'http://peatus.ee/gtfs/gtfs.zip', encoding: null}, (err, res, data) => {
	
	if (err) {
		console.log('Failed to download data!');
		process.exit();
	}
	
	console.log('Extracting data...');
	try {
		
		var zip = new require('adm-zip')(new Buffer(data));
		
		zip.extractEntryTo('stops.txt',      'tmp', false, true);
		zip.extractEntryTo('stop_times.txt', 'tmp', false, true);
		zip.extractEntryTo('trips.txt',      'tmp', false, true);
		zip.extractEntryTo('calendar.txt',   'tmp', false, true);
		zip.extractEntryTo('routes.txt',     'tmp', false, true);
		
	} catch(e) {
		console.log('Failed to extract data!');
		process.exit();
	}
	
	console.log('Preparing database...');
	try {
		
		processStops(() => {
			processTimes(() => {
				processTrips(() => {
					processRoutes(() => {
						generateTypeOverrides();
					});
				});
			});
		});
		
	} catch(e) {
		console.log('Failed to prepare database!');
		process.exit();
	}
	
});