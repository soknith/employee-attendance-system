-- Fix infinite recursion in profiles RLS policies
-- The problem: policies on profiles query profiles itself, causing infinite recursion
-- Solution: use a SECURITY DEFINER function that bypasses RLS to check role

CREATE OR REPLACE FUNCTION public.is_staff_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('super_admin','admin','principal')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role IN ('super_admin','admin')
  );
$$;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;

-- Recreate policies using the helper functions (no recursion)
CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff_admin());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Fix other tables that also have the same recursion issue
-- departments
DROP POLICY IF EXISTS "write_departments" ON departments;
CREATE POLICY "write_departments" ON departments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- school_settings
DROP POLICY IF EXISTS "write_school_settings" ON school_settings;
CREATE POLICY "write_school_settings" ON school_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- academic_years
DROP POLICY IF EXISTS "write_academic_years" ON academic_years;
CREATE POLICY "write_academic_years" ON academic_years
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- holidays
DROP POLICY IF EXISTS "write_holidays" ON holidays;
CREATE POLICY "write_holidays" ON holidays
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- teachers
DROP POLICY IF EXISTS "write_teachers" ON teachers;
CREATE POLICY "write_teachers" ON teachers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- teaching_schedules
DROP POLICY IF EXISTS "write_teaching_schedules" ON teaching_schedules;
CREATE POLICY "write_teaching_schedules" ON teaching_schedules
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- leave_requests
DROP POLICY IF EXISTS "update_leave_requests" ON leave_requests;
CREATE POLICY "update_leave_requests" ON leave_requests
  FOR UPDATE TO authenticated
  USING (public.is_staff_admin())
  WITH CHECK (public.is_staff_admin());

DROP POLICY IF EXISTS "delete_leave_requests" ON leave_requests;
CREATE POLICY "delete_leave_requests" ON leave_requests
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- notifications
DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- activity_logs
DROP POLICY IF EXISTS "read_activity_logs" ON activity_logs;
CREATE POLICY "read_activity_logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- attendance_records
DROP POLICY IF EXISTS "delete_attendance" ON attendance_records;
CREATE POLICY "delete_attendance" ON attendance_records
  FOR DELETE TO authenticated
  USING (public.is_admin());
