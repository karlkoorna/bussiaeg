const fs = require('fs');
const request = require('request');
const AdmZip = require('adm-zip');
const csv = require('csv-parse');
const utils = require('../utils.js');

let _stops, _times, _trips, _services, _routes;

function processStops(data, cb) {
	
	_stops = [];
	
	csv(data, { columns: true }, (err, lines) => {
		
		for (const line of lines) _stops.push({
			id: line.stop_id,
			name: line.stop_name,
			type: null,
			provider: [ 'Haabersti', 'Põhja-Tallinn', 'Kristiine', 'Mustamäe', 'Nõmme', 'Kesklinn', 'Lasnamäe', 'Pirita' ].includes(line.stop_area) ? 'tlt' : 'mnt',
			lat: parseFloat(line.stop_lat),
			lng: parseFloat(line.stop_lon)
		});
		
		request('http://www.elron.ee/api/v1/stops', (err, res, data) => {
			
			if (err) return void cb();
			
			const stops = JSON.parse(data).data;
			
			if (!stops) return void cb();
			if (stops.text) return void cb();
			
			for (const stop of stops) _stops.push({
				id: stop.peatus,
				name: stop.peatus,
				type: 'train',
				provider: 'elron',
				lat: parseFloat(stop.latitude),
				lng: parseFloat(stop.longitude)
			});
			
			cb();
			
		});
		
	});
	
}

function processTimes(data, cb) {
	
	_times = [];
	
	csv(data, { columns: true }, (err, lines) => {
		
		for (const line of lines) _times.push({
			stopId: line.stop_id,
			tripId: line.trip_id,
			time: utils.toSeconds(line.arrival_time)
		});
		
		_times = _times.sort((a, b) => a.time - b.time);
		
		cb();
		
	});
	
}

function processTrips(data, cb) {
	
	_trips = [];
	
	csv(data, { columns: true }, (err, lines) => {
		
		for (const line of lines) _trips.push({
			id: line.trip_id,
			routeId: line.route_id,
			serviceId: line.service_id
		});
		
		cb();
		
	});
	
}

function processServices(data, cb) {
	
	_services = [];
	
	csv(data, { columns: true }, (err, lines) => {
		
		for (const line of lines) _services.push({
			id: line.service_id,
			days: [ line.monday, line.tuesday, line.wednesday, line.thursday, line.friday, line.saturday, line.sunday ],
			start: utils.toDate(line.start_date),
			end: utils.toDate(line.end_date)
		});
		
		cb();
		
	});
	
}

function processRoutes(data, cb) {
	
	_routes = [];
	
	csv(data, { columns: true, max_limit_on_data_read: 512000 }, (err, lines) => {
		
		for (const line of lines) _routes.push({
			id: line.route_id,
			type: line.route_color === 'E6FA32' || line.route_color === 'F55ADC' || line.route_color === '00933C' ? 'coach' : line.route_type === '800' ? 'trol' : line.route_type === '0' ? 'tram' : line.competent_authority.indexOf('Pärnu') > -1 ? 'parnu' : line.competent_authority.indexOf('Tartu') > -1 ? 'tartu' : line.route_type === '3' ? 'bus' : null,
			shortName: line.route_short_name,
			longName: line.route_long_name.split('-').slice(-1).pop()
		});
		
		cb();
		
	});
	
}

function processTypes(cb) {
	
	console.log('Processing types...');
	
	const existed = fs.existsSync('data/types.txt');
	
	if (process.argv[2] !== '418') {
		
		const updater = require('child_process').fork(`providers/static.js`, [], { silent: false });
		
		updater.send({ _stops, _times, _trips, _services, _routes });
		
		updater.on('message', (percent) => {
			process.stdout.write(`Updating types... ${percent}%\r`);
		});
		
		updater.on('exit', () => {
			process.stdout.write('Updating types... Done  \n');
			process.exit(418);
		});
		
	}
	
	if (existed) {
		
		const types = fs.readFileSync('data/types.txt').toString().split('\n').slice(0, -1);
		
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
		
		cb();
		
	}
	
}

function getStops(latMin, latMax, lngMin, lngMax) {
	
	const stops = [];
	
	for (const stop of _stops) {
		
		if (stop.lat > latMin || stop.lat < latMax) continue;
		if (stop.lng > lngMin || stop.lng < lngMax) continue;
		
		stops.push(stop);
		
	}
	
	return stops;
	
}

function getStop(id) {
	
	for (const stop of _stops) if (stop.id === id) return stop;
	
	return null;
	
}

function getTimesForStop(id) {
	
	const times = [];
	
	for (const time of _times) if (time.stopId === id) times.push(time);
	
	return times;
	
}

function getTripForTime(time) {
	
	for (const trip of _trips) if (trip.id === time.tripId) return trip;
	
	return null;
	
}

function isTripInService(trip) {
	
	for (const service of _services) {
		
		if (service.id !== trip.serviceId) continue;
		if (service.start > new Date()) continue;
		if (service.end < new Date()) continue;
		
		return service.days[((new Date()).getDay() || 7) - 1] === '1';
		
	}
	
}

function getRouteForTrip(trip) {
	
	for (const route of _routes) if (route.id === trip.routeId) return route;
	
	return null;
	
}

function getTrips(id, onlyCoaches) {
	
	const trips = [];
	let last = '';
	
	for (const time of getTimesForStop(id)) {
		
		if (trips.length === 15) break;
		
		if (time.time < utils.getSeconds()) continue;
		
		const trip = getTripForTime(time);
		
		if (!trip) continue;
		if (!isTripInService(trip)) continue;
		
		const route = getRouteForTrip(trip);
		
		if (!route) continue;
		if (onlyCoaches && route.type !== 'coach') continue;
		
		if (last === route.shortName + time.time) continue;
		last = route.shortName + time.time;
		
		trips.push({
			test: trip.serviceId,
			sort: time.time,
			type: route.type,
			shortName: route.shortName,
			longName: route.longName,
			time: utils.toCountdown(time.time),
			altTime: utils.toTime(time.time),
			gps: 'off'
		});
		
	}
	
	return trips;
	
}

module.exports = (cb) => {
	
	console.log('Downloading data...');
	request({ url: 'http://www.peatus.ee/gtfs/gtfs.zip', encoding: null }, (err, res, data) => {
		
		if (err) throw new Error('Failed to download data');
		
		try {
			
			const zip = new AdmZip(new Buffer(data));
			
			console.log('Processing stops...');
			processStops(zip.readAsText('stops.txt'), () => {
				console.log('Processing times...');
				processTimes(zip.readAsText('stop_times.txt'), () => {
					console.log('Processing trips...');
					processTrips(zip.readAsText('trips.txt'), () => {
						console.log('Processing services...');
						processServices(zip.readAsText('calendar.txt'), () => {
							console.log('Processing routes...');
							processRoutes(zip.readAsText('routes.txt'), () => {
								processTypes(() => {
									cb({ getStops, getStop, getTrips });
								});
							});
						});
					});
				});
			});
			
		} catch (ex) {
			throw new Error('Failed to process data');
		}
		
	});
	
};

if (process.send) process.once('message', (msg) => {
	
	({ _stops, _times, _trips, _services, _routes } = msg);
	
	let data = '';
	
	for (const i in _stops) {
		const stop = _stops[i];
		
		if (stop.type) continue;
		
		const times = getTimesForStop(stop.id);
		const types = [];
		
		for (const time of times.slice(0, 63)) types.push(getRouteForTrip(getTripForTime(time)).type);
		
		const type = types.indexOf('trol') > -1 ? 'trol' : types.indexOf('tram') > -1 ? 'tram' : types.indexOf('parnu') > -1 ? 'parnu' : types.indexOf('tartu') > -1 ? 'tartu' : types.indexOf('bus') > -1 ? 'bus' : types.indexOf('coach') > -1 ? 'coach' : null;
		
		if (type) data += `${stop.id},${type}\n`;
		
		process.send((i * 100 / _stops.length).toFixed(2));
		
	}
	
	fs.writeFileSync('data/types.txt', data);
	
});
