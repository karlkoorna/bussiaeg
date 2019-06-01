const got = require('got');

const time = require('../utils/time.js');
const debug = require('../utils/debug.js');

// Get trips for stop.
async function getStopDepartures(id, mntDepartures) {
	let ttaDepartures = [];
	let departures = [];
	
	try {
		ttaDepartures = (await got('https://transport.tallinn.ee/siri-stop-departures.php?stopid=' + id, { timeout: 600, retry: 1 })).body.split('\n').map((line) => line.split(',')).slice(2).map((departure) => ({
			name: departure[1],
			type: departure[0],
			time: Number(departure[3]),
			countdown: Number(departure[2])
		}));
	} catch (ex) {
		debug.warn('Failed to fetch TTA data.', ex);
	}
	
	// Merge MNT trips with TTA trips if available.
	if (ttaDepartures.length) for (const mntDeparture of mntDepartures) {
		// Add coach trip.
		if (mntDeparture.type.startsWith('coach') && mntDeparture.countdown > 0) {
			departures.push(mntDeparture);
			continue;
		}
		
		// Add matched trip.
		const ttaTime = ttaDepartures.find((departure, i) => {
			if (departure.name !== mntDeparture.name || departure.type !== mntDeparture.type || Math.abs(departure.time - mntDeparture.time) > 60) return false;
			
			// ttaDepartures.splice(i, 1);
			return true;
		});
		
		if (!ttaTime) continue;
		
		departures.push({
			...mntDeparture,
			time: ttaTime.time,
			countdown: ttaTime.countdown - time.getSeconds(),
			live: ttaTime.time !== ttaTime.countdown,
			provider: 'tta'
		});
	} else departures = mntDepartures.filter((trip) => trip.countdown > 0);
	
	// Sort merged trips by countdown.
	return departures.sort((prevDeparture, nextDeparture) => prevDeparture.countdown - nextDeparture.countdown);
}

module.exports = {
	getStopDepartures
};
