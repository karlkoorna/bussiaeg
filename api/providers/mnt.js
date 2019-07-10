const _ = require('lodash');
const db = require('../db.js');

/* Stops */

// Get all stops.
function getStops() {
	return db.query('SELECT id, name, description, type, lat, lng, region FROM stops');
}

// Get stop by id.
async function getStop(id) {
	return (await db.query('SELECT id, name, description, type, lat, lng, region FROM stops WHERE id = ?', [ id ]))[0];
}

// Get trips for stop.
async function getStopDepartures(id, withBuffer) {
	return (await db.query(`
		${withBuffer ? `
		(
			SELECT
				trip_id AS tripId,
				route_id AS routeId,
				route.name,
				destination AS description,
				route.type,
				wheelchair,
				TIME_TO_SEC(time) AS time,
				TIME_TO_SEC(time) - TIME_TO_SEC(NOW()) as countdown
			FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = service_id
			WHERE
				stop.id = :id
				AND (
					(SELECT COUNT(*) FROM stop_times WHERE stop_id = :id AND trip_id = trip.id + 1) = 0
					OR destination != stop.name
				)
				AND time > DATE_SUB(CURTIME(), INTERVAL 1 HOUR)
				AND time < CURTIME()
				AND (
					(
						CURDATE() BETWEEN start AND end
						AND SUBSTR(days, WEEKDAY(CURDATE()) + 1, 1) IS TRUE
						AND service_id NOT IN (
							SELECT service_id FROM service_exceptions WHERE active IS FALSE AND date = CURDATE()
						)
					) OR service_id IN (
						SELECT service_id FROM service_exceptions WHERE active IS TRUE AND date = CURDATE()
					)
				)
			ORDER BY time
		) UNION ALL ` : ''}(
			SELECT
				trip_id AS tripId,
				route_id AS routeId,
				route.name,
				destination AS description,
				route.type,
				wheelchair,
				TIME_TO_SEC(time) AS time,
				TIME_TO_SEC(time) - TIME_TO_SEC(NOW()) as countdown
			FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = service_id
			WHERE
				stop.id = :id
				AND (
					(SELECT COUNT(*) FROM stop_times WHERE stop_id = :id AND trip_id = trip.id + 1) = 0
					OR destination != stop.name
				)
				AND time > CURTIME()
				AND (
					(
						CURDATE() BETWEEN start AND end
						AND SUBSTR(days, WEEKDAY(CURDATE()) + 1, 1) IS TRUE
						AND service_id NOT IN (
							SELECT service_id FROM service_exceptions WHERE active IS FALSE AND date = CURDATE()
						)
					) OR service_id IN (
						SELECT service_id FROM service_exceptions WHERE active IS TRUE AND date = CURDATE()
					)
				)
			ORDER BY time
			LIMIT 15
		) UNION (
			SELECT
				trip_id AS tripId,
				route_id AS routeId,
				route.name,
				destination AS description,
				route.type,
				wheelchair,
				TIME_TO_SEC(time) AS time,
				TIME_TO_SEC(time) - TIME_TO_SEC(NOW()) as countdown
			FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = service_id
			WHERE
				stop.id = :id
				AND (
					(SELECT COUNT(*) FROM stop_times WHERE stop_id = :id AND trip_id = trip.id + 1) = 0
					OR destination != stop.name
				)
		        AND route.type LIKE 'coach%'
				AND time > CURTIME()
				AND (
					(
						CURDATE() BETWEEN start AND end
						AND SUBSTR(days, WEEKDAY(CURDATE()) + 1, 1) IS TRUE
						AND service_id NOT IN (
							SELECT service_id FROM service_exceptions WHERE active IS FALSE AND date = CURDATE()
						)
					) OR service_id IN (
						SELECT service_id FROM service_exceptions WHERE active IS TRUE AND date = CURDATE()
					)
				)
			ORDER BY time
			LIMIT 5
		)
		ORDER BY time
	`, { id })).map((departure) => ({
		...departure,
		time: Number(departure.time),
		countdown: Number(departure.countdown),
		wheelchair: Boolean(departure.wheelchair),
		live: false,
		provider: 'mnt'
	}));
}

/* Routes */

// Get route by id.
async function getRoute(id) {
	return (await db.query(`
		SELECT id, name, description, type
		FROM routes
		WHERE id = ?
	`, [ id ]))[0];
}

// Get trips for route.
async function getRouteTrips(id, tripId) {
	const trips = _.groupBy(await db.query(`
		(
			SELECT
				stop.id,
				stop.name,
				stop.description,
				stop.type,
				trip.origin,
				trip.destination
			FROM routes AS route
			JOIN trips AS trip ON trip.route_id = route.id
			JOIN services AS service ON service.id = service_id
			JOIN stop_times AS time On trip_id = trip.id
			JOIN stops AS stop ON stop.id = stop_id
			WHERE
				route_id = :id
				${tripId ? 'AND direction NOT IN (SELECT direction FROM trips WHERE id = :tripId)' : ''}
				AND CURDATE() BETWEEN start AND end
			GROUP BY direction, sequence
		)
	`, { id, tripId }), (trip) => `${trip.origin} - ${trip.destination}`);
	
	// Trim and clean stops.
	for (const key in trips) trips[key] = trips[key].filter((stop, i, stops) => stop.name !== (stops[i + 1] || {}).name).map((stop) => {
		delete stop.origin;
		delete stop.destination;
		
		return stop;
	});
	
	return trips;
}

module.exports = {
	getStops,
	getStop,
	getStopDepartures,
	getRoute,
	getRouteTrips
};
