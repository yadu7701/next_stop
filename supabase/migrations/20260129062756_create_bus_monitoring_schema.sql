

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create stops table
CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  sequence integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  current_lat double precision NOT NULL,
  current_lng double precision NOT NULL,
  status text DEFAULT 'on-time' CHECK (status IN ('on-time', 'delayed', 'overcrowded')),
  next_stop_id uuid REFERENCES stops(id) ON DELETE SET NULL,
  pollution_level text DEFAULT 'low' CHECK (pollution_level IN ('low', 'medium', 'high')),
  maintenance_status text DEFAULT 'ok' CHECK (maintenance_status IN ('ok', 'needs-service')),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

-- Public read access for routes
CREATE POLICY "Anyone can view routes"
  ON routes FOR SELECT
  USING (true);

-- Public read access for stops
CREATE POLICY "Anyone can view stops"
  ON stops FOR SELECT
  USING (true);

-- Public read access for buses
CREATE POLICY "Anyone can view buses"
  ON buses FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stops_route_id ON stops(route_id);
CREATE INDEX IF NOT EXISTS idx_stops_sequence ON stops(route_id, sequence);
CREATE INDEX IF NOT EXISTS idx_buses_route_id ON buses(route_id);
CREATE INDEX IF NOT EXISTS idx_buses_updated_at ON buses(updated_at);

-- Seed Kochi sample data
INSERT INTO routes (id, name, description, color) VALUES
  ('R1', 'City Center – Railway Station', 'Main city route connecting commercial hub to railway station', '#2563EB'),
  ('R2', 'Kaloor – Fort Kochi', 'Tourist and heritage corridor', '#22C55E'),
  ('R3', 'Edappally – Infopark', 'IT corridor serving daily commuters', '#EAB308');

INSERT INTO stops (id, route_id, name, lat, lng, sequence) VALUES
  ('S1', 'R1', 'City Center', 9.9312, 76.2673, 1),
  ('S2', 'R1', 'MG Road', 9.9341, 76.2708, 2),
  ('S3', 'R1', 'Kaloor Junction', 9.9982, 76.2999, 3),
  ('S4', 'R1', 'Town Hall', 10.0019, 76.3034, 4),
  ('S5', 'R1', 'Railway Station', 9.9682, 76.2915, 5),

  ('S6', 'R2', 'Kaloor', 9.9976, 76.2991, 1),
  ('S7', 'R2', 'Marine Drive', 9.9816, 76.2767, 2),
  ('S8', 'R2', 'High Court', 9.9838, 76.2734, 3),
  ('S9', 'R2', 'Willingdon Island', 9.9521, 76.2756, 4),
  ('S10', 'R2', 'Fort Kochi', 9.9668, 76.2425, 5),

  ('S11', 'R3', 'Edappally', 10.0253, 76.3086, 1),
  ('S12', 'R3', 'Kakkanad', 10.0159, 76.3419, 2),
  ('S13', 'R3', 'Vazhakkala', 10.0124, 76.3478, 3),
  ('S14', 'R3', 'Chittethukara', 10.0089, 76.3571, 4),
  ('S15', 'R3', 'Infopark', 10.0072, 76.3624, 5);

INSERT INTO buses (id, number, route_id, current_lat, current_lng, status, next_stop_id, pollution_level, maintenance_status)
VALUES
  ('B1', 'KL-07-101', 'R1', 9.9348, 76.2715, 'on-time', 'S3', 'medium', 'ok'),
  ('B2', 'KL-07-102', 'R1', 9.9991, 76.3012, 'delayed', 'S4', 'high', 'needs-service'),
  ('B3', 'KL-07-201', 'R2', 9.9844, 76.2759, 'on-time', 'S8', 'low', 'ok'),
  ('B4', 'KL-07-301', 'R3', 10.0131, 76.3492, 'overcrowded', 'S14', 'medium', 'needs-service');