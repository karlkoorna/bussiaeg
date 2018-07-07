const db = require('../../db.js');

module.exports = () => {
	return new Promise(async (resolve) => {
		
		const terminuses = await db.query(`
			SELECT time.stop_id, GROUP_CONCAT(terminus.area) AS areas FROM stop_times AS time
				JOIN (
					SELECT trip_id, area FROM stop_times
					JOIN stops ON id = stop_id
					WHERE (trip_id, sequence) IN (
						SELECT trip_id, MAX(sequence) FROM stop_times GROUP BY trip_id
					)
				) AS terminus ON terminus.trip_id = time.trip_id
			GROUP BY stop_id
		`);
		
		let query = 'START TRANSACTION;';
		
		for (const terminus of terminuses) {
			
			const counts = {}
			const areas = terminus.areas.split(',');
			
			for (const area of areas) counts[area] = 0;
			for (const area of areas) counts[area]++;
			
			query += `UPDATE stops SET direction = '${Object.entries(counts).sort((a, b) => a[1] < b[1])[0][0]}' WHERE id = '${terminus.stop_id}';`;
			
		}
		
		await db.query(`${query}COMMIT;`);
		resolve();
		
	});
};
