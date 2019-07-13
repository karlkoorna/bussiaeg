const got = require('got');
const time = require('../utils/time.js');

/* Stops */

// Get trips for stop.
async function getStopDepartures(id) {
	const now = time.getSeconds();
	const departures = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`, { timeout: 1000, retry: 1 })).body).data;
	if (!departures) throw new Error('Invalid response');
	
	return departures.filter((departure) => !departure.tegelik_aeg).map((departure) => ({
		tripId: departure.reis,
		routeId: departure.reis,
		name: departure.reis,
		description: departure.liin,
		type: 'train',
		time: time.toSeconds(departure.plaaniline_aeg),
		countdown: time.toSeconds(departure.plaaniline_aeg) - now,
		live: false,
		provider: 'elron'
	})).filter((departure) => now - departure.time < 600).slice(0, 15);
}

/* Routes */

// Get route by id.
async function getRoute(id) {
	const stops = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${id}`, { timeout: 600, retry: 1 })).body).data;
	if (!stops) throw new Error('Invalid response');
	if (!stops.length) return null;
	
	return {
		id,
		name: stops[0].peatus,
		description: '',
		type: 'train'
	};
}

// Get directions for route.
async function getRouteDirections(id) {
	const stops = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${id}`, { timeout: 600, retry: 1 })).body).data;
	if (!stops) throw new Error('Invalid response');
	
	return [
		{
			name: stops[0].peatus + ' - ' + stops[stops.length - 1].peatus,
			stops: stops.map((stop) => ({
				id: stop.peatus,
				name: stop.peatus,
				description: '',
				type: 'train'
			}))
		}
	];
}

module.exports = {
	getStopDepartures,
	getRoute,
	getRouteDirections
};
