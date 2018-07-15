const db = require('../db.js');
const cache = require('../utils/cache.js');

// Get all stops.
async function getStops(req, res) {
	res.send(await db.query('SELECT * FROM stops'));
}

module.exports = (fastify, opts, next) => {
	fastify.get('/stops', getStops);
	next();
};
