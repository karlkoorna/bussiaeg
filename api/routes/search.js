const db = require('../db.js');

// Search stops by name, sort by distance.
async function getSearch(req, res) {
	const { query, lat, lng } = req.query;
	const params = lat && lng ? [ lng, lat, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	const stops = await db.query(`
		SELECT
			id, name, description, type
			${lat && lng ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance' : ''}
		FROM stops
		WHERE
			type IS NOT NULL
			AND name LIKE ?
		${lat && lng ? 'ORDER BY distance' : ''}
		LIMIT 15
	`, params);
	
	res.send(stops);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/search', {
		schema: {
			querystring: {
				type: 'object',
				anyOf: [
					{ required: [ 'query', 'lat', 'lng' ] },
					{ required: [ 'lat', 'lng' ] },
					{ required: [ 'query' ] }
				],
				properties: {
					query: { type: 'string' },
					type: { type: 'string', enum: [ 'stops', 'routes' ] },
					lat: { type: 'number' },
					lng: { type: 'number' }
				}
			}
		}
	}, getSearch);
	
	next();
};
