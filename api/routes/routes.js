const _ = require('lodash');

const db = require('../db.js');
const cache = require('../utils/cache.js');
const elron = require('../providers/elron.js');

// Get route by parameters.
async function getRoutes(req, res) {
	
	const { stop: stopId, name, type, provider } = req.query;
	
	res.send(await cache.use('routes', `${stopId}-${name}-${type}`, async () => {
		
		switch (provider) {
			
			case 'mnt':
			case 'tlt': {
				
				const routes = _.groupBy(await db.query(`
					SELECT stop_id, name, type, origin, destination FROM stop_times
					JOIN stops AS stop ON stop.id = stop_id
					JOIN trips AS trip ON trip.id = trip_id
					WHERE (trip_id, destination) IN (
						SELECT trip_id, trip.destination FROM trips AS trip
						JOIN routes AS route ON route.id = trip.route_id
						JOIN stop_times ON trip_id = trip.id
						WHERE stop_id = ? AND name = ? AND type = ?
					)
					GROUP BY route_id, destination, sequence
				`, [ stopId, name, type ]), (route) => `${route.origin} - ${route.destination}`);
				
				// Exclude unused stop object.
				for (const key in routes) routes[key] = routes[key].map((stop) => ({
					id: stop.stop_id,
					name: stop.name,
					type: stop.type
				}));
				
				return routes;
				
			}
			
			case 'elron': {
				return await elron.getRoute(stopId);
			}
			
		}
		
	}));
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/routes', {
		beforeHandler: cache.middleware,
		schema: {
			querystring: {
				type: 'object',
				required: [ 'name', 'type', 'provider', 'stop' ],
				properties: {
					name: { type: 'string' },
					type: { type: 'string' },
					provider: { type: 'string', enum: [ 'mnt', 'tlt', 'elron' ] },
					stop: { type: 'string' }
				}
			}
		}
	}, getRoutes);
	
	next();
	
};
