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

// Get directions for route.
async function getRouteDirections(req, res) {
	const { id } = req.params;
	const directions = id.length < 5 ? await elron.getRouteDirections(id) : await mnt.getRouteDirections(id, req.query.trip_id);
	if (!directions) return void res.status(404).send('Route not found.');
	
	res.send(directions);
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
	
	fastify.get('/routes/:id/directions', {
		preHandler: cache.middleware(6),
		schema: {
			params: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		},
		querystring: {
			type: 'object',
			properties: {
				trip_id: { type: 'string' }
			}
		}
	}, getRouteDirections);
	
	next();
};
