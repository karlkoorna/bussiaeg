const cache = require('../utils/cache.js');
const mnt = require('../providers/mnt.js');
const elron = require('../providers/elron.js');

// Get routes by id.
async function getRoute(req, res) {
	const { id } = req.params;
	
	const route = id.length < 5 ? await elron.getRoute(id) : await mnt.getRoute(id);
	if (!route) return void res.status(404).send('Route not found.');
	
	res.send(route);
}

// Get trips for route.
async function getRouteTrips(req, res) {
	const { id } = req.params;
	const stop = id.length < 5 ? await elron.getRouteTrips(id) : await mnt.getRouteTrips(id);
	if (!stop) return void res.status(404).send('Route not found.');
	
	res.send(stop);
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
			}
		}
	}, getRouteTrips);
	
	next();
};
