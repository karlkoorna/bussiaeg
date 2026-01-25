TRUNCATE TABLE trips;

LOAD DATA LOCAL INFILE 'tmp/trips.csv' INTO TABLE trips
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@trip_id, @route_id, @service_id, @direction_id, @shape_id, @trip_headsign, @trip_headsign_code, @trip_short_name, @wheelchair_accessible, @bikes_allowed, @block_id)
SET
	id = @trip_id,
	route_id = @route_id,
	service_id = @service_id,
	direction = @direction_code,
	wheelchair = @wheelchair_accessible;
