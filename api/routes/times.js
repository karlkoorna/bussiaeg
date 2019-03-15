const db = require('../db.js');
const elron = require('../providers/elron.js');
const tta = require('../providers/tta.js');
const mnt = require('../providers/mnt.js');

// Get times for stop by id.
async function getTimes(req, res) {
	const { stop_id: stopId } = req.query;
	
	// Verify stop, get type and region.
	const stop = (await db.query('SELECT type, region FROM stops WHERE id = ?', [ stopId ]))[0];
	if (!stop) return void res.status(404).send('Stop not found.');
	
	// Elron
	if (stop.type === 'train') return void res.send(await elron.getTimes(stopId));
	
	// MNT + TTA
	let times = [];
	if (stop.region === 'tallinn') times = await tta.getTimes(stopId);
	res.send(times.concat(await mnt.getTimes(stopId, times.length)).sort((prev, next) => prev.countdown - next.countdown));
}

module.exports = (fastify, opts, next) => {
	fastify.get('/times', {
		schema: {
			querystring: {
				type: 'object',
				required: [ 'stop_id' ],
				properties: {
					stop_id: { type: 'string' }
				}
			}
		}
	}, getTimes);
	
	next();
};
