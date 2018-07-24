const db = require('../../db.js');

module.exports = () => {
	return new Promise(async (resolve) => {
		
		const stops = await db.query(`
			SELECT stop_id, GROUP_CONCAT(terminus) AS terminuses FROM stop_times
			JOIN trips AS trip ON trip.id = trip_id
			GROUP BY stop_id
		`);
		
		let query = 'START TRANSACTION;';
		
		for (const stop of stops) {
			
			const counts = {}
			const terminuses = stop.terminuses.split(',');
			
			for (const terminus of terminuses) if (counts[terminus]) counts[terminus]++; else counts[terminus] = 0;
			
			query += `UPDATE stops SET direction = '${Object.entries(counts).sort((a, b) => a[1] < b[1])[0][0]}' WHERE id = '${stop.stop_id}';`;
			
		}
		
		await db.query(`${query}COMMIT;`);
		resolve();
		
	});
};
