const cache = require('../utils/cache.js');
const mnt = require('../providers/mnt.js');
const tta = require('../providers/tta.js');
const elron = require('../providers/elron.js');

// Get all stops.
async function getStops(req, res) {
	res.send(await mnt.getStops());
}

// Get stop by id.
async function getStop(req, res) {
	const stop = await mnt.getStop(req.params.id);
	if (!stop) return void res.status(404).send('Stop not found.');
	res.send(stop);
}

// Get trips for stop.
async function getStopDepartures(req, res) {
	const { id } = req.params;
	
	// Verify stop, get type and region.
	const stop = await mnt.getStop(id);
	if (!stop) return void res.status(404).send('Stop not found.');
	
	// Elron TODO: Switch to MNT data, merge with data from Elron.
	if (stop.type === 'train') return void res.send(await elron.getStopDepartures(id));
	
	// MNT + TLT
	if (stop.region === 'tallinn') return void res.send(await tta.getStopDepartures(id, await mnt.getStopDepartures(id, true)));
	
	// MNT
	res.send(await mnt.getStopDepartures(id));
}

module.exports = (fastify, opts, next) => {
	fastify.get('/stops', {
		preHandler: cache.middleware(6)
	}, getStops);
	
	fastify.get('/stops/:id', {
		preHandler: cache.middleware(6),
		schema: {
			params: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getStop);
	
	fastify.get('/stops/:id/departures', {
		schema: {
			params: {
				type: 'object',
				required: [ 'id' ],
				properties: {
					id: { type: 'string' }
				}
			}
		}
	}, getStopDepartures);
	
	next();
};
