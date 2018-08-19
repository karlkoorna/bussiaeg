const db = require('../db.js');

// Get favorites by id.
async function getSearch(req, res) {
	
	const { query, type, lat, lng } = req.query;
	
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
				ORDER BY ${lat && lng ? 'distance' : ''}
				LIMIT 30
			`, lat && lng ? [ lat, lng, `%${query}%` ] : [ `%${query}%` ]));
			
		}
		
		case 'routes': {
			
			return void res.send(await db.query(`
				SELECT
					id, name, origin, destination, type,
					ROUND(ST_Distance_Sphere(PointFromText(CONCAT('POINT(', lat, ' ', lng, ')')), PointFromText('POINT(? ?)'))) AS distance
				FROM routes
				WHERE
					type IS NOT NULL
					AND name LIKE ?
				ORDER BY distance
				LIMIT 30
			`, [ lat, lng, `%${query}%` ]));
			
		}
		
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/search', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'type' ],
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
