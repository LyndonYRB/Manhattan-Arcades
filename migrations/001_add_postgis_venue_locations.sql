-- Add PostGIS-backed venue locations for Manhattan Arcades.
-- Geography is used so ST_DWithin/ST_Distance operate in meters.

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE arcades
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

-- Keep the PostGIS point synchronized whenever coordinates are inserted or updated.
CREATE OR REPLACE FUNCTION arcades_set_location()
RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_arcades_set_location ON arcades;

CREATE TRIGGER trg_arcades_set_location
BEFORE INSERT OR UPDATE OF latitude, longitude
ON arcades
FOR EACH ROW
EXECUTE FUNCTION arcades_set_location();

-- Sample Manhattan arcade coordinates, matched to the existing seed venues by name.
UPDATE arcades SET latitude = 40.7159526, longitude = -73.9967427 WHERE name = 'OSNYC';
UPDATE arcades SET latitude = 40.7576550, longitude = -73.9870647 WHERE name = 'Bowlero Times Square';
UPDATE arcades SET latitude = 40.7482147, longitude = -73.9842503 WHERE name = 'VR World NYC';
UPDATE arcades SET latitude = 40.8571855, longitude = -73.9326079 WHERE name = 'Uptown Gaming Bar and Lounge';
UPDATE arcades SET latitude = 40.7139951, longitude = -73.9986049 WHERE name = 'Chinatown Fair Family Fun Center';
UPDATE arcades SET latitude = 40.7294160, longitude = -73.9987086 WHERE name = 'The Uncommons';
UPDATE arcades SET latitude = 40.7442179, longitude = -73.9945262 WHERE name = 'Barcade (Chelsea)';
UPDATE arcades SET latitude = 40.7430265, longitude = -73.9960937 WHERE name = '8-Bit Bites (7th Ave)';
UPDATE arcades SET latitude = 40.7290914, longitude = -73.9895672 WHERE name = 'Barcade (St.Mark''s Place)';
UPDATE arcades SET latitude = 40.7265742, longitude = -73.9893763 WHERE name = '8-Bit Bites';
UPDATE arcades SET latitude = 40.7562126, longitude = -73.9884380 WHERE name = 'Dave & Buster''s NYC';

-- Rebuild any existing points after the coordinate backfill.
UPDATE arcades
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_arcades_location
ON arcades
USING GIST (location);
