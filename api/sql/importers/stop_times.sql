LOAD DATA LOCAL INFILE 'tmp/stop_times.txt' INTO TABLE stop_times FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@trip_id, @arrival_time, @departure_time, @stop_id, @stop_sequence, @pickup_type, @drop_off_type) SET
stop_id = @stop_id,
trip_id = @trip_id,
arrival = @arrival_time,
departure = @departure_time;
