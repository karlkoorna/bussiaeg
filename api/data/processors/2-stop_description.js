const _ = require('lodash');
const db = require('../../db.js');

module.exports = async () => {
	const stops = await db.query(`
		SELECT
			stop.id,
			stop.name,
			GROUP_CONCAT(route.type, ':', destination) AS destinations
		FROM stops AS stop
		JOIN stop_times AS time ON stop_id = stop.id
		JOIN trips AS trip ON trip.id = trip_id
		JOIN routes AS route ON route.id = route_id
		GROUP BY stop_id
	`);
	
	let query = 'START TRANSACTION;';
	
	// Get the most common destination for all trips serving a stop with coaches having the least priority.
	for (const stop of stops) {
		if (!stop.destinations) continue;
		
		let destinations = stop.destinations.split(',');
		if (!destinations.every((destination) => destination.startsWith('coach'))) destinations = destinations.filter((destination) => !destination.startsWith('coach'));
		const variants = _.chain(destinations).map((destination) => destination.split(':')[1]).countBy().map((value, key) => [ key, value ]).sortBy('[1]').reverse().map('[0]').value();
		query += `UPDATE stops SET description = '${variants[Number(variants.length > 1 && stop.name === variants[0])]}' WHERE id = '${stop.id}';`;
	}
	
	await db.query(query + 'COMMIT;');
};
