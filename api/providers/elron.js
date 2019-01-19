const got = require('got');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

// Get trips for stop.
async function getTrips(id) {
	
	const now = time.getSeconds();
	const trips = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
	
	if (!trips) throw new Error("Provider 'Elron' is not returning data");
	if (trips.text) throw new Error(trips.text);
	
	// Show not arrived trips until 10 minutes of being late.
	return trips.filter((trip) => !trip.tegelik_aeg).map((trip) => ({
		time: time.toSeconds(trip.plaaniline_aeg),
		countdown: time.toSeconds(trip.plaaniline_aeg) - now,
		name: trip.reis,
		destination: trip.liin,
		type: 'train',
		live: false,
		provider: 'elron'
	})).filter((trip) => now - trip.time < 600).slice(0, 15);
	
}

module.exports = {
	getTrips
};
