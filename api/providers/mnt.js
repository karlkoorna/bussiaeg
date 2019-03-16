const _ = require('lodash');

const db = require('../db.js');

// Get times for stop.
async function getTimes(stopId, coachOnly) {
	return (await db.query(`
		SELECT uid AS route_id, TIME_TO_SEC(time) AS time, TIME_TO_SEC(time) - TIME_TO_SEC(NOW()) as countdown, route.name, trip.destination, route.type, 'mnt' AS provider FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = trip.service_id
		WHERE
			stop.id = ?
			AND stop.type IS NOT NULL
			AND route.type IS NOT NULL
			AND time > CURTIME()
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
			${coachOnly ? "AND route.type LIKE 'coach%'" : ''}
		ORDER BY time
		LIMIT ${coachOnly ? '5' : '15'}
	`, [ stopId ])).map((trip) => ({ ...trip, live: false }));
}

// Get trips for route.
async function getTrips(routeId) {
	const trips = _.groupBy(await db.query(`
		SELECT stop.id, stop.name, description, stop.type, trip.origin, trip.destination FROM routes AS route
		JOIN trips AS trip ON trip.route_id = route.id
		JOIN services AS service ON service.id = service_id
		JOIN stop_times AS time On trip_id = trip.id
		JOIN stops AS stop ON stop.id = stop_id
		WHERE
			uid = ?
			AND stop.type IS NOT NULL
			AND route.type IS NOT NULL
			AND CURDATE() BETWEEN start AND end
		GROUP BY uid, trip.origin, trip.destination, sequence
	`, [ routeId ]), (trip) => `${trip.origin} - ${trip.destination}`);
	
	// Trim and clean stops.
	for (const key in trips) trips[key] = trips[key].filter((stop, i, stops) => stop.name !== (stops[i + 1] || {}).name).map((stop) => {
		delete stop.origin;
		delete stop.destination;
		return stop;
	});
	
	return trips;
}

module.exports = {
	getTimes,
	getTrips
};
