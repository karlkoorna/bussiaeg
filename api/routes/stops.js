const db = require('../db.js');

// Get stops or stop by id.
async function getStops(req, res) {
	
	const id = req.query['id'];
	
	try {
		res.send(await db.query(`SELECT * FROM stops WHERE type IS NOT NULL ${id ? `AND id = ${id}` : ''}`));
	} catch (ex) {
		res.code(500).send(ex);
	}
	
}

module.exports = (fastify, opts, next) => {
	fastify.get('/stops', getStops);
	next();
};
