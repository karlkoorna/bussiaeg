const got = require('got');

const db = require('../db.js');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

const elron = require('../providers/elron.js');
const tlt = require('../providers/tlt.js');

// Get trips for stop.
async function getTrips(req, res) {
	
	const { stop_id: stopId } = req.query;
	const now = time.getSeconds();
	let trips = [];
	
	// Verify stop, get type and region.
	const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ id ]))[0];
	if (!stop) throw new Error(`Stop with id '${stopId}' not found`);
	
	// Elron
	
	if (stop.type === 'train') return res.send(await elron.getTrips(stopId));
	
	// TLT + MNT
	
	if (stop.region === 'tallinn') trips = await tlt.getTrips(stopId);
	
	const mntTrips = await cache.use('mnt-stops', stopId, () => db.query(`
		SELECT TIME_TO_SEC(time) AS time, route.name, trip.destination, route.type, FALSE AS live, 'mnt' AS provider FROM stops AS stop
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
			${trips.length ? "AND route.type LIKE 'coach%'" : ''}
		LIMIT ${trips.length ? '5' : '15'}
	`, [ id ]));
	
	trips.concat(trips.concat(mntTrips).map((trip) => ({
		...trip,
		countdown: trip.time - time.getSeconds()
	})).sort((a, b) => a.time - b.time));
	
	res.send(trips);
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/trips', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'stop_id' ],
				properties: {
					stop_id: { type: 'string' }
				}
			}
		}
	}, getTrips);
	
	next();
	
};
