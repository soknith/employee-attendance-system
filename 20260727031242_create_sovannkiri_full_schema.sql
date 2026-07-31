/*
# SovannKiri Attendance - Full Schema Restructure

Creates all tables for the complete Teacher Attendance Management System.

1. New Tables
- `profiles` — user roles (super_admin, admin, principal, teacher)
- `departments` — school departments
- `school_settings` — GPS location, radius, time rules
- `academic_years` — academic year records
- `holidays` — school holidays
- `leave_requests` — teacher leave requests
- `teaching_schedules` — class schedules
- `notifications` — system notifications
- `activity_logs` — user activity tracking

2. Modified Tables
- `teachers` — add columns for new system
- `attendance_records` — add columns for GPS, device, status tracking

3. Security
- RLS enabled on all tables, authenticated-only policies
*/

-- ============ PROFILES (roles) ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'teacher',
  full_name text NOT NULL,
  full_name_km text,
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin','principal')));
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin','principal')));
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

-- ============ DEPARTMENTS ============
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_km text,
  code text UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_departments" ON departments;
CREATE POLICY "read_departments" ON departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_departments" ON departments;
CREATE POLICY "write_departments" ON departments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

-- ============ SCHOOL SETTINGS ============
CREATE TABLE IF NOT EXISTS school_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL DEFAULT 'SovannKiri Primary School',
  school_name_km text DEFAULT 'សាលាបឋមសិក្សាសុវណ្ណកិរិ',
  latitude double precision DEFAULT 11.5619,
  longitude double precision DEFAULT 104.9282,
  radius_meters integer DEFAULT 200,
  morning_start time DEFAULT '07:00',
  morning_late_after time DEFAULT '07:15',
  morning_end time DEFAULT '11:00',
  afternoon_start time DEFAULT '13:00',
  afternoon_late_after time DEFAULT '13:15',
  afternoon_end time DEFAULT '17:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_school_settings" ON school_settings;
CREATE POLICY "read_school_settings" ON school_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_school_settings" ON school_settings;
CREATE POLICY "write_school_settings" ON school_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

-- ============ ACADEMIC YEARS ============
CREATE TABLE IF NOT EXISTS academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_academic_years" ON academic_years;
CREATE POLICY "read_academic_years" ON academic_years FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_academic_years" ON academic_years;
CREATE POLICY "write_academic_years" ON academic_years FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

-- ============ HOLIDAYS ============
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_km text,
  date date NOT NULL,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_holidays" ON holidays;
CREATE POLICY "read_holidays" ON holidays FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_holidays" ON holidays;
CREATE POLICY "write_holidays" ON holidays FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

-- ============ TEACHERS (alter existing) ============
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS full_name_km text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS employee_code text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS hire_date date;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id) ON DELETE SET NULL;

-- Migrate name -> full_name if full_name column exists later; for now use name as display
DROP POLICY IF EXISTS "auth_read_teachers" ON teachers;
DROP POLICY IF EXISTS "auth_insert_teachers" ON teachers;
DROP POLICY IF EXISTS "auth_update_teachers" ON teachers;
DROP POLICY IF EXISTS "auth_delete_teachers" ON teachers;
DROP POLICY IF EXISTS "select_own_teachers" ON teachers;
DROP POLICY IF EXISTS "insert_own_teachers" ON teachers;
DROP POLICY IF EXISTS "update_own_teachers" ON teachers;
DROP POLICY IF EXISTS "delete_own_teachers" ON teachers;

CREATE POLICY "read_teachers" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "write_teachers" ON teachers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));
CREATE POLICY "update_own_teacher_profile" ON teachers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_dept_id ON teachers(department_id);

-- ============ ATTENDANCE RECORDS (alter existing) ============
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS distance_meters double precision;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS device_info text;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS browser_info text;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS check_out_at timestamptz;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS attendance_status text;
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS leave_type text;

DROP POLICY IF EXISTS "auth_read_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "auth_insert_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "auth_update_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "auth_delete_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "select_own_attendance" ON attendance_records;
DROP POLICY IF EXISTS "insert_own_attendance" ON attendance_records;
DROP POLICY IF EXISTS "update_own_attendance" ON attendance_records;
DROP POLICY IF EXISTS "delete_own_attendance" ON attendance_records;
DROP POLICY IF EXISTS "admin_all_attendance" ON attendance_records;

CREATE POLICY "read_attendance" ON attendance_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_attendance" ON attendance_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_attendance" ON attendance_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_attendance" ON attendance_records FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON attendance_records(scanned_at);

-- ============ LEAVE REQUESTS ============
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'sick',
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(user_id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_leave_requests" ON leave_requests;
CREATE POLICY "read_leave_requests" ON leave_requests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_leave_requests" ON leave_requests;
CREATE POLICY "insert_leave_requests" ON leave_requests FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_leave_requests" ON leave_requests;
CREATE POLICY "update_leave_requests" ON leave_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin','principal'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin','principal')));
DROP POLICY IF EXISTS "delete_leave_requests" ON leave_requests;
CREATE POLICY "delete_leave_requests" ON leave_requests FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

CREATE INDEX IF NOT EXISTS idx_leave_teacher_id ON leave_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

-- ============ TEACHING SCHEDULES ============
CREATE TABLE IF NOT EXISTS teaching_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  subject_km text,
  grade text,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE teaching_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_teaching_schedules" ON teaching_schedules;
CREATE POLICY "read_teaching_schedules" ON teaching_schedules FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write_teaching_schedules" ON teaching_schedules;
CREATE POLICY "write_teaching_schedules" ON teaching_schedules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON teaching_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON teaching_schedules(day_of_week);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'attendance',
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_notifications" ON notifications;
CREATE POLICY "read_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============ ACTIVITY LOGS ============
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  description text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_activity_logs" ON activity_logs;
CREATE POLICY "read_activity_logs" ON activity_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin','admin')));
DROP POLICY IF EXISTS "insert_activity_logs" ON activity_logs;
CREATE POLICY "insert_activity_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
