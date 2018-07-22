const db = require('../db.js');
const cache = require('../utils/cache.js');
const elron = require('../providers/elron.js');

// Get trip by id.
async function getTrip(req, res) {
	
	const id = req.query['id'];
	const provider = req.query['provider'];
	
	switch (provider) {
		
		case 'mnt':
		case 'tlt': {
			
			const trip = (await db.query(`
				SELECT name, terminus, type, region FROM trips AS trip
				JOIN routes AS route ON route.id = route_id
				WHERE trip.id = ?
			`, [ id ]))[0];
			
			if (!trip) throw new Error(`Trip with id '${id}' not found`);
			
			trip.stops = await db.query(`
				SELECT stop.id, name, stop.type, stop.region, time FROM trips AS trip
				JOIN stop_times AS time ON time.trip_id = trip.id
				JOIN stops AS stop ON stop.id = stop_id
				WHERE trip.id = ?
			`, [ id ]);
			
			return void res.send(trip);
			
		}
		
		case 'elron': {
			return void res.send(await elron.getTrip(id));
		}
		
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/trip', {
		beforeHandler: cache.middleware,
		schema: {
			querystring: {
				type: 'object',
				required: [ 'id', 'provider' ],
				properties: {
					id: { type: 'string' },
					provider: { type: 'string', enum: [ 'mnt', 'tlt', 'elron' ] }
				}
			}
		}
	}, getTrip);
	
	next();
	
};