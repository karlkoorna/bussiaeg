const cache = require('../utils/cache.js');
const info = require('../package.json');

// Get project version from package file.
function getVersion(req, res) {
	res.send(info.version);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/version', {
		preHandler: cache.middleware
	}, getVersion);
	
	next();
};
