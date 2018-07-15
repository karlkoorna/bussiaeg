const got = require('got');

const db = require('../db.js');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');
const elron = require('../providers/elron.js');
const tlt = require('../providers/tlt.js');

// Get trips for stop.
async function getTrips(req, res) {
	
	const id = req.query['id'];
	const now = time.getSeconds();
	
	// Verify stop, get type and region.
	const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ id ]))[0];
	if (!stop) throw new Error(`Stop with id '${id}' not found`);
	
	// Return Elron trips.
	if (stop.type === 'train') return void res.send(await elron.getTrips(id));
	
	// Get MNT trips.
	const trips = await cache.use('mnt-stops', id, async () => (await db.query(`
		SELECT trip_id, TIME_TO_SEC(time) AS time, route.name, terminus, wheelchair, route.type, route.region FROM stops AS stop
			JOIN stop_times ON stop_id = id
			JOIN trips AS trip ON trip.id = trip_id
			JOIN routes AS route ON route.id = route_id
			JOIN services AS service ON service.id = trip.service_id
		WHERE
			stop.id = ?
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
	`, [ id ])).map((trip) => ({ ...trip, live: false, provider: 'mnt' })));
	
	// Return merged TLT and MNT trips.
	if (stop.region === 'tallinn') return void res.send(await tlt.mergeTrips(await tlt.getTrips(id), trips));
	
	// Return MNT trips.
	res.send(trips.filter((trip) => trip.time > now).slice(0, 15));
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/trips', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getTrips);
	
	next();
	
};
