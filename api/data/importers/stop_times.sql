TRUNCATE TABLE stop_times;

LOAD DATA LOCAL INFILE 'tmp/stop_times.csv' INTO TABLE stop_times
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@trip_id, @stop_id, @stop_sequence, @arrival_time, @departure_time, @timepoint, @shape_dist_traveled, @pickup_type, @drop_off_type, @stop_headsign_code, @stop_headsign)
SET
	stop_id = @stop_id,
	trip_id = @trip_id,
	time = @departure_time,
	sequence = @stop_sequence;
