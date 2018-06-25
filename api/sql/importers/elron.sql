LOAD DATA LOCAL INFILE 'tmp/elron.txt' INTO TABLE stops FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@name, @lat, @lng) SET
id = @name,
name = @name,
lat = @lat,
lng = @lng,
type = 'train';
