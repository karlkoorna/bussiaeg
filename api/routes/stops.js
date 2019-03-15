const db = require('../db.js');

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
		schema: {
			querystring: {
				type: 'object',
				anyOf: [
					{ required: [ 'id' ] },
					{ required: [ 'lat_min', 'lat_max', 'lng_min', 'lng_max' ] }
				]
			}
		}
	}, getStops);
	
	next();
};
