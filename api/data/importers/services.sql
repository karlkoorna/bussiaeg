TRUNCATE TABLE services;

LOAD DATA LOCAL INFILE 'tmp/calendar.csv' INTO TABLE services
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@service_id, @monday, @tuesday, @wednesday, @thursday, @friday, @saturday, @sunday, @start_date, @end_date)
SET
	id = @service_id,
	days = CONCAT(@monday, @tuesday, @wednesday, @thursday, @friday, @saturday, @sunday),
	start = @start_date,
	end = @end_date;
