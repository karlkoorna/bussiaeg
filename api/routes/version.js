const info = require('../package.json');

function getVersion(req, res) {
	res.send(info.version);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/version', getVersion);
	next();
};
