const db = require('../db.js');

const package = require('../package.json');

async function getVersion(req, res) {
	res.send(package.version);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/version', getVersion);
	next();
};
