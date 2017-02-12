// Declarations

const express = require('express'), app = express(),
	  request = require('request'),
	  csv = require('csv-parser'),
	  fs = require('fs');

const port = {http: 80, https: 443},
	  shownTrips = 15;

var _overrides = {
		descs: new Array(),
		types: new Array()
	},
	_stops  = new Array(),
	_times  = new Array(),
	_trips  = new Array(),
	_days   = new Array(),
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

function processDays(cb) {
	fs.createReadStream('tmp/calendar.txt').pipe(csv())
		.on('data', (line) => {
			
			_days.push({
				service_id: parseInt(line.service_id),
				service: [
					line.monday    == true ? true : false,
					line.tuesday   == true ? true : false,
					line.wednesday == true ? true : false,
					line.thursday  == true ? true : false,
					line.friday    == true ? true : false,
					line.saturday  == true ? true : false,
					line.sunday    == true ? true : false
				]
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

function processOverrides() {console.log('Loading overrides...');
	
	fs.readFile('overrides/descs.txt', 'utf8', (err, data) => {
		
		if (err) {
			console.log('Failed to load overrides!');
			process.exit();
		}
		
		var lines = data.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (!line.split('¤')[1]) continue;
			
			_overrides.descs[i] = {
				id:   parseInt(line.split('¤')[0]),
				desc: line.split('¤')[1]
			};
			
		}
		
	});
	
	fs.readFile('overrides/types.txt', 'utf8', (err, data) => {
		
		if (err) {
			console.log('Failed to load overrides!');
			process.exit();
		}
		
		var lines = data.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			
			if (!line.split('¤')[1]) continue;
			
			_overrides.types[i] = {
				id:   parseInt(line.split('¤')[0]),
				type: line.split('¤')[1]
			};
			
		}
		
	});
	
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
		
		var type = types.indexOf(800) !== -1 ? 'trol' : types.indexOf(0) !== -1 ? 'tram' : types.indexOf(2) !== -1 ? 'train' : types.indexOf(4) !== -1 ? 'ship' : types.indexOf(3) === -1 ? 'invalid' : null;
		
		if (!type) continue;
		
		process.stdout.write('Generating type overrides... ' + parseFloat((i * 100) / _stops.length).toFixed(2) + '%\r');
		content += '\n' + stop.id + '\u00A4' + type;
	}
	
	process.stdout.write('Generating type overrides...         '); console.log(''); 
	try {
		fs.writeFileSync('./overrides/types.txt', content.substr(1), 'utf8');
	} catch(e) {
		console.log('Failed to create file!'); process.exit();
	}
	
}

// Functions (Stops)

function getStopById(id) {
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		if (stop.id === id) return stop;
	}
	return null;
}

function getOverrideForStop(id) {
	var data = {};
	
	for (var i = 0; i < _overrides.descs.length; i++) {
		var override = _overrides.descs[i];
		
		if (override.id === id) data.desc = override.desc;
	}
	
	for (var j = 0; j < _overrides.types.length; j++) {
		var override = _overrides.types[j];
		
		if (override.id === id) data.type = override.type;
	}
	
	return data;
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

function isDayForTrip(trip) {
	for (var i = 0; i < _days.length; i++) {
		var day = _days[i];
		
		if (day.service_id !== trip.service_id) continue;
		if (!day.service[new Date().getDay()]) continue;
		
		return day;
	}
}

function getRouteForTrip(trip) {
	for (var i = 0; i < _routes.length; i++) {
		var route = _routes[i];
		
		if (route.id === trip.route_id) return route;
	}
}

function getLiveData(id, cb) {
	
	request('http://soiduplaan.tallinn.ee/siri-stop-departures.php?stopid=' + id + '&trip=' + ~~(new Date().getTime() / 100), (err, _res, data) => {
		if (err) return cb(false);
		
		var lines = data.split('\n'),
			trips = new Array();
		
		if (lines[0].indexOf('ERROR') !== -1) return cb(false);
		
		lines.shift(); lines.shift();
		
		if (lines.length < 1) return cb(false);
		
		var i = -1;
		while (i < lines.length - 2 && i < shownTrips) {i++;
			var line = lines[i];
			
			trips.push({
				type:      line.split(',')[0],
				number:    line.split(',')[1],
				scheduled: parseInt(line.split(',')[3]),
				expected:  parseInt(line.split(',')[2])
			});
			
		}
		
		return cb(true, {
			trips: trips,
			live:  true
		});
		
	});
	
}

function getStaticData(id) {
	var times = getTimesForStop(id),
		trips = new Array();
	
	var last = {};
	for (var i = 0; i < times.length; i++) {
		var time = times[i],
			trip = getTripForTime(time);
		
		if (!isDayForTrip(trip)) continue;
		if (time.time < getSecondsSinceMidnight()) continue;
		if (trips.length >= shownTrips) break;
		
		var route = getRouteForTrip(trip);
		
		try {
			if (time.time === last.time && route.number === last.number) continue;
		} catch(e) {}
		
		last.time = time.time;
		last.number = route.number;
		
		trips.push({
			type:   route.color === 'E6FA32' || route.color === 'F55ADC' || route.color === '00933C' ? 'coach' : route.type === 3 ? 'bus' : route.type === 800 ? 'trol' : route.type === 0 ? 'tram' : route.type === 2 ? 'train' : 'ship',
			number: route.number,
			time:   time.time
		});
		
	}
	
	return {
		trips: trips,
		live:  false
	};
	
}

// Initialization

setInterval(() => {
	if (getSecondsSinceMidnight() > 10800 && getSecondsSinceMidnight() < 18000) {
		console.log('Redownloading GTFS data: ' + new Date()); process.exit();
	}
}, 1000 * 60 * 60 * 2);

app.use(express.static(__dirname + '/static'));

console.log('Downloading GTFS data...');
request({url: 'http://peatus.ee/gtfs/gtfs.zip', encoding: null}, (err, res, data) => {
	
	if (err) {
		console.log('Failed to download data!');
		process.exit();
	}
	
	console.log('Extracting GTFS data...');
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
	
	console.log('Loading GTFS data...');
	try {
		
		processStops(() => {
			processTimes(() => {
				processTrips(() => {
					processDays(() => {
						processRoutes(() => {
							if (!fs.existsSync('overrides/types.txt')) generateTypeOverrides();
							
							processOverrides();
							
							require('http').createServer(app).listen(port.http, (err) => {
								console.log('HTTP listening on ' + port.http);
							});
							
							try {
								
								require('https').createServer({
									cert: fs.readFileSync('ssl.crt'),
									key:  fs.readFileSync('ssl.key'),
									ca:   fs.readFileSync('ca.crt'),
									rejectUnauthorized: false
								}, app).listen(port.https, (err) => {
									console.log('HTTPS listening on ' + port.https);
								});
								
							} catch(e) {
								console.log('HTTPS failed to start listening!');
							}
							
						});
					});
				});
			});
		});
		
	} catch(e) {
		console.log('Failed to load data!');
		process.exit();
	}
	
});

// Endpoints

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/index.html');
});

app.get('/getstops', (req, res) => {
	var lat_min = parseFloat(req.query.lat_min), lat_max = parseFloat(req.query.lat_max),
		lng_min = parseFloat(req.query.lng_min), lng_max = parseFloat(req.query.lng_max);
	
	if (isNaN(lat_min) || isNaN(lat_max) || isNaN(lng_min) || isNaN(lng_max)) {
		console.log('Got (400)');
		return res.status(400).send();
	}
	
	var stops = new Array();
	for (var i = 0; i < _stops.length; i++) {
		var stop = _stops[i];
		
		if (stop.lat > lat_min || stop.lat < lat_max) continue;
		if (stop.lng > lng_min || stop.lng < lng_max) continue;
		
		var override = getOverrideForStop(stop.id);
		stop.type = override.type ? override.type : 'bus';
		
		if (stop.type === 'invalid') continue;
		
		stops.push({
			lat:  stop.lat,
			lng:  stop.lng,
			id:   stop.id,
			type: stop.type
		});
		
	}
	
	return res.json(stops);
});

app.get('/getstop', (req, res) => {
	var id = parseInt(req.query.id);
	
	if (isNaN(id)) {
		console.log('Got (400)');
		return res.status(400).send();
	}
	
	var stop = getStopById(id);
	
	if (stop === null) {
		console.log('Got (404)');
		return res.status(404).send();
	}
	
	var override = getOverrideForStop(stop.id);
	stop.desc = override.desc ? override.desc : stop.desc;
	
	getLiveData(id, (live, data) => {
		if (live) return res.json(Object.assign(stop, data));
		
		return res.json(Object.assign(stop, getStaticData(id)));
	});
	
});