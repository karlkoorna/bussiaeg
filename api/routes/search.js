const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	const { query, lat, lng } = req.query;
	const params = lat && lng ? [ lng, lat, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	const [ stops, routes ] = await Promise.all([
		db.query(`
			SELECT
				id, name, direction, type
				${lat && lng ? ", ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance" : ''}
			FROM stops
			WHERE
				type IS NOT NULL
				AND name LIKE ?
			${lat && lng ? 'ORDER BY distance' : ''}
			LIMIT 15
		`, params),
		db.query(`
			SELECT id, name, origin, destination, route_type AS type
			${lat && lng ? ', distance' : ''}
			FROM (
				SELECT
					route_id AS id, route.name, origin, destination, route.type AS route_type, stop.type AS stop_type
					${lat && lng ? ", ROUND(ST_DISTANCE_SPHERE(POINT(stop.lng, stop.lat), POINT(?, ?))) AS distance" : ''}
				FROM stop_routes
				JOIN stops AS stop ON stop.id = stop_id
				JOIN routes AS route ON route.id = route_id
				GROUP BY route_id
				LIMIT 15
			) AS stop_route
			WHERE
				stop_type IS NOT NULL
				AND route_type IS NOT NULL
				AND name LIKE ?
				ORDER BY ${lat && lng ? 'distance,' : ''} LENGTH(name), name
		`, params)
	]);
	
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
