const cache = require('../utils/cache.js');
const mnt = require('../providers/mnt.js');
const elron = require('../providers/elron.js');

// Get routes by stop id, trip name, type and provider.
async function getRoutes(req, res) {
	const { id } = req.query;
	let routes = [];
	
	if (id.length === 3) routes = res.send(await elron.getRoutes(id)); // Elron
	else routes = (await mnt.getRoutes(id)); // MNT + TLT
	
	if (!Object.keys(routes).length) return void res.status(404).send('Vehicle not found.');
	res.send(routes);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/routes', {
		preHandler: cache.middleware,
		schema: {
			querystring: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getRoutes);
	
	next();
};
