LOAD DATA LOCAL INFILE 'tmp/stops.txt' INTO TABLE stops FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@stop_id, @stop_code, @stop_name, @stop_lat, @stop_lon, @zone_id, @alias, @stop_area, @stop_desc, @lest_x, @lest_y, @zone_name) SET
id = @stop_id,
name = @stop_name,
lat = @stop_lat,
lng = @stop_lon,
region = @zone_name;
