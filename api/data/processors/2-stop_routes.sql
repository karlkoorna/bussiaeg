TRUNCATE TABLE stop_routes;

INSERT stop_routes (stop_id, route_id)
SELECT DISTINCT stop_id, route_id
FROM stop_times
JOIN trips ON id = trip_id;
