UPDATE stops AS stop
LEFT JOIN (
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
		SELECT stop_id, GROUP_CONCAT(route.region) AS regions FROM stop_times
		LEFT OUTER JOIN trips AS trip ON trip.id = trip_id
		LEFT OUTER JOIN routes AS route ON route.id = route_id
		GROUP BY stop_id
	) AS regions
) AS regions ON stop_id = id
SET stop.region = regions.region;
