LOAD DATA LOCAL INFILE 'tmp/trips.csv' INTO TABLE trips FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@route_id, @service_id, @trip_id, @trip_headsign, @trip_long_name, @direction_code, @shape_id, @wheelchair_accessible) SET
id = @trip_id,
route_id = @route_id,
service_id = @service_id,
origin = CUTLONGNAME(@trip_long_name, 1),
destination = CUTLONGNAME(@trip_long_name, -1);
