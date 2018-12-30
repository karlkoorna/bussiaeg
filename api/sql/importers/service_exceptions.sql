TRUNCATE TABLE service_exceptions;

LOAD DATA LOCAL INFILE 'tmp/calendar_dates.csv' INTO TABLE service_exceptions FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES
(@service_id, @date, @exception_type) SET
service_id = @service_id,
date =  @date,
type = -@exception_type + 2;
