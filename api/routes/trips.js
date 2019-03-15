const db = require('../db.js');
const elron = require('../providers/elron.js');
const tta = require('../providers/tta.js');
const mnt = require('../providers/mnt.js');

// Get trips for stop.
async function getTrips(req, res) {
	const { stop_id: stopId } = req.query;
	
	// Verify stop, get type and region.
	const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ stopId ]))[0];
	if (!stop) return void res.status(404).send('Stop not found.');
	
	// Elron
	if (stop.type === 'train') return void res.send(await elron.getTrips(stopId));
	
	// MNT + TTA
	let trips = [];
	if (stop.region === 'tallinn') trips = await tta.getTrips(stopId);
	res.send(trips.concat(await mnt.getTrips(stopId, trips.length)).sort((prev, next) => prev.countdown - next.countdown));
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
