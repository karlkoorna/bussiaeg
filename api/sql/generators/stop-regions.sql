UPDATE stops AS stop
JOIN (
	SELECT
		stop_id,
		(
			CASE
				WHEN LOCATE('tallinn', regions) > 0 THEN 'tallinn'
				WHEN LOCATE('tartu', regions) > 0 THEN 'tartu'
				WHEN LOCATE('parnu', regions) > 0 THEN 'parnu'
			END
		) AS region
	FROM (
		SELECT stop_id, GROUP_CONCAT(region) AS regions FROM stop_times
		JOIN trips AS trip ON trip.id = trip_id
		JOIN routes AS route ON route.id = route_id
		GROUP BY stop_id
	) AS regions
) AS regions ON stop_id = id
SET stop.region = regions.region;