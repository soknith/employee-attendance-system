/*
# Add Performance Indexes and Audit Logs Table

1. Performance Indexes
   - attendance_records: composite index on (teacher_id, scanned_at) for fast per-teacher date queries
   - attendance_records: index on (check_type, scanned_at) for dashboard "today's check-ins" queries
   - attendance_records: index on (status, scanned_at) for filtering by present/late/absent
   - leave_requests: index on (status, start_date, end_date) for "on leave today" queries
   - notifications: index on (user_id, is_read, created_at) for unread count queries

2. New Table: audit_logs
   - Tracks old_value, new_value, who changed it, when, and IP address
   - Separate from activity_logs (which tracks user actions like login/logout)
   - RLS: admin-only read, any authenticated can insert
*/

-- ============ PERFORMANCE INDEXES ============

CREATE INDEX IF NOT EXISTS idx_attendance_teacher_date ON attendance_records(teacher_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_attendance_checktype_date ON attendance_records(check_type, scanned_at);
CREATE INDEX IF NOT EXISTS idx_attendance_status_date ON attendance_records(status, scanned_at);
CREATE INDEX IF NOT EXISTS idx_leave_status_dates ON leave_requests(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at);

-- ============ AUDIT LOGS TABLE ============

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_audit_logs" ON audit_logs;
CREATE POLICY "read_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.role IN ('super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
