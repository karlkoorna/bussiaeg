const got = require('got');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

// Get trips for stop.
async function getTrips(id) {
	
	return cache.use('elron-stops', id, async () => {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
		
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		const now = time.getSeconds();
		
		return data.filter((trip) => time.toSeconds(trip.plaaniline_aeg) > now).map((trip) => ({
			trip_id: Number(trip.reis),
			time: time.toSeconds(trip.plaaniline_aeg),
			name: trip.reis,
			terminus: trip.liin,
			type: 'train',
			live: false,
			provider: 'elron'
		})).slice(0, 15);
		
	});
	
};

// Get trip by id.
async function getTrip(id) {
	
	return cache.use('elron-trips', id, async () => {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${encodeURIComponent(id)}`)).body).data;
	
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		return {
			name: id,
			terminus: `${data[0].peatus} - ${data[data.length - 1].peatus}`,
			type: 'train',
			stops: data.map((trip) => ({
				id: trip.peatus,
				name: trip.peatus,
				type: 'train',
				time: trip.plaaniline_aeg
			}))
		};
		
	});
	
}

module.exports = {
	getTrips,
	getTrip
};
