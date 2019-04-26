SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE shapes;
SET FOREIGN_KEY_CHECKS = 1;

LOAD DATA LOCAL INFILE 'tmp/shapes.csv' INTO TABLE shapes
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@shape_id, @shape_pt_lat, @shape_pt_lon, @shape_pt_sequence)
SET
	id = @shape_id,
	lat = @shape_pt_lat,
	lng = @shape_pt_lon,
	sequence = @shape_pt_sequence;
