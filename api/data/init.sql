SET sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')); -- For MNT departures query. TODO: Check if can be removed.

CREATE TABLE IF NOT EXISTS stops (
	id NVARCHAR(32) NOT NULL,
	name NVARCHAR(48) NOT NULL,
	direction NVARCHAR(48),
	type VARCHAR(16),
	lat DECIMAL(8, 6) NOT NULL,
	lng DECIMAL(8, 6) NOT NULL,
	area NVARCHAR(32),
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
	shape_id MEDIUMINT(6) UNSIGNED NOT NULL,
	wheelchair BOOLEAN NOT NULL,
	origin NVARCHAR(48),
	destination NVARCHAR(48),
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS routes (
	id CHAR(32) NOT NULL,
	name NVARCHAR(32) NOT NULL,
	type VARCHAR(16),
	region VARCHAR(16) NOT NULL,
	origin NVARCHAR(48),
	destination NVARCHAR(48),
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

CREATE TABLE IF NOT EXISTS shapes (
	id MEDIUMINT(6) UNSIGNED NOT NULL,
	lat DECIMAL(8, 6) NOT NULL,
	lng DECIMAL(8, 6) NOT NULL,
	sequence TINYINT(3) UNSIGNED NOT NULL,
	PRIMARY KEY (id, sequence)
);
