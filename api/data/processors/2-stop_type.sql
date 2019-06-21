UPDATE stops AS stop
JOIN (
	SELECT
		stop_id,
		GROUP_CONCAT(type) AS types
	FROM stop_times
	JOIN trips AS trip ON trip.id = trip_id
	JOIN routes AS route ON route.id = route_id
	GROUP BY stop_id
) AS mapping ON stop_id = id
SET
	type = (
		CASE
			WHEN LOCATE('trol', types) > 0 THEN 'trol'
			WHEN LOCATE('bus', types) > 0 THEN 'bus' -- Coaches stops are also bus stops, bus stops take precedence.
			WHEN LOCATE('coach_cc', types) > 0 THEN 'coach_cc'
			WHEN LOCATE('coach_c', types) > 0 THEN 'coach_c'
			WHEN LOCATE('tram', types) > 0 THEN 'tram'
			WHEN LOCATE('ferry', types) > 0 THEN 'ferry'
			ELSE NULL
		END
	)
WHERE type IS NULL;
