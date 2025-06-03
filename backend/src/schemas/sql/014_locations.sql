-- Location Data (for search optimization)
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(3) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  is_major_city BOOLEAN DEFAULT FALSE,
  UNIQUE(city, state, country)
);