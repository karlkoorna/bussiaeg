const db = require('../db.js');
const elron = require('../providers/elron.js');
const tta = require('../providers/tta.js');
const mnt = require('../providers/mnt.js');

// Get trips for stop.
async function getTrips(req, res) {
	const { stop_id: stopId } = req.query;
	let trips = [];
	
	// Verify stop, get type and region.
	const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ stopId ]))[0];
	if (!stop) throw new Error(`Stop with id '${stopId}' not found`);
	
	// Elron
	if (stop.type === 'train') return res.send(await elron.getTrips(stopId));
	
	// TTA + MNT
	if (stop.region === 'tallinn') trips = await tta.getTrips(stopId);
	trips = trips.concat(await mnt.getTrips(stopId, trips.length)).sort((a, b) => a.countdown - b.countdown);
	
	res.send(trips);
}

module.exports = (fastify, opts, next) => {
	fastify.get('/trips', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'stop_id' ],
				properties: {
					stop_id: { type: 'string' }
				}
			}
		}
	}, getTrips);
	
	next();
};
