-- Correct venue coordinates after the initial PostGIS backfill.
-- Run this on databases where migrations/001_add_postgis_venue_locations.sql
-- has already been applied.

WITH corrected_coordinates(name, latitude, longitude) AS (
  VALUES
    ('OSNYC', 40.7159526, -73.9967427),
    ('Bowlero Times Square', 40.7576550, -73.9870647),
    ('VR World NYC', 40.7482147, -73.9842503),
    ('Uptown Gaming Bar and Lounge', 40.8571855, -73.9326079),
    ('Chinatown Fair Family Fun Center', 40.7139951, -73.9986049),
    ('The Uncommons', 40.7294160, -73.9987086),
    ('Barcade (Chelsea)', 40.7442179, -73.9945262),
    ('8-Bit Bites (7th Ave)', 40.7430265, -73.9960937),
    ('Barcade (St.Mark''s Place)', 40.7290914, -73.9895672),
    ('8-Bit Bites', 40.7265742, -73.9893763),
    ('Dave & Buster''s NYC', 40.7562126, -73.9884380)
)
UPDATE arcades
SET
  latitude = corrected_coordinates.latitude,
  longitude = corrected_coordinates.longitude,
  location = ST_SetSRID(
    ST_MakePoint(corrected_coordinates.longitude, corrected_coordinates.latitude),
    4326
  )::geography
FROM corrected_coordinates
WHERE arcades.name = corrected_coordinates.name;
