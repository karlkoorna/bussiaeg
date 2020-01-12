const got = require('../utils/got.js');
const log = require('../utils/log.js');
const time = require('../utils/time.js');
const cache = require('../utils/cache.js');

/* Stops */

async function updateCache(id) {
	try {
		const body = (await got(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${id}`)).body;
		if (body.indexOf('ERROR') > -1) {
			log.warn`Failed to fetch TTA departures.${new Error(body)}`;
			return [];
		}
		
		return body.split('\n').map((line) => line.split(',')).slice(2, -1).map((departure) => ({
			name: departure[1],
			type: departure[0],
			time: Number(departure[3]),
			countdown: Number(departure[2] - 5)
		}));
	} catch (ex) {
		log.warn`Failed to fetch TTA departures.${ex}`;
		return [];
	}
}

// Get trips for stop.
async function getStopDepartures(id, mntDepartures) {
	const ttaDepartures = await cache.use('tta', id, updateCache.bind(this, id));
	const departures = [];
	
	// Asynchronously fetch future TTA departures.
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
			live: ttaDeparture.time !== ttaDeparture.countdown + 5,
			provider: 'tta'
		}); else departures.push(mntDeparture);
	}
	
	return departures.filter((departure) => departure.countdown > 0).sort((prevDeparture, nextDeparture) => prevDeparture.countdown - nextDeparture.countdown);
}

module.exports = {
	getStopDepartures
};
