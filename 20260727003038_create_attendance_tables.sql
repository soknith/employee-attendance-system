/*
# Create attendance tracking tables (single-tenant, no auth)

1. New Tables
- `teachers`
  - `id` (uuid, primary key)
  - `name` (text, teacher's full name)
  - `department` (text, department name)
  - `created_at` (timestamp)
- `attendance_records`
  - `id` (uuid, primary key)
  - `teacher_id` (uuid, foreign key to teachers)
  - `qr_code` (text, the scanned QR code value)
  - `latitude` (double precision, GPS latitude at scan time)
  - `longitude` (double precision, GPS longitude at scan time)
  - `accuracy_meters` (double precision, GPS accuracy in meters)
  - `status` (text: present / late / absent)
  - `scanned_at` (timestamp, when attendance was recorded)
  - `note` (text, optional note)

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).

3. Notes
- This is a single-tenant app with no authentication.
- GPS coordinates are captured client-side via the browser Geolocation API and stored with each attendance record.
*/

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  qr_code text NOT NULL,
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  status text NOT NULL DEFAULT 'present',
  scanned_at timestamptz DEFAULT now(),
  note text
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_attendance" ON attendance_records;
CREATE POLICY "anon_select_attendance" ON attendance_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance_records;
CREATE POLICY "anon_insert_attendance" ON attendance_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_attendance" ON attendance_records;
CREATE POLICY "anon_update_attendance" ON attendance_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance_records;
CREATE POLICY "anon_delete_attendance" ON attendance_records FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attendance_teacher ON attendance_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON attendance_records(scanned_at);
