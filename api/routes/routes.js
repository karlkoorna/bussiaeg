const cache = require('../utils/cache.js');
const mnt = require('../providers/mnt.js');

// Get routes by id.
async function getRoute(req, res) {
	const route = await mnt.getRoute(req.params.id);
	if (!route) return void res.status(404).send('Route not found.');
	res.send(route);
}

// Get trips for route.
async function getRouteTrips(req, res) {
	const stop = await mnt.getRoute(req.params.id);
	if (!stop) return void res.status(404).send('Route not found.');
	res.send(await mnt.getRouteTrips(req.params.id, req.query.id));
}

module.exports = (fastify, opts, next) => {
	fastify.get('/routes/:id', {
		preHandler: cache.middleware(6),
		schema: {
			params: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getRoute);
	
	fastify.get('/routes/:id/trips', {
		preHandler: cache.middleware(6),
		schema: {
			params: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			},
			querystring: {
				type: 'object',
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getRouteTrips);
	
	next();
};
