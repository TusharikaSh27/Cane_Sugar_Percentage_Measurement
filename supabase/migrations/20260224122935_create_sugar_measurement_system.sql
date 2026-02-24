/*
  # Sugar Measurement System Database Schema

  ## Overview
  Complete database schema for real-time sugar percentage measurement system
  in industrial sugar mill environment.

  ## New Tables

  ### 1. sensors
  - `id` (uuid, primary key) - Unique sensor identifier
  - `name` (text) - Sensor display name
  - `type` (text) - Sensor type (NIR, Polarimeter, etc.)
  - `location` (text) - Physical location in mill
  - `status` (text) - Current operational status
  - `calibration_date` (timestamptz) - Last calibration timestamp
  - `accuracy_rating` (numeric) - Accuracy specification
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. sensor_readings
  - `id` (uuid, primary key) - Unique reading identifier
  - `sensor_id` (uuid, foreign key) - Reference to sensor
  - `pol_percentage` (numeric) - Sugar content percentage
  - `brix` (numeric) - Total dissolved solids
  - `moisture_content` (numeric) - Moisture percentage
  - `temperature` (numeric) - Sample temperature
  - `flow_rate` (numeric) - Cane flow rate (tonnes/hour)
  - `quality_score` (numeric) - Reading quality indicator
  - `timestamp` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz) - Record creation time

  ### 3. calibration_records
  - `id` (uuid, primary key) - Calibration record ID
  - `sensor_id` (uuid, foreign key) - Reference to sensor
  - `lab_pol_value` (numeric) - Laboratory reference value
  - `sensor_pol_value` (numeric) - Sensor measured value
  - `deviation` (numeric) - Difference between lab and sensor
  - `calibrated_by` (text) - Technician name
  - `notes` (text) - Calibration notes
  - `timestamp` (timestamptz) - Calibration timestamp
  - `created_at` (timestamptz) - Record creation time

  ### 4. system_alerts
  - `id` (uuid, primary key) - Alert identifier
  - `sensor_id` (uuid, foreign key) - Reference to sensor
  - `alert_type` (text) - Type of alert
  - `severity` (text) - Alert severity level
  - `message` (text) - Alert message
  - `acknowledged` (boolean) - Acknowledgment status
  - `acknowledged_by` (text) - User who acknowledged
  - `acknowledged_at` (timestamptz) - Acknowledgment time
  - `created_at` (timestamptz) - Alert creation time

  ### 5. production_batches
  - `id` (uuid, primary key) - Batch identifier
  - `batch_number` (text) - Batch tracking number
  - `start_time` (timestamptz) - Batch start time
  - `end_time` (timestamptz) - Batch end time
  - `avg_pol` (numeric) - Average pol percentage
  - `total_tonnage` (numeric) - Total cane processed
  - `quality_grade` (text) - Batch quality classification
  - `notes` (text) - Batch notes
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Policies allow authenticated users full access
  - Public read-only access for monitoring dashboard
*/

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'active',
  calibration_date timestamptz DEFAULT now(),
  accuracy_rating numeric DEFAULT 0.2,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  pol_percentage numeric NOT NULL,
  brix numeric,
  moisture_content numeric,
  temperature numeric,
  flow_rate numeric,
  quality_score numeric DEFAULT 100,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index for faster time-series queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);

-- Create calibration_records table
CREATE TABLE IF NOT EXISTS calibration_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  lab_pol_value numeric NOT NULL,
  sensor_pol_value numeric NOT NULL,
  deviation numeric GENERATED ALWAYS AS (sensor_pol_value - lab_pol_value) STORED,
  calibrated_by text NOT NULL,
  notes text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create system_alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text DEFAULT 'info',
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_by text,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create production_batches table
CREATE TABLE IF NOT EXISTS production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number text UNIQUE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  avg_pol numeric,
  total_tonnage numeric,
  quality_grade text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;

-- Create policies for sensors
CREATE POLICY "Allow public read access to sensors"
  ON sensors FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users full access to sensors"
  ON sensors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for sensor_readings
CREATE POLICY "Allow public read access to sensor_readings"
  ON sensor_readings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users full access to sensor_readings"
  ON sensor_readings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for calibration_records
CREATE POLICY "Allow public read access to calibration_records"
  ON calibration_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users full access to calibration_records"
  ON calibration_records FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for system_alerts
CREATE POLICY "Allow public read access to system_alerts"
  ON system_alerts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users full access to system_alerts"
  ON system_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for production_batches
CREATE POLICY "Allow public read access to production_batches"
  ON production_batches FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users full access to production_batches"
  ON production_batches FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample sensors
INSERT INTO sensors (name, type, location, status, accuracy_rating) VALUES
  ('NIR Sensor Alpha', 'Near-Infrared Spectroscopy', 'Conveyor Belt A - Entry Point', 'active', 0.15),
  ('Polarimeter Beta', 'Automatic Polarimeter', 'Feed Table B - Main Line', 'active', 0.18),
  ('NIR Sensor Gamma', 'Near-Infrared Spectroscopy', 'Conveyor Belt C - Secondary', 'maintenance', 0.20)
ON CONFLICT DO NOTHING;