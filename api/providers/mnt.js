const db = require('../db.js');

const cache = require('../utils/cache.js');

async function getTrips(id, coachOnly) {
	
	return await cache.use('mnt-trips', id, () => db.query(`
		SELECT TIME_TO_SEC(time) AS time, TIME_TO_SEC(time) - TIME_TO_SEC(NOW()) as countdown, route.name, trip.destination, route.type, FALSE AS live, 'mnt' AS provider FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = trip.service_id
		WHERE
			stop.id = ?
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
	`, [ id ]));
	
}

module.exports = {
	getTrips
};
