const got = require('got');

const db = require('../db.js');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

const elron = require('../providers/elron.js');
const tlt = require('../providers/tlt.js');

// Get trips for stop.
async function getTrips(req, res) {
	
	const { stop: stopId, stops: stopIds } = req.query;
	const now = time.getSeconds();
	const tripz = [];
	
	for (const id of (stopId || stopIds).split(',')) {
		
		// Verify stop, get type and region.
		const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ id ]))[0];
		if (!stop) throw new Error(`Stop with id '${id}' not found`);
		
		// Elron
		
		if (stop.type === 'train') {
			tripz.push(await elron.getTrips(id));
			continue;
		}
		
		// TLT + MNT
		
		const trips = stop.region === 'tallinn' ? await tlt.getTrips(id) : [];
		
		const mntTrips = await cache.use('mnt-stops', id, () => db.query(`
			SELECT TIME_TO_SEC(time) AS time, route.name, trip.destination, wheelchair, route.type, FALSE AS live, 'mnt' AS provider FROM stops AS stop
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
		
		tripz.push(trips.concat(mntTrips).sort((a, b) => a.time - b.time));
		
	}
	
	// Calculate countdown and time for trips.
	for (const trips of tripz) for (let i = 0; i < trips.length; i++) {
		const trip = trips[i];
		
		trips[i] = {
			countdown: trip.time - time.getSeconds(),
			...trip,
			time: trip.time
		};
		
	}
	
	res.send(tripz.length === 1 ? tripz[0] : tripz);
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/trips', {
		schema: {
			querystring: {
				type: 'object',
				oneOf: [
					{ required: [ 'stop' ] },
					{ required: [ 'stops' ] }
				],
				properties: {
					stop: { type: 'string' },
					stops: { type: 'string' }
				}
			}
		}
	}, getTrips);
	
	next();
	
};
