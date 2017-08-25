const fs = require('fs');
const request = require('request');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');

let _stops, _times, _trips, _services, _routes;

function getSeconds() {
	return Math.floor((new Date() - (new Date()).setHours(0, 0, 0, 0)) / 1000);
}

function toSeconds(time) {
	return (time.substr(0, 2) * 60 * 60) + (time.substr(3, 2) * 60);
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

function toDate(time) {
	return new Date(time.substr(0, 4), time.substr(4, 2) - 1, time.substr(6, 2));
}

function processStops(cb) {
	
	_stops = [];
	
	fs.createReadStream('providers/static/stops.txt').pipe(csv()).on('data', (line) => {
		
		_stops.push({
			id: line.stop_id,
			type: null,
			name: line.stop_name,
			lat: parseFloat(line.stop_lat),
			lng: parseFloat(line.stop_lon)
		});
		
	}).on('end', () => {
		
		request('http://elron.ee/api/v1/stops', (err, res, data) => {
			
			if (err) return void cb();
			
			const stops = JSON.parse(data).data;
			
			if (!stops) return void cb();
			if (stops.text) return void cb();
			
			for (const stop of stops) _stops.push({
				id: stop.peatus,
				type: 'train',
				name: stop.peatus,
				lat: parseFloat(stop.latitude),
				lng: parseFloat(stop.longitude)
			});
			
			cb();
			
		});
		
	});
	
}

function processTimes(cb) {
	
	_times = [];
	
	fs.createReadStream('providers/static/stop_times.txt').pipe(csv()).on('data', (line) => {
		
		_times.push({
			stopId: line.stop_id,
			tripId: line.trip_id,
			time: toSeconds(line.arrival_time)
		});
		
	}).on('end', () => {
		
		_times = _times.sort((a, b) => a.time - b.time);
		
		cb();
		
	});
	
}

function processTrips(cb) {
	
	_trips = [];
	
	fs.createReadStream('providers/static/trips.txt').pipe(csv()).on('data', (line) => {
		
		_trips.push({
			id: line.trip_id,
			routeId: line.route_id,
			serviceId: line.service_id
		});
		
	}).on('end', cb);
	
}

function processServices(cb) {
	
	_services = [];
	
	fs.createReadStream('providers/static/calendar.txt').pipe(csv()).on('data', (line) => {
		
		_services.push({
			id: line.service_id,
			days: [ line.monday, line.tuesday, line.wednesday, line.thursday, line.friday, line.saturday, line.sunday ],
			start: toDate(line.start_date),
			end: toDate(line.end_date)
		});
		
	}).on('end', cb);
	
}

function processRoutes(cb) {
	
	_routes = [];
	
	fs.createReadStream('providers/static/routes.txt').pipe(csv()).on('data', (line) => {
		
		_routes.push({
			id: line.route_id,
			type: line.route_color === 'E6FA32' || line.route_color === 'F55ADC' || line.route_color === '00933C' ? 'coach' : line.route_type === '800' ? 'trol' : line.route_type === '0' ? 'tram' : line.competent_authority.indexOf('Pärnu') > -1 ? 'parnu' : line.competent_authority.indexOf('Tartu') > -1 ? 'tartu' : line.route_type === '3' ? 'bus' : null,
			shortName: line.route_short_name,
			longName: line.route_long_name.split('-').slice(-1).pop()
		});
		
	}).on('end', cb);
	
}

function processTypes(cb) {
	
	if (!fs.existsSync('providers/static/types.txt')) {
		
		let data = '';
		
		for (const i in _stops) {
			const stop = _stops[i];
			
			if (stop.type) continue;
			
			const times = getTimesForStop(stop.id);
			const types = [];
			
			for (const time of times) types.push(getRouteForTrip(getTripForTime(time)).type);
			
			const type = types.indexOf('trol') > -1 ? 'trol' : types.indexOf('tram') > -1 ? 'tram' : types.indexOf('parnu') > -1 ? 'parnu' : types.indexOf('tartu') > -1 ? 'tartu' : types.indexOf('bus') > -1 ? 'bus' : types.indexOf('coach') > -1 ? 'coach' : null;
			
			if (type) data += `\n${stop.id},${type}`;
			
			process.stdout.write(`Generating types... ${(i * 100 / _stops.length).toFixed(2)}%\r`);
			
		}
		
		fs.writeFileSync('providers/static/types.txt', data.substr(1));
		
		process.stdout.write('Generating types...       \n');
		
	}
	
	const types = fs.readFileSync('providers/static/types.txt').toString().split('\n');
	
	for (const i in types) {
		const type = types[i];
		
		for (const stop of _stops) {
			
			if (stop.type) continue;
			if (stop.id !== type.split(',')[0]) continue;
			
			stop.type = type.split(',')[1];
			delete types[i];
			
			break;
			
		}
		
	}
	
	console.log('Processing types...');
	
	cb();
	
}

function getStops(latMin, latMax, lngMin, lngMax) {
	
	const stops = [];
	
	for (const stop of _stops) {
		
		if (stop.lat > latMin || stop.lat < latMax) continue;
		if (stop.lng > lngMin || stop.lng < lngMax) continue;
		if (!stop.type) continue;
		
		stops.push(stop);
		
	}
	
	return stops;
	
}

function getStop(id) {
	
	for (const stop of _stops) {
		
		if (stop.id !== id) continue;
		if (!stop.type) continue;
		
		return stop;
		
	}
	
	return null;
	
}

function getTimesForStop(id) {
	
	const times = [];
	
	for (const time of _times) if (time.stopId === id) times.push(time);
	
	return times;
	
}

function getTripForTime(time) {
	for (const trip of _trips) if (trip.id === time.tripId) return trip;
}

function isTripInService(trip) {
	
	for (const service of _services) {
		
		if (service.id !== trip.serviceId) continue;
		if (service.start > new Date()) return false;
		if (service.end < new Date()) return false;
		
		return service.days[(new Date()).getDay() - 1] === '1';
		
	}
	
}

function getRouteForTrip(trip) {
	for (const route of _routes) if (route.id === trip.routeId) return route;
}

function getTrips(id, coaches) {
	
	const trips = [];
	let last = '';
	
	for (const time of getTimesForStop(id)) {
		
		if (trips.length === 15) break;
		
		if (time.time < getSeconds()) continue;
		
		const trip = getTripForTime(time);
		
		if (!isTripInService(trip)) continue;
		
		const route = getRouteForTrip(trip);
		
		if (coaches && route.type !== 'coach') continue;
		
		if (last === route.shortName + time.time) continue;
		last = route.shortName + time.time;
		
		trips.push({
			test: trip.serviceId,
			sort: time.time,
			type: route.type,
			shortName: route.shortName,
			longName: route.longName,
			time: toCountdown(time.time),
			altTime: toTime(time.time),
			gps: 'off'
		});
		
	}
	
	return trips;
	
}

function update(cb) {
	
	console.log('Downloading static data...');
	request({ url: 'http://www.peatus.ee/gtfs/gtfs.zip', encoding: null }, (err, res, data) => {
		
		if (err) console.log('Failed to download data!');
		
		console.log('Extracting static data...');
		try {
			
			const zip = new AdmZip(new Buffer(data));
			
			zip.extractEntryTo('stops.txt', 'providers/static', false, true);
			zip.extractEntryTo('stop_times.txt', 'providers/static', false, true);
			zip.extractEntryTo('trips.txt', 'providers/static', false, true);
			zip.extractEntryTo('calendar.txt', 'providers/static', false, true);
			zip.extractEntryTo('routes.txt', 'providers/static', false, true);
			
		} catch (ex) {
			console.log('Failed to extract data!');
		}
		
		for (const file of [ 'stops', 'stop_times', 'trips', 'calendar', 'routes' ]) if (!fs.existsSync(`providers/static/${file}.txt`)) throw new Error(`Missing providers/static/${file}.txt`);
		
		console.log('Processing stops...');
		processStops(() => {
			console.log('Processing times...');
			processTimes(() => {
				console.log('Processing trips...');
				processTrips(() => {
					console.log('Processing services...');
					processServices(() => {
						console.log('Processing routes...');
						processRoutes(() => {
							processTypes(() => {
								if (cb) cb();
							});
						});
					});
				});
			});
		});
		
	});
	
}

module.exports = (cb) => {
	
	update(() => {
		cb({ getStops, getStop, getTrips, update });
	});
	
};
