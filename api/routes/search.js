const db = require('../db.js');

// Search stops and vehicles by name, sort by distance.
async function getSearch(req, res) {
	const { query, lat, lng } = req.query;
	const params = lat ? [ lng, lat, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	const [ stops, vehicles ] = await Promise.all([
		db.query(`
			SELECT
				id, name, description, type
				${lat ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance' : ''}
			FROM stops
			WHERE
				name LIKE ?
				AND type IS NOT NULL
			ORDER BY LENGTH(name),${lat ? ' distance,' : ''} name
			LIMIT 15
		`, params),
		db.query(`
			SELECT
				uid AS id, name, type, origin, destination
				${lat ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(?, ?))) AS distance' : ''}
			FROM routes
			WHERE
				name LIKE ?
				AND type IS NOT NULL
			ORDER BY LENGTH(name),${lat ? ' distance,' : ''} name
			LIMIT 15
		`, params)
	]);
	
	res.send({
		stops,
		vehicles
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
					lat: { type: 'number' },
					lng: { type: 'number' }
				}
			}
		}
	}, getSearch);
	
	next();
};
