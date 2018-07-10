const db = require('../db.js');

const mnt = require('../providers/mnt.js');

// Get stops or stop by id.
async function getStops(req, res) {
	const id = req.query['id'];
	res.send(id ? await mnt.getStop(id) : await mnt.getStops());
}

module.exports = (fastify, opts, next) => {
	fastify.get('/stops', getStops);
	next();
};
