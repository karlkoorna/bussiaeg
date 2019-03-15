const got = require('got');

const time = require('../utils/time.js');

// Get times for stop.
async function getTimes(stopId) {
	const now = time.getSeconds();
	const trips = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(stopId)}`)).body).data;
	
	if (!trips) throw new Error("Provider 'Elron' is not returning data");
	
	// Show not arrived trips until 10 minutes of being late.
	return trips.filter((trip) => !trip.tegelik_aeg).map((trip) => ({
		route_id: trip.reis,
		time: time.toSeconds(trip.plaaniline_aeg),
		countdown: time.toSeconds(trip.plaaniline_aeg) - now,
		name: trip.reis,
		destination: trip.liin,
		type: 'train',
		live: false,
		provider: 'elron'
	})).filter((trip) => now - trip.time < 600).slice(0, 15);
}

// Get trips for route.
async function getTrips(routeId) {
	const stops = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${routeId}`)).body).data;
	
	if (!stops) throw new Error("Provider 'Elron' is not returning data");
	
	return {
		[`${stops[0].peatus} - ${stops[stops.length - 1].peatus}`]: stops.map((stop) => ({
			id: stop.peatus,
			name: stop.peatus,
			description: '',
			type: 'train'
		}))
	};
}

module.exports = {
	getTimes,
	getTrips
};
