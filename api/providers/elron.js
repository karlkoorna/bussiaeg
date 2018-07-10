const got = require('got');

const time = require('../utils/time.js');

const stops = {};

// Get trips for stop.
async function getTrips(id) {
	
	if (!stops[id]) {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
		
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		stops[id] = data.filter((trip) => time.toSeconds(trip.plaaniline_aeg) > time.getSeconds()).map((trip) => ({
			trip_id: Number(trip.reis),
			time: trip.plaaniline_aeg,
			name: trip.reis,
			terminus: trip.liin,
			type: 'train',
			live: false,
			provider: 'elron'
		}));
		
	}
	
	return stops[id];
	
};

module.exports = {
	getTrips
};
