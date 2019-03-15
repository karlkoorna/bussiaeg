TRUNCATE TABLE trips;

LOAD DATA LOCAL INFILE 'tmp/trips.csv' INTO TABLE trips FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@route_id, @service_id, @trip_id, @trip_headsign, @trip_long_name, @direction_code, @shape_id, @wheelchair_accessible) SET
id = @trip_id,
route_id = @route_id,
service_id = @service_id,
origin = IF(
	SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '- ', -1) != @trip_long_name,
	TRIM(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '- ', 1), ' OSALISELT NÕUDELIIN', ' (osaliselt nõudeliin)'), ' NÕUDELIIN', ' (nõudeliin)'), '(kesklinna)', '(Kesklinna)')),
	TRIM(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '-', 1), ' OSALISELT NÕUDELIIN', ' (osaliselt nõudeliin)'), ' NÕUDELIIN', ' (nõudeliin)'), '(kesklinna)', '(Kesklinna)'))
),
destination = IF(
	SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '- ', -1) != @trip_long_name,
	TRIM(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '- ', -1), ' OSALISELT NÕUDELIIN', ' (osaliselt nõudeliin)'), ' NÕUDELIIN', ' (nõudeliin)'), '(kesklinna)', '(Kesklinna)')),
	TRIM(REPLACE(REPLACE(REPLACE(SUBSTRING_INDEX(REPLACE(@trip_long_name, '–', '-'), '-', -1), ' OSALISELT NÕUDELIIN', ' (osaliselt nõudeliin)'), ' NÕUDELIIN', ' (nõudeliin)'), '(kesklinna)', '(Kesklinna)'))
);
