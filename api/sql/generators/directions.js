const _ = require('lodash');

const db = require('../../db.js');

module.exports = () => {
	return new Promise(async (resolve) => {
		
		const stops = await db.query(`
			SELECT stop_id, GROUP_CONCAT(destination) AS destinations FROM stop_times
			JOIN trips AS trip ON trip.id = trip_id
			GROUP BY stop_id
		`);
		
		// Start building transaction query.
		let query = 'START TRANSACTION;';
		
		// Get the most common destination for all trips serving a stop;
		for (const stop of stops) query += `UPDATE stops SET direction = '${_.max(Object.entries(_.countBy(stop.destinations.split(','))))[0]}' WHERE id = '${stop.stop_id}';`;
		
		await db.query(`${query}COMMIT;`);
		resolve();
		
	});
};
