const got = require('got');

const time = require('../utils/time.js');

const stops = {};
let last = new Date();

// Update stop/stops in cache.
async function update(id) {
	
	// Add stop to cache.
	if (id) stops[id] = {
		rank: 5,
		trips: []
	};
	
	// Decrease ranks and remove stops if too low.
	if (!id) for (const key in stops) if (stops[key].rank > 0) stops[key].rank--; else delete stops[key];
	
	try {
		
		const data = (await got(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${id || Object.keys(stops)}`, { retry: 0, timeout: 2000 + 125 * Object.keys(stops).length })).body;
		
		// Fallback to GTFS trips on error.
		if (id || new Date() - last < 4200) if (data.split('\n').length === 2) {
			if (id) stops[id].trips = []; else for (const key in stops) stops[key].trips = [];
			return;
		}
		
		// Add stops to cache.
		for (const stop of data.split('\nstop,').slice(1)) stops[stop.split('\n', 1)[0]].trips = stop.split('\n').slice(1, -1).map((trip) => trip.split(',')).map((trip) => ({
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
		if (id || new Date() - last < 4200) if (id) stops[id].trips = []; else for (const key in stops) stops[key].trips = [];
	}
	
}

// Update stops in cache (2s interval).
setInterval(update, 2000);

// Get trips for stop by stop id.
async function getTrips(id) {
	
	// Return trips from cache and increase rank if exists.
	if (stops[id]) {
		if (stops[id].rank <= 60) stops[id].rank++;
		return [ ...stops[id].trips ];
	}
	
	// Force cache update for stop and return trips.
	await update(id);
	return [ ...stops[id].trips ];
	
}

module.exports = {
	getTrips
};
