const db = require('../db.js');
const cache = require('../utils/cache.js');

// Get all stops inside geofence or one stop by id.
async function getStops(req, res) {
	const { id, lat_min, lat_max, lng_min, lng_max } = req.query;
	
	const stops = await db.query(`
		SELECT * FROM stops
		WHERE
			type IS NOT NULL
			AND ${id ? 'id = ?' : 'lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?'}
	`, id ? [ id ] : [ lat_min, lat_max, lng_min, lng_max ]);
	
	if (id && !stops.length) return void res.status(404).send('Stop not found.');
	res.send(id ? stops[0] : stops);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/stops', {
		preHandler: cache.middleware(6),
		schema: {
			querystring: {
				type: 'object',
				anyOf: [
					{ required: [ 'id' ] },
					{ required: [ 'lat_min', 'lat_max', 'lng_min', 'lng_max' ] }
				],
				properties: {
					id: { type: 'string' },
					lat_min: { type: 'number' },
					lat_max: { type: 'number' },
					lng_min: { type: 'number' },
					lng_max: { type: 'number' }
				}
			}
		}
	}, getStops);
	
	next();
};
