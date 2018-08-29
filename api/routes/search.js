const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	const { query, lat, lng } = req.query;
	const params = lat && lng ? [ lng, lat, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	const stops = await db.query(`
		SELECT
			id, name, direction, type
			${lat && lng ? ",ROUND(ST_Distance_Sphere(ST_PointFromText(CONCAT('POINT(', lng, ' ', lat, ')')), ST_PointFromText('POINT(? ?)'))) AS distance" : ''}
		FROM stops
		WHERE
			type IS NOT NULL
			AND name LIKE ?
		${lat && lng ? 'ORDER BY distance' : ''}
		LIMIT 30
	`, params);
	
	const routes = await db.query(`
		SELECT
			route_id AS id, route.name, origin, destination, route.type
			${lat && lng ? ",MIN(ROUND(ST_Distance_Sphere(ST_PointFromText(CONCAT('POINT(', stop.lng, ' ', stop.lat, ')')), ST_PointFromText('POINT(? ?)')))) AS distance" : ''}
		FROM stop_routes
		JOIN stops AS stop ON stop.id = stop_id
		JOIN routes AS route ON route.id = route_id
		WHERE
			stop.type IS NOT NULL
			AND route.type IS NOT NULL
			AND route.name LIKE ?
		${lat && lng ? 'GROUP BY route_id' : ''}
		ORDER BY ${lat && lng ? 'distance,' : ''} LENGTH(route.name), route.name
		LIMIT 30
	`, params);
	
	res.send({
		stops,
		routes
	});
	
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
