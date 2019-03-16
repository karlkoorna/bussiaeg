/* Tables */

CREATE TABLE IF NOT EXISTS stops (
	id NVARCHAR(32) NOT NULL,
	name NVARCHAR(32) NOT NULL,
	description NVARCHAR(48),
	type VARCHAR(16),
	lat DECIMAL(10, 8) NOT NULL,
	lng DECIMAL(11, 8) NOT NULL,
	region VARCHAR(32),
	PRIMARY KEY (id),
	KEY (lat, lng)
);

CREATE TABLE IF NOT EXISTS stop_times (
	stop_id NVARCHAR(32) NOT NULL,
	trip_id MEDIUMINT(6) NOT NULL,
	time TIME NOT NULL,
	sequence TINYINT(2) NOT NULL,
	PRIMARY KEY (stop_id, trip_id, time),
	KEY (trip_id, sequence)
);

CREATE TABLE IF NOT EXISTS trips (
	id MEDIUMINT(6) NOT NULL,
	route_id CHAR(32) NOT NULL,
	service_id MEDIUMINT(6) NOT NULL,
	origin NVARCHAR(48) NOT NULL,
	destination NVARCHAR(48) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS routes (
	id CHAR(32) NOT NULL,
	uid VARCHAR(32),
	name NVARCHAR(16) NOT NULL,
	type VARCHAR(16),
	lat DECIMAL(10, 8),
	lng DECIMAL(11, 8),
	origin NVARCHAR(32) NOT NULL,
	destination NVARCHAR(32) NOT NULL,
	region VARCHAR(32),
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS services (
	id MEDIUMINT(6) NOT NULL,
	days CHAR(7) NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	PRIMARY KEY (id),
	KEY (days, start, end)
);

CREATE TABLE IF NOT EXISTS service_exceptions (
	service_id MEDIUMINT(6) NOT NULL,
	date DATE NOT NULL,
	type BOOL NOT NULL,
	PRIMARY KEY (service_id, date),
	KEY (date, type)
);
