LOAD DATA LOCAL INFILE 'tmp/routes.csv' INTO TABLE routes FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@route_id, @agency_id, @route_short_name, @route_long_name, @route_type, @route_color, @competent_authority) SET
id = @route_id,
name = @route_short_name,
type = (
	CASE
		WHEN @route_color = 'F55ADC' OR @route_color = '00933C' THEN 'coach-c'
		WHEN @route_color = 'E6FA32' THEN 'coach-cc'
		WHEN @route_type = 0 THEN 'tram'
		WHEN @route_type = 3 THEN 'bus'
		WHEN @route_type = 800 THEN 'trol'
		ELSE NULL
	END
),
region = (
	CASE
		WHEN LOCATE('Tallinn', @competent_authority) > 0 THEN 'tallinn'
		WHEN LOCATE('Tartu', @competent_authority) > 0 THEN 'tartu'
		WHEN LOCATE('Pärnu', @competent_authority) > 0 THEN 'parnu'
		WHEN @route_type = 2 THEN NULL
		ELSE 'other'
	END
);
