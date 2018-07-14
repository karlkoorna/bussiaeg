const got = require('got');

const time = require('../utils/time.js');

const stops = {};

// Get trips for stop.
async function getTrips(id) {
	
	// Update cache if stop not present or not added today.
	if (!stops[id] || (stops[id] || {}).timestamp < new Date() - 86400000) {
		
		const data = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
		
		if (!data) throw new Error("Provider 'Elron' is not returning data");
		if (data.text) throw new Error(data.text);
		
		const now = time.getSeconds();
		
		stops[id] = {
			timestamp: (new Date()).getTime(),
			trips: data.filter((trip) => time.toSeconds(trip.plaaniline_aeg) > now).map((trip) => ({
				trip_id: Number(trip.reis),
				time: time.toSeconds(trip.plaaniline_aeg),
				name: trip.reis,
				terminus: trip.liin,
				type: 'train',
				live: false,
				provider: 'elron'
			})).slice(0, 15)
		}
		
	}
	
	return stops[id].trips;
	
};

// Get trip by id.
async function getTrip(id) {
	
	const data = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${encodeURIComponent(id)}`)).body).data;
	
	if (!data) throw new Error("Provider 'Elron' is not returning data");
	if (data.text) throw new Error(data.text);
	
	const trip = {
		name: id,
		terminus: `${data[0].peatus} - ${data[data.length - 1].peatus}`,
		type: 'train',
		region: '',
		stops: data.map((trip) => ({
			id: trip.peatus,
			name: trip.peatus,
			type: 'train',
			region: '',
			time: trip.plaaniline_aeg
		}))
	};
	
	return trip;
	
}

module.exports = {
	getTrips,
	getTrip
};
