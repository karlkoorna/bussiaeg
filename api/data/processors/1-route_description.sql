UPDATE routes -- Left
JOIN (
    SELECT route_id, name, alias
    FROM trips AS trip
    JOIN stop_times ON trip_id = trip.id
    JOIN stops AS stop ON stop.id = stop_id
    WHERE sequence = (SELECT MIN(sequence) FROM stop_times WHERE trip_id = trip.id)
) AS stop ON route_id = id
SET description = IF(LOCATE('coach', type) > 0, COALESCE(NULLIF(alias, ''), stop.name), stop.name);

UPDATE routes -- Right
JOIN (
    SELECT route_id, name, alias
    FROM trips AS trip
    JOIN stop_times ON trip_id = trip.id
    JOIN stops AS stop ON stop.id = stop_id
    WHERE sequence = (SELECT MAX(sequence) FROM stop_times WHERE trip_id = trip.id)
) AS stop ON route_id = id
SET description = CONCAT(description, ' – ', IF(LOCATE('coach', type) > 0, COALESCE(NULLIF(alias, ''), stop.name), stop.name));

UPDATE routes -- Center
JOIN (
    SELECT route_id, name, alias
    FROM trips AS trip
    JOIN stop_times ON trip_id = trip.id
    JOIN stops AS stop ON stop.id = stop_id
    WHERE sequence = (SELECT FLOOR(AVG(sequence)) FROM stop_times WHERE trip_id = trip.id)
) AS stop ON route_id = id
SET description = CONCAT(SUBSTRING_INDEX(description, ' – ', 1), ' – ', stop.name, ' – ', SUBSTRING_INDEX(description, ' – ', 1))
WHERE SUBSTRING_INDEX(description, ' – ', 1) = SUBSTRING_INDEX(description, ' – ', -1);
