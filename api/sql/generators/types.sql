UPDATE stops AS stop
LEFT JOIN (
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
	FROM (
		SELECT stop_id, GROUP_CONCAT(type) AS types FROM stop_times
		JOIN trips AS trip ON trip.id = trip_id
		JOIN routes AS route ON route.id = route_id
		GROUP BY stop_id
	) AS types
) AS types ON stop_id = id
SET stop.type = types.type;
