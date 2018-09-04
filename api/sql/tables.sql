DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS stop_times;
DROP TABLE IF EXISTS stop_routes;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_exceptions;
DROP TABLE IF EXISTS favorites;

CREATE TABLE stops (
	id NVARCHAR(32) NOT NULL,
	name NVARCHAR(32) NOT NULL,
	lat DECIMAL(10, 8) NOT NULL,
	lng DECIMAL(11, 8) NOT NULL,
	direction NVARCHAR(32),
	type VARCHAR(16),
	region VARCHAR(32),
	PRIMARY KEY (id),
	KEY (lat, lng)
);

CREATE TABLE stop_times (
	stop_id NVARCHAR(32) NOT NULL,
	trip_id MEDIUMINT(6) NOT NULL,
	time TIME NOT NULL,
	sequence TINYINT(2) NOT NULL,
	PRIMARY KEY (stop_id, trip_id, time),
	KEY (trip_id, sequence)
);

CREATE TABLE stop_routes (
	stop_id NVARCHAR(32) NOT NULL,
	route_id CHAR(32) NOT NULL,
	PRIMARY KEY (stop_id, route_id),
	KEY (route_id)
);

CREATE TABLE trips (
	id MEDIUMINT(6) NOT NULL,
	route_id CHAR(32) NOT NULL,
	service_id MEDIUMINT(6) NOT NULL,
	wheelchair BOOL NOT NULL,
	origin NVARCHAR(32) NOT NULL,
	destination NVARCHAR(32) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE routes (
	id CHAR(32) NOT NULL,
	name NVARCHAR(16) NOT NULL,
	lat DECIMAL(10, 8),
	lng DECIMAL(11, 8),
	origin NVARCHAR(32),
	destination NVARCHAR(32),
	type VARCHAR(16),
	region VARCHAR(32),
	PRIMARY KEY (id)
);

CREATE TABLE services (
	id MEDIUMINT(6) NOT NULL,
	days CHAR(7) NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	PRIMARY KEY (id),
	KEY (days, start, end)
);

CREATE TABLE service_exceptions (
	service_id MEDIUMINT(6) NOT NULL,
	date DATE NOT NULL,
	type BOOL NOT NULL,
	PRIMARY KEY (service_id, date),
	KEY (date, type)
);

CREATE TABLE favorites (
	id CHAR(4) NOT NULL,
	data JSON NOT NULL,
	PRIMARY KEY (id)
);
