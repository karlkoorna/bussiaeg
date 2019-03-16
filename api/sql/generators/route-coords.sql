UPDATE routes AS route
JOIN (
	SELECT route_id, AVG(lat) AS lat, AVG(lng) AS lng FROM trips AS trip
	JOIN stop_times AS time ON trip_id = trip.id
	JOIN stops AS stop ON stop.id = stop_id
    GROUP BY route_id
) AS coords ON coords.route_id = route.id
SET route.lat = coords.lat, route.lng = coords.lng;
