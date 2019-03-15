const crypto = require('crypto');
const got = require('got');

const time = require('../utils/time.js');

const stops = {};
let last = new Date();

// Update stop/stops in cache.
async function update(stopId) {
	// Add stop to cache.
	if (stopId) stops[stopId] = {
		rank: 5,
		trips: []
	};
	
	// Decrease ranks and remove stops if too low.
	if (!stopId) for (const key in stops) if (stops[key].rank > 0) stops[key].rank--; else delete stops[key];
	
	try {
		const data = (await got(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${stopId || Object.keys(stops)}`, { retry: 0, timeout: 2000 + (125 * Object.keys(stops).length) })).body;
		
		// Fallback to GTFS trips on error.
		if (stopId || new Date() - last < 4200) if (data.split('\n').length === 2) {
			if (stopId) stops[stopId].trips = []; else for (const key in stops) stops[key].trips = [];
			return;
		}
		
		// Add stops to cache.
		for (const stop of data.split('\nstop,').slice(1)) stops[stop.split('\n', 1)[0]].trips = stop.split('\n').slice(1, -1).map((trip) => trip.split(',')).map((trip) => ({
			route_id: crypto.createHash('md5').update(trip[1] + trip[0] + '56Tallinna TA').digest('hex'),
			time: Number(trip[3]),
			countdown: Number(trip[2]) - time.getSeconds(),
			name: trip[1],
			destination: trip[4],
			type: trip[0],
			live: trip[2] !== trip[3],
			provider: 'tta'
		}));
		
		last = new Date();
	} catch (ex) {
		// Fallback to GTFS data on error.
		if (stopId || new Date() - last < 4200) if (stopId) stops[stopId].trips = []; else for (const key in stops) stops[key].trips = [];
	}
}

// Update stops in cache (2s interval).
setInterval(update, 2000);

// Get times for stop.
async function getTimes(stopId) {
	// Return times from cache and increase rank if exists.
	if (stops[stopId]) {
		if (stops[stopId].rank <= 60) stops[stopId].rank++;
		return [ ...stops[stopId].trips ];
	}
	
	// Force cache update for stop and return times.
	await update(stopId);
	return [ ...stops[stopId].trips ];
}

module.exports = {
	getTimes
};
