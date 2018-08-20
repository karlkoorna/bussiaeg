const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	const { query, type, lat, lng } = req.query;
	const params = lat && lng ? [ lat, lng, `%${query || ''}%` ] : [ `%${query || ''}%` ];
	
	switch (type) {
		
		case 'stops': {
			
			return void res.send(await db.query(`
				SELECT
					id, name, direction, type
					${lat && lng ? ",ROUND(ST_Distance_Sphere(PointFromText(CONCAT('POINT(', lat, ' ', lng, ')')), PointFromText('POINT(? ?)'))) AS distance" : ''}
				FROM stops
				WHERE
					type IS NOT NULL
					AND name LIKE ?
				${lat && lng ? 'ORDER BY distance' : ''}
				LIMIT 30
			`, params));
			
		}
		
		case 'routes': {
			
			return void res.send(await db.query(`
				SELECT
					route_id, route.name, origin, destination, route.type
					${lat && lng ? ",MIN(ROUND(ST_Distance_Sphere(PointFromText(CONCAT('POINT(', stop.lat, ' ', stop.lng, ')')), PointFromText('POINT(? ?)')))) AS distance" : ''}
				FROM stop_routes
				JOIN stops AS stop ON stop.id = stop_id
				JOIN routes AS route ON route.id = route_id
				WHERE
					stop.type IS NOT NULL
					AND route.name LIKE ?
				${lat && lng ? 'GROUP BY route_id' : ''}
				ORDER BY ${lat && lng ? 'distance,' : ''} LENGTH(route.name), route.name
				LIMIT 30
			`, params));
			
		}
		
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/search', {
		schema: {
			querystring: {
				type: 'object',
				anyOf: [
					{ required: [ 'query', 'type', 'lat', 'lng' ] },
					{ required: [ 'type', 'lat', 'lng' ] },
					{ required: [ 'query', 'type' ] }
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
