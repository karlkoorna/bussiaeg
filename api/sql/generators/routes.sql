UPDATE routes AS nroute
	JOIN (
		SELECT route.id AS id, AVG(stop.lat) AS lat, AVG(stop.lng) AS lng FROM routes AS route
		JOIN trips AS trip ON trip.route_id = route.id
		JOIN stop_times AS time ON time.trip_id = trip.id
		JOIN stops AS stop ON stop.id = time.stop_id
		GROUP BY route.id
    ) AS coords ON coords.id = nroute.id
SET
	nroute.lat = coords.lat,
	nroute.lng = coords.lng;
