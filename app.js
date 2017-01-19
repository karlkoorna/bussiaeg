// Declarations

const express = require('express'), app = express(),
	  request = require('request'),
	  csv = require('csv-parser'),
	  fs = require('fs');

const port = {http: 80, https: 443},
	  shownTrips = 10;

var _overrides = new Array(),
	_stops     = new Array(),
	_days      = new Array(),
	_times     = new Array(),
	_trips     = new Array(),
	_routes    = new Array();

app.use(express.static(__dirname + '/static'));

// Function

function toSeconds(time) {
	var hours   = time.substring(0, 2),
		minutes = time.substring(3, 5),
		seconds = time.substring(6, 8);
	return (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60) + parseInt(seconds);
}

// Initialization

console.log('Loading overrides...');
fs.readFile('overrides.txt', 'utf8', (err, data) => {
	if (err) {
		console.log('Failed to load overrides!');
		process.exit();
	}
	
	var lines = data.split('\n');
	
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		
		_overrides[i] = {
			id:   parseInt(line.split('¤')[0]),
			desc: line.split('¤')[1],
		};
		
	}
	
});

console.log('Downloading data...');
request({url: 'http://peatus.ee/gtfs/gtfs.zip', encoding: null}, (err, res, data) => {
	if (err) {
		console.log('Failed to download data!');
		process.exit();
	}
	
	console.log('Extracting data...');
	try {
		
		let zip = new require('adm-zip')(new Buffer(data));
		
		zip.extractEntryTo('stops.txt',      'tmp', false, true);
		zip.extractEntryTo('calendar.txt',   'tmp', false, true);
		zip.extractEntryTo('stop_times.txt', 'tmp', false, true);
		zip.extractEntryTo('trips.txt',      'tmp', false, true);
		zip.extractEntryTo('routes.txt',     'tmp', false, true);
		
	} catch(e) {
		console.log('Failed to extract data!');
		process.exit();
	}
	
	console.log('Preparing database...');
	try {
		
		processStops(() => {
			processTimes(() => {
				processDays(() => {
					processTrips(() => {
						processRoutes(() => {
							
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
		console.log('Failed to prepare database!');
		process.exit();
	}
	
});

function processStops(cb) {
	fs.createReadStream('tmp/stops.txt').pipe(csv())
		.on('data', (line) => {
			
			_stops.push({
				id:   parseInt(line.stop_id),
				name: line.stop_name,
				desc: line.stop_desc,
				lat:  parseFloat(line.stop_lat),
				lng:  parseFloat(line.stop_lon),
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

function processDays(cb) {
	fs.createReadStream('tmp/calendar.txt').pipe(csv())
		.on('data', (line) => {
			
			_days.push({
				service_id: parseInt(line.service_id),
				service: {
					mon: line.monday    == true ? true : false,
					tue: line.tuesday   == true ? true : false,
					wed: line.wednesday == true ? true : false,
					thu: line.thursday  == true ? true : false,
					fri: line.friday    == true ? true : false,
					sat: line.saturday  == true ? true : false,
					sun: line.sunday    == true ? true : false
				}
			});
			
		}).on('end', () => {
			cb();
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

// Functions

function getStopAtPoint(lat, lng) {
	for (let i = 0; i < _stops.length; i++) {
		let stop = _stops[i];
		
		if (Math.abs(lat - stop.lat) > radius / 2.5) continue;
		if (Math.abs(lng - stop.lng) > radius) continue;
		
		return stop;
	}
	return null;
}

function getOverrideForStop(id) {
	for (let i = 0; i < _overrides.length; i++) {
		let override = _overrides[i];
		
		if (override.id !== id) continue;
		
		return override.desc.replace(/[\\$'"]/g, '\\$&');
	}
	return null;
}

function getTimesForStop(id) {
	var times = new Array();
	
	for (let i = 0; i < _times.length; i++) {
		let time = _times[i];
		
		if (time.stop_id !== id) continue;
		
		times.push(time);
	}
	
	return times;
}

function getTripForTime(time) {
	for (let i = 0; i < _trips.length; i++) {
		let trip = _trips[i];
		
		if (trip.id !== time.trip_id) continue;
		
		return trip;
	}
}

function getRouteForTrip(trip) {
	for (let i = 0; i < _routes.length; i++) {
		let route = _routes[i];
		
		if (route.id !== trip.route_id) continue;
		
		return route;
	}
}

function getDay() {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
}

function getSecondsSinceMidnight() {
	return Math.floor((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

function isDayForTrip(trip) {
	for (var i = 0; i < _days.length; i++) {
		var day = _days[i];
		
		if (day.service_id !== trip.service_id) continue;
		if (!day.service[getDay()]) continue;
		
		return day;
	}
}

function getLiveData(id, cb) {
	try {
		
		request('http://soiduplaan.tallinn.ee/siri-stop-departures.php?stopid=' + id + '&trip=' + ~~(new Date().getTime() / 100), (err, _res, data) => {
			let lines = data.split('\n'),
				trips = new Array();
			
			lines.shift(); lines.shift();
			
			if (lines.length < 1) return cb(true);
			
			for (let i = 0; i < shownTrips; i++) {
				let line = lines[i];
				
				trips.push({
					type:      line.split(',')[0],
					number:    line.split(',')[1],
					scheduled: parseInt(line.split(',')[3]),
					expected:  parseInt(line.split(',')[2])
				});
				
			}
			
			return cb(false, {
				trips: trips,
				live:  true
			});
			
		});
		
	} catch(e) {
		return cb(true);
	}
}

function getStaticData(id) {
	var times = getTimesForStop(id),
		trips = new Array();
	
	for (let i = 0; i < times.length; i++) {
		let time = times[i],
			trip = getTripForTime(time);
		
		if (!isDayForTrip(trip)) continue;
		if (time.time < getSecondsSinceMidnight()) continue;
		if (trips.length >= shownTrips) break;
		
		let route = getRouteForTrip(trip);
		
		trips.push({
			type:   route.color === 'E6FA32' || route.color === 'F55ADC' || route.color === '00933C' ? 'coach' : route.type === 3 ? 'bus' : route.type === 800 ? 'trol' : route.type === 0 ? 'tram' : route.type === 2 ? 'train' : 'error',
			number: route.number,
			time:   time.time
		});
		
	}
	
	return {
		trips: trips,
		live:  false
	};
	
}

// Endpoints

app.get('/', (req, res) => {
	return res.sendFile(__dirname + '/index.html');
});

app.get('/getstops', (req, res) => {
	var lat_min = req.query.lat_min, lat_max = req.query.lat_max,
		lng_min = req.query.lng_min, lng_max = req.query.lng_max;
	
	if (isNaN(lat_min) || isNaN(lat_max) || isNaN(lng_min) || isNaN(lng_max)) {
		console.log('Got (500)');
		return res.status(500).send();
	}
	
	var data = new Array();
	for (let i = 0; i < _stops.length; i++) {
		let stop = _stops[i];
		
		if (stop.lat > lat_min || stop.lat < lat_max) continue;
		if (stop.lng > lng_min || stop.lng < lng_max) continue;
		
		let override = getOverrideForStop(stop.id);
		stop.desc = override ? override : stop.desc;
		
		data.push({
			lat:  stop.lat,
			lng:  stop.lng,
			id:   stop.id,
			name: stop.name,
			desc: stop.desc
		});
		
	}
	
	return res.json(data);
});

app.get('/getstop', (req, res) => {
	var id = parseInt(req.query.id);
	
	if (isNaN(id)) {
		console.log('Got (500)');
		return res.status(500).send();
	}
	
	getLiveData(id, (err, data) => {
		if (!err) return res.json(data);
		
		return res.json(getStaticData(id));
	});
	
});