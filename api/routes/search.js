const _ = require('lodash');

const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	const { query, lat, lng } = req.query;
	const params = lat && lng ? [ lng, lat, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	const [ stops, routes ] = await Promise.all([
		db.query(`
			SELECT
				id, name, description, type
				${lat && lng ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance' : ''}
			FROM stops
			WHERE
				type IS NOT NULL
				AND name LIKE ?
			${lat && lng ? 'ORDER BY distance' : ''}
			LIMIT 15
		`, params),
		db.query(`
			SELECT
				route_id AS id, route.name, origin, destination, route.type
				${lat && lng ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance' : ''}
			FROM stop_routes
			JOIN stops AS stop ON stop.id = stop_id
			JOIN routes AS route ON route.id = route_id
			WHERE
				stop.type IS NOT NULL
				AND route.type IS NOT NULL
				AND route.name LIKE ?
			ORDER BY ${lat && lng ? 'distance, ' : ''} name
			LIMIT 300
		`, params)
	]);
	
	res.send({
		stops,
		routes: _.uniqBy(routes, 'id').slice(0, 15)
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
