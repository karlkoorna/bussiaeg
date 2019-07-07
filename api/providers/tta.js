const got = require('got');

const time = require('../utils/time.js');
const cache = require('../utils/cache.js');
const debug = require('../utils/debug.js');

async function updateCache(id) {
	try {
		return (await got('https://transport.tallinn.ee/siri-stop-departures.php?stopid=' + id, { timeout: 1000, retry: 1 })).body.split('\n').map((line) => line.split(',')).slice(2, -1).map((departure) => ({
			name: departure[1],
			type: departure[0],
			time: Number(departure[3]),
			countdown: Number(departure[2] - 5)
		}));
	} catch (ex) {
		debug.warn('Failed to fetch TTA data.', ex);
		return [];
	}
}

// Get trips for stop.
async function getStopDepartures(id, mntDepartures) {
	const ttaDepartures = await cache.use('tta', id, updateCache.bind(this, id));
	const departures = [];
	
	// Asynchronously prefetch future TTA departures.
	cache.use('tta', id, updateCache.bind(this, id));
	
	// Merge MNT departures with TTA departures if available.
	for (const mntDeparture of mntDepartures) {
		// Add coach departure.
		if (mntDeparture.type.startsWith('coach')) {
			departures.push(mntDeparture);
			continue;
		}
		
		// Try to match departures.
		const ttaDeparture = ttaDepartures.find((departure) => departure.name === mntDeparture.name && departure.type === mntDeparture.type && Math.abs(departure.time - mntDeparture.time) < 60);
		
		// Add (matched) departure.
		if (ttaDeparture) departures.push({
			...mntDeparture,
			time: ttaDeparture.time,
			countdown: ttaDeparture.countdown - time.getSeconds(),
			live: ttaDeparture.time !== ttaDeparture.countdown,
			provider: 'tta'
		}); else departures.push(mntDeparture);
	}
	
	return departures.filter((departure) => departure.countdown > 0).sort((prevDeparture, nextDeparture) => prevDeparture.countdown - nextDeparture.countdown);
}

module.exports = {
	getStopDepartures
};
