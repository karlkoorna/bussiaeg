const got = require('got');

const time = require('../utils/time.js');

const stops = {};
let last = new Date();

// Merge TLT trips with MNT trips.
function mergeTrips(tltTrips, mntTrips) {
	
	let trips = [];
	
	// Fallback to GTFS trips on error.
	if (!tltTrips.length) trips = mntTrips; else for (const mntTrip of mntTrips) {
		
		// Add trips not provided by TLT.
		if (mntTrip.type.startsWith('coach')) trips.push(mntTrip); else for (const tltTrip of tltTrips) {
			
			// Match TLT and MNT trips by type, name and floored time.
			
			if (mntTrip.type !== tltTrip.type) continue;
			if (mntTrip.name !== tltTrip.name) continue;
	   		if (mntTrip.time !== tltTrip.trip_id) continue;
			
	   		trips.push({
	   			...mntTrip,
				time: tltTrip.time,
				live: tltTrip.live,
				provider: 'tlt'
	   		});
			
		};
		
	};
	
	// Hide past trips, future coaches (3h) and sort trips.
	const now = time.getSeconds();
	return trips.filter((trip) => trip.time >= now && trip.time <= now + 10800).sort((a, b) => a.time - b.time);
	
}

// Update stop/stops in cache.
async function update(id) {
	
	// Add stop to cache.
	if (id) stops[id] = {
		rank: 5,
		trips: []
	};
	
	// Decrease ranks and remove stops if too low.
	if (!id) for (const key of Object.keys(stops)) if (stops[key].rank > 0) stops[key].rank--; else delete stops[id];
	
	try {
		
		const data = (await got(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${id || Object.keys(stops)}`)).body;
		
		// Fallback to GTFS trips on error.
		if (id || new Date() - last < 4200) if (data.indexOf('ERROR') > -1) {
			for (const key of Object.keys(id ? [ id ] : stops)) stops[key].trips = [];
			return;
		}
		
		// Add stops to cache.
		for (const stop of data.split('\nstop,').slice(1)) stops[stop.split('\n', 1)[0]].trips = stop.split('\n').slice(1).map((trip) => trip.split(',')).map((trip) => ({
			trip_id: trip[3] - (trip[3] % 60),
			time: Number(trip[2]),
			name: trip[1],
			terminus: trip[4],
			type: trip[0],
			live: trip[2] !== trip[3],
			provider: 'tlt'
		}));
		
	} catch (ex) {
		// Fallback to GTFS data on error.
		if (id || new Date() - last < 4200) for (const key of Object.keys(id ? [ id ] : stops)) stops[key].trips = [];
	}
	
}

// Update stops in cache every 2 seconds.
setInterval(update, 2000);

// Get trips for stop by stop id.
async function getTrips(id) {
	
	// Return trips from cache and increase rank if exists.
	if (stops[id]) {
		if (stops[id].rank <= 60) stops[id].rank++;
		return stops[id].trips;
	}
	
	// Force cache update for stop and return trips.
	await update(id);
	return stops[id].trips;
	
};

module.exports = {
	getTrips,
	mergeTrips
};