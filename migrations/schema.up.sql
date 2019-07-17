CREATE TABLE users (
  id serial PRIMARY KEY,
  email VARCHAR(60) UNIQUE NOT NULL,
  first_name VARCHAR(60),
  last_name VARCHAR(60),
  password VARCHAR(60),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bus (
  id serial PRIMARY KEY,
  number_plate VARCHAR(60) UNIQUE NOT NULL,
  manufacturer VARCHAR(60) NOT NULL,
  model VARCHAR(60) NOT NULL,
  year VARCHAR(60) NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TYPE status_type AS ENUM ('active', 'cancelled');

CREATE TABLE trip (
  id serial PRIMARY KEY,
  bus_id INTEGER,
  origin VARCHAR(60) NOT NULL,
  destination VARCHAR(60) NOT NULL,
  trip_date DATE NOT NULL,
  fare FLOAT,
  status status_type DEFAULT 'active',
  CONSTRAINT trip_bus_id_fkey FOREIGN KEY (bus_id)
    REFERENCES bus (id) MATCH SIMPLE
);

CREATE TABLE booking (
  id serial,
  trip_id INTEGER,
  user_id INTEGER,
  created_on TIMESTAMP NOT NULL,
  seat_number INTEGER NOT NULL,
  PRIMARY KEY (trip_id, user_id),
  CONSTRAINT booking_trip_id_fkey FOREIGN KEY (trip_id)
    REFERENCES trip (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT booking_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES users (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);