TRUNCATE TABLE stop_times;

LOAD DATA LOCAL INFILE 'tmp/stop_times.csv' INTO TABLE stop_times FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@trip_id, @arrival_time, @departure_time, @stop_id, @stop_sequence, @pickup_type, @drop_off_type) SET
stop_id = @stop_id,
trip_id = @trip_id,
time = @departure_time,
sequence = @stop_sequence;
