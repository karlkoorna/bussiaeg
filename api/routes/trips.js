const cache = require('../utils/cache.js');
const mnt = require('../providers/mnt.js');
const elron = require('../providers/elron.js');

// Get trips for route by id.
async function getTrips(req, res) {
	const { route_id: routeId } = req.query;
	let trips = [];
	
	if (routeId.length === 3) trips = res.send(await elron.getTrips(routeId)); // Elron
	else trips = (await mnt.getTrips(routeId)); // MNT + TLT
	
	if (!Object.keys(trips).length) return void res.status(404).send('Trips not found.');
	res.send(trips);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/trips', {
		preHandler: cache.middleware,
		schema: {
			querystring: {
				type: 'object',
				required: [ 'route_id' ],
				properties: {
					route_id: { type: 'string' }
				}
			}
		}
	}, getTrips);
	
	next();
};
