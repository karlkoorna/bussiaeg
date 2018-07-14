const got = require('got');

const db = require('../db.js');

// Get stops.
async function getStops() {
	return await db.query('SELECT * FROM stops');
}

// Get stop.
async function getStop(id) {
	return (await db.query('SELECT * FROM stops WHERE id = ?', [ id ]))[0] || null;
}

// Get trips for stop.
async function getTrips(id, opts = {}) {
	
	return (await db.query(`
		SELECT trip_id, TIME_TO_SEC(time) AS time, route.name, terminus, wheelchair, route.type, route.region FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = trip.service_id
		WHERE
			stop.id = ?
			${opts.limit ? 'AND time > CURDATE()' : ''}
			AND (
				(
					CURDATE() BETWEEN start AND end
					AND SUBSTR(days, WEEKDAY(CURDATE()) + 1, 1) = 1
					AND service_id NOT IN (
						SELECT service_id FROM service_exceptions WHERE type = 0 AND date = CURDATE()
					)
				) OR service_id IN (
					SELECT service_id FROM service_exceptions WHERE type = 1 AND date = CURDATE()
				)
			)
		ORDER BY time
		${opts.limit ? `LIMIT ${opts.limit}` : ''}
	`, [ id ])).map((trip) => ({ ...trip, live: false, provider: 'mnt' }));
	
}

module.exports = {
	getStops,
	getStop,
	getTrips
};
