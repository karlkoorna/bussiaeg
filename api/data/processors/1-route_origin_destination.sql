UPDATE routes
JOIN (
	SELECT route_id, area
	FROM trips AS trip
    JOIN stop_times ON trip_id = trip.id
    JOIN stops AS stop ON stop.id = stop_id
    WHERE sequence = (SELECT MIN(sequence) FROM stop_times WHERE trip_id = trip.id)
) AS mapping ON route_id = id
SET origin = area;

UPDATE routes
JOIN (
	SELECT route_id, area
	FROM trips AS trip
    JOIN stop_times ON trip_id = trip.id
    JOIN stops AS stop ON stop.id = stop_id
    WHERE sequence = (SELECT MAX(sequence) FROM stop_times WHERE trip_id = trip.id)
) AS mapping ON route_id = id
SET destination = area;
