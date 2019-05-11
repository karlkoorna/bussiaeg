TRUNCATE TABLE stops;

LOAD DATA LOCAL INFILE 'tmp/stops.csv' INTO TABLE stops
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@stop_id, @stop_code, @stop_name, @stop_lat, @stop_lon, @zone_id, @alias, @stop_area, @stop_desc, @lest_x, @lest_y, @zone_name)
SET
	id = @stop_id,
	name = REPLACE(@stop_name, ' parkla', ''),
	lat = @stop_lat,
	lng = @stop_lon,
	alias = SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(@alias, ',', 1), ';', 1), ' (', 1); -- Single alias without note.

LOAD DATA LOCAL INFILE 'tmp/elron.csv' INTO TABLE stops
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@name, @lat, @lng)
SET
	id = @name,
	name = @name,
	lat = @lat,
	lng = @lng,
	type = 'train',
	region = 'other';
