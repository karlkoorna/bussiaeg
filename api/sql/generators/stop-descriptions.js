const _ = require('lodash');

const db = require('../../db.js');

module.exports = async () => {
	const stops = await db.query(`
		SELECT stop_id, GROUP_CONCAT(type, ':', route.destination) AS destinations FROM stop_times
		JOIN trips AS trip ON trip.id = trip_id
		JOIN routes AS route ON route.id = route_id
		GROUP BY stop_id
	`);
	
	let query = 'START TRANSACTION;';
	
	// Get the most common destination for all trips serving a stop with coaches having the least priority.
	for (const stop of stops) {
		if (!stop.destinations) continue;
		let destinations = stop.destinations.split(',');
		if (destinations.reduce((prev, curr) => prev + Number(curr.startsWith('coach')), 0) !== destinations.length) destinations = destinations.filter((destination) => !destination.startsWith('coach'));
		query += `UPDATE stops SET description = '${_(destinations.map((destination) => destination.split(':')[1])).countBy().entries().maxBy('[1]')[0]}' WHERE id = '${stop.stop_id}';`;
	}
	
	await db.query(`${query}COMMIT;`);
};
