UPDATE routes AS route
JOIN (
	SELECT
		route_id,
		AVG(lat) AS lat,
		AVG(lng) AS lng
	FROM trips AS trip
	JOIN stop_times ON trip_id = trip.id
	JOIN stops AS stop ON stop.id = stop_id
    GROUP BY route_id
) AS mapping ON route_id = id
SET
	route.lat = mapping.lat,
	route.lng = mapping.lng;
