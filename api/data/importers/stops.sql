TRUNCATE TABLE stops;

LOAD DATA LOCAL INFILE 'tmp/stops.csv' INTO TABLE stops
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@stop_id, @stop_code, @stop_name, @stop_lat, @stop_lon, @stop_desc, @wheelchair_boarding, @platform_code, @location_type, @parent_station, @stop_timezone, @stop_url, @tts_stop_name, @zone_id, @alias, @stop_area, @authority, @kommentaar, @kovde_oigusakt, @lest_x, @lest_y)
SET
	id = @stop_id,
	name = REPLACE(@stop_name, ' parkla', ''),
	lat = @stop_lat,
	lng = @stop_lon,
	alias = SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(@alias, ',', 1), ';', 1), ' (', 1); -- Keep only one alias, remove note.

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
