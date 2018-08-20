INSERT INTO stop_routes (route_id, stop_id) (
	SELECT route_id, stop.id
	FROM stops AS stop
	JOIN stop_times ON stop_id = stop.id
	JOIN trips AS trip ON trip.id = trip_id
	JOIN routes AS route ON route.id = route_id
	GROUP BY route.id, stop.id
);
