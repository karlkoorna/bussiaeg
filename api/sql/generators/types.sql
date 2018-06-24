UPDATE stops AS stop
LEFT JOIN
	(
		SELECT
			stop_id,
			(
				CASE
					WHEN LOCATE('trol', types) > 0 THEN 'trol'
					WHEN LOCATE('tram', types) > 0 THEN 'tram'
					WHEN LOCATE('bus', types) > 0 THEN 'bus'
					WHEN LOCATE('coach-c', types) > 0 THEN 'coach-c'
					WHEN LOCATE('coach-cc', types) > 0 THEN 'coach-cc'
				END
			) AS type
		FROM
			(
				SELECT stop_id, GROUP_CONCAT(route.type) AS types FROM stop_times AS time
				LEFT OUTER JOIN trips AS trip ON trip.id = time.trip_id
				LEFT OUTER JOIN routes AS route ON route.id = trip.route_id
				GROUP BY stop_id
			) AS types
	) AS types ON types.stop_id = stop.id
SET stop.type = types.type;

DELETE FROM stops WHERE type = 'train' OR type IS NULL;
DELETE FROM routes WHERE type = 'train' OR type IS '';
