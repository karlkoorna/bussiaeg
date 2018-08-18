const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	res.send(await db.query(`
		SELECT
			id,
			name,
			type,
			region,
			ROUND(ST_Distance_Sphere(PointFromText(CONCAT('POINT(', lat, ' ', lng, ')')), PointFromText('POINT(? ?)'))) AS distance
		FROM stops
		WHERE
			type IS NOT NULL
			AND name LIKE ?
		ORDER BY LOCATE(?, name), distance
		LIMIT ?
	`, [ req.query['lat'], req.query['lng'], `%${req.query['query']}%`, req.query['query'], req.query['limit'] ]));
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/search', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'query', 'lat', 'lng', 'limit' ],
				properties: {
					query: { type: 'string', minLength: 1 },
					lat: { type: 'number' },
					lng: { type: 'number' },
					limit: { type: 'number' },
				}
			}
		}
	}, getSearch);
	
	next();
	
};
