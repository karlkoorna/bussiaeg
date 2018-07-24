const got = require('got');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

// Get trips for stop.
async function getTrips(id) {
	
	const now = time.getSeconds();
	
	return (await cache.use('elron-stops', id, async () => {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
		
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		return data.map((trip) => ({
			time: time.toSeconds(trip.plaaniline_aeg),
			name: trip.reis,
			terminus: trip.liin,
			type: 'train',
			live: false,
			provider: 'elron'
		}));
		
	})).filter((trip) => trip.time > now).slice(0, 15);
	
};

// Get route by id.
async function getRoute(id) {
	
	return cache.use('elron-trips', id, async () => {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${encodeURIComponent(id)}`)).body).data;
	
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		return {
			terminus: `${data[0].peatus} - ${data[data.length - 1].peatus}`,
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
	getRoute
};
