LOAD DATA LOCAL INFILE 'tmp/routes.txt' INTO TABLE routes FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@route_id, @agency_id, @route_short_name, @route_long_name, @route_type, @route_color, @competent_authority) SET
id = @route_id,
type = (
	IF (@route_color = 'E6FA32' OR @route_color = 'F55ADC', 'coach',
		IF (@route_type = 0, 'tram',
			IF (@route_type = 2, 'train',
				IF (@route_type = 3, 'bus',
					IF (@route_type = 800, 'trol', NULL)))))
),
region = @competent_authority;
