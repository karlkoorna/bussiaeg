const db = require('../db.js');
const got = require('../utils/got.js');
const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

/* Stops */

// Get trips for stop.
async function getStopDepartures(id) {
	const now = time.getSeconds();
	const departures = (await got(`https://elron.ee/live-map/stop/${encodeURIComponent(id)}`).json()).data;
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
	const stops = (await got(`https://elron.ee/live-map/trip/${id}`).json()).data;
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
	const stops = (await got(`https://elron.ee/live-map/trip/${id}`).json()).data;
	if (!stops) throw new Error('Invalid response');
	const coords = await cache.use('elron', 'coords', () => db.query("SELECT id, lat, lng FROM stops WHERE type = 'train'"));
	
	return [
		{
			name: stops[0].peatus + ' - ' + stops[stops.length - 1].peatus,
			stops: stops.map((stop) => {
				const { lat, lng } = coords.find((coord) => coord.id === stop.peatus);
				
				return {
					id: stop.peatus,
					name: stop.peatus,
					description: '',
					type: 'train',
					lat,
					lng
				};
			})
		}
	];
}

module.exports = {
	getStopDepartures,
	getRoute,
	getRouteDirections
};
