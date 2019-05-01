const got = require('got');

// Proxy request.
async function getProxy(req, res) {
	res.send((await got(req.query.url, { timeout: 1000, retry: 1 })).body);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/proxy', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'url' ],
				properties: {
					url: { type: 'string' }
				}
			}
		}
	}, getProxy);
	
	next();
};
