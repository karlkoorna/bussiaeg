DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS stop_times;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_exceptions;

CREATE TABLE stops (
	id NVARCHAR(32) NOT NULL,
	name NVARCHAR(32) NOT NULL,
	lat DECIMAL(10,8) NOT NULL,
	lng DECIMAL(11,8) NOT NULL,
	region NVARCHAR(32) NOT NULL,
	type NVARCHAR(32),
	PRIMARY KEY (id),
	UNIQUE (id)
);

CREATE TABLE stop_times (
	stop_id INT(16) NOT NULL,
	trip_id INT(16) NOT NULL,
	arrival TIME NOT NULL,
	departure TIME NOT NULL,
	PRIMARY KEY (stop_id, trip_id)
);

CREATE TABLE trips (
	id INT(16) NOT NULL,
	route_id CHAR(32) NOT NULL,
	service_id INT(16) NOT NULL,
	wheelchair BIT NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (id)
);

CREATE TABLE routes (
	id CHAR(32) NOT NULL,
	type NVARCHAR(16) NOT NULL,
	authority NVARCHAR(32) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (id)
);

CREATE TABLE services (
	id INT(16) NOT NULL,
	days VARCHAR(45) NOT NULL,
	start DATE NOT NULL,
	end DATE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (id)
);

CREATE TABLE service_exceptions (
	service_id INT(16) NOT NULL,
	date DATE NOT NULL,
	active BIT NOT NULL,
	PRIMARY KEY (service_id)
);
