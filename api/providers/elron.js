const got = require('got');

const time = require('../utils/time.js');

// Get trips for stop.
async function getStopDepartures(stopId) {
	const now = time.getSeconds();
	const departures = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(stopId)}`, { timeout: 600, retry: 1 })).body).data;
	
	if (!departures) throw new Error("Provider 'Elron' is not returning data");
	
	return departures.filter((departure) => !departure.tegelik_aeg).map((departure) => ({
		tripId: departure.reis,
		time: time.toSeconds(departure.plaaniline_aeg),
		countdown: time.toSeconds(departure.plaaniline_aeg) - now,
		name: departure.reis,
		destination: departure.liin,
		type: 'train',
		live: false,
		provider: 'elron'
	})).filter((departure) => now - departure.time < 600).slice(0, 15);
}

// Get trips for route.
async function getRouteTrips(routeId) {
	const stops = JSON.parse((await got(`http://elron.ee/api/v1/trip?id=${routeId}`, { timeout: 600, retry: 1 })).body).data;
	
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
	getStopDepartures,
	getRouteTrips
};
