LOAD DATA LOCAL INFILE 'tmp/trips.txt' INTO TABLE trips FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@route_id, @service_id, @trip_id, @trip_headsign, @trip_long_name, @direction_code, @shape_id, @wheelchair_accessible) SET
	id = @service_id, route_id = @route_id, service_id = @service_id, wheelchair = @wheelchair_accessible;
