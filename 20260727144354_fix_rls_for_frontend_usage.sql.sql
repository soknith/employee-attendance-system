-- Allow teachers to delete their own pending leave requests
DROP POLICY IF EXISTS delete_own_leave_requests ON leave_requests;
CREATE POLICY delete_own_leave_requests ON leave_requests
  FOR DELETE TO authenticated
  USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- Allow all authenticated users to insert teaching schedules
DROP POLICY IF EXISTS insert_teaching_schedules ON teaching_schedules;
CREATE POLICY insert_teaching_schedules ON teaching_schedules
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow teachers to delete their own teaching schedules
DROP POLICY IF EXISTS delete_own_teaching_schedules ON teaching_schedules;
CREATE POLICY delete_own_teaching_schedules ON teaching_schedules
  FOR DELETE TO authenticated
  USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- Allow teachers to update their own profile (phone, avatar)
DROP POLICY IF EXISTS update_own_teacher_profile ON teachers;
CREATE POLICY update_own_teacher_profile ON teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
