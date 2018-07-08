UPDATE trips AS trip
JOIN stop_times ON trip_id = trip.id
JOIN stops AS stop ON stop.id = stop_id
SET terminus = name
WHERE (trip_id, sequence) IN (
	SELECT trip_id, MAX(sequence) FROM stop_times WHERE trip_id = trip.id
);
