-- Origin
UPDATE trips
JOIN (
	SELECT trip_id, name
    FROM stop_times AS time
    JOIN stops ON id = stop_id
    WHERE sequence = (SELECT MIN(sequence) FROM stop_times WHERE trip_id = time.trip_id)
) AS mapping ON trip_id = id
SET origin = name;

-- Destination
UPDATE trips
JOIN (
	SELECT trip_id, name
    FROM stop_times AS time
    JOIN stops ON id = stop_id
    WHERE sequence = (SELECT MAX(sequence) FROM stop_times WHERE trip_id = time.trip_id)
) AS mapping ON trip_id = id
SET destination = name;
