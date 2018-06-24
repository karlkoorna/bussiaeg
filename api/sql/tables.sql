DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS stop_times;
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
	region NVARCHAR(32),
	type VARCHAR(32),
	PRIMARY KEY (id),
	KEY (lat),
	KEY (lng)
);

CREATE TABLE stop_times (
	stop_id NVARCHAR(32) NOT NULL,
	trip_id INT(16) NOT NULL,
	arrival TIME NOT NULL,
	departure TIME NOT NULL,
	sequence TINYINT(3) NOT NULL
);

CREATE TABLE trips (
	id INT(16) NOT NULL,
	route_id CHAR(32) NOT NULL,
	service_id INT(16) NOT NULL,
	wheelchair BOOL NOT NULL,
	PRIMARY KEY (id),
	KEY (route_id),
	KEY (service_id)
);

CREATE TABLE routes (
	id CHAR(32) NOT NULL,
	region VARCHAR(16),
	type VARCHAR(16),
	PRIMARY KEY (id)
);

CREATE TABLE services (
	id INT(16) NOT NULL,
	days BIT(7) NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE service_exceptions (
	service_id INT(16) NOT NULL,
	date DATE NOT NULL,
	type BOOL NOT NULL
);

CREATE TABLE favorites (
	id CHAR(4) NOT NULL,
	data JSON NOT NULL,
	PRIMARY KEY (id)
);
