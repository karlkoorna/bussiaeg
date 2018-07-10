const got = require('got');

const mnt = require('../providers/mnt.js');
const elron = require('../providers/elron.js');
const tlt = require('../providers/tlt.js');
const time = require('../utils/time.js');

// Get trips for stop
async function getTrips(req, res) {
	
	const id = req.query['id'];
	
	// Pick data source by stop information.
	
	const stop = await mnt.getStop(id);
	
	if (!stop) throw new Error(`Stop with id '${id}' does not exist`);
	
	// Estonia: Elron
	if (stop.type === 'train') return void res.send(await elron.getTrips(id, { hide: true, limit: 15 }));
	
	// Tallinn: TLT + MNT
	if (stop.region === 'tallinn') return void res.send(await tlt.mergeTrips(await tlt.getTrips(id), await mnt.getTrips(id)));
	
	// Estonia: MNT
	res.send(await mnt.getTrips(id));
	
}

module.exports = (fastify, opts, next) => {
	fastify.get('/trips', getTrips);
	next();
};
