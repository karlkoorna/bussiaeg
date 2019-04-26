-- Prune data starting from stops.
DELETE stops, stop_times FROM stops
LEFT JOIN stop_times ON stop_id = id
WHERE type IS NULL;

-- Prune data starting from routes.
DELETE route, trip, stop_times, shape FROM routes AS route
JOIN trips AS trip ON route_id = route.id
JOIN stop_times ON trip_id = trip.id
JOIN shapes AS shape ON shape.id = shape_id
WHERE type IS NULL;
