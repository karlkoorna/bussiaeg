CREATE TABLE IF NOT EXISTS stops (
	id NVARCHAR(32) NOT NULL,
	name NVARCHAR(48) NOT NULL,
	description NVARCHAR(48),
	type VARCHAR(16),
	lat DECIMAL(8, 6) NOT NULL,
	lng DECIMAL(8, 6) NOT NULL,
	alias NVARCHAR(48),
	region VARCHAR(16),
	PRIMARY KEY (id),
	KEY (lat, lng)
);

CREATE TABLE IF NOT EXISTS stop_times (
	stop_id NVARCHAR(32) NOT NULL,
	trip_id MEDIUMINT(6) UNSIGNED NOT NULL,
	time TIME NOT NULL,
	sequence TINYINT(3) UNSIGNED NOT NULL,
	PRIMARY KEY (stop_id, trip_id, time),
	KEY (trip_id, sequence)
);

CREATE TABLE IF NOT EXISTS stop_routes (
	stop_id NVARCHAR(32) NOT NULL,
	route_id CHAR(32) NOT NULL,
	PRIMARY KEY (stop_id, route_id)
);

CREATE TABLE IF NOT EXISTS trips (
	id MEDIUMINT(6) UNSIGNED NOT NULL,
	route_id CHAR(32) NOT NULL,
	service_id MEDIUMINT(6) UNSIGNED NOT NULL,
	direction VARCHAR(32) NOT NULL,
	origin NVARCHAR(48),
	destination NVARCHAR(48),
	wheelchair BOOLEAN NOT NULL,
	PRIMARY KEY (id),
	KEY (route_id)
);

CREATE TABLE IF NOT EXISTS routes (
	id CHAR(32) NOT NULL,
	name NVARCHAR(32) NOT NULL,
	description NVARCHAR(112),
	type VARCHAR(16),
	region VARCHAR(16) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS services (
	id MEDIUMINT(6) UNSIGNED NOT NULL,
	days CHAR(7) NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	PRIMARY KEY (id),
	KEY (days, start, end)
);

CREATE TABLE IF NOT EXISTS service_exceptions (
	service_id MEDIUMINT(6) UNSIGNED NOT NULL,
	date DATE NOT NULL,
	active BOOL NOT NULL,
	PRIMARY KEY (service_id, date),
	KEY (date, active)
);
