const db = require('../db.js');
const cache = require('../utils/cache.js');

// Get routes by id.
async function getRoutes(req, res) {
	const routes = await db.query(`
		SELECT * FROM routes WHERE id = ?
	`, [ req.query.id ]);
	
	if (!routes.length) return void res.status(404).send('Route not found.');
	return void res.send(routes);
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
