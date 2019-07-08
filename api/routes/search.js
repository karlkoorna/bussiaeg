const db = require('../db.js');

// Search stops and routes by name, sort by distance.
async function getSearch(req, res) {
	const { query, lat, lng } = req.query;
	
	const [ stops, routes ] = await Promise.all([
		db.query(`
				SELECT
					id, name, description, type
					${lat ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(:lng, :lat))) AS distance' : ''}
				FROM stops
				WHERE
					TRUE
					${lat && !query ? `
					AND lat BETWEEN :lat - .3 AND :lat + .3
					AND lng BETWEEN :lng - .3 AND :lng + .3
					` : ''}
					${query ? 'AND name LIKE :query' : ''}
				ORDER BY ${query ? 'LENGTH(name), ' : ''}${lat ? 'distance, ' : ''}name
				LIMIT 15
			`, {
			query: `%${query}%`,
			lat,
			lng
		}),
		db.query(`
				SELECT
					route_id AS id, name, description, type
					${lat ? ', distance' : ''}
				FROM routes AS route
				JOIN stop_routes ON route_id = route.id
				JOIN (
					SELECT
						id
						${lat ? ', ROUND(ST_DISTANCE_SPHERE(POINT(lng, lat), POINT(:lng, :lat))) AS distance' : ''}
				    FROM stops
					${lat && !query ? `
					WHERE
						lat BETWEEN :lat - .3 AND :lat + .3
						AND lng BETWEEN :lng - .3 AND :lng + .3
					` : ''}
					${lat ? 'ORDER BY distance' : ''}
				    ${query ? '' : 'LIMIT 100'}
				) AS stop ON stop.id = stop_id
				${query ? 'WHERE name LIKE :query OR description LIKE :query' : ''}
				GROUP BY route_id
				ORDER BY ${query ? 'LENGTH(name), ' : ''}${lat ? 'distance, ' : ''}name
				LIMIT 15
			`, {
			query: `%${query}%`,
			lat,
			lng
		})
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
					lat: { type: 'number' },
					lng: { type: 'number' }
				}
			}
		}
	}, getSearch);
	
	next();
};
