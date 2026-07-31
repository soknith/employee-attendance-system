-- Auto-create notifications for admins/principals when a leave request is submitted
-- Runs as SECURITY DEFINER to bypass RLS (teachers can't read other profiles)

CREATE OR REPLACE FUNCTION notify_on_leave_request_insert()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  teacher_name TEXT;
  recipient RECORD;
BEGIN
  SELECT COALESCE(full_name_km, full_name, 'A teacher') INTO teacher_name
  FROM teachers WHERE id = NEW.teacher_id;

  FOR recipient IN
    SELECT user_id FROM profiles WHERE role IN ('super_admin', 'admin', 'principal')
  LOOP
    INSERT INTO notifications (user_id, title, body, type, is_read)
    VALUES (
      recipient.user_id,
      'New Leave Request',
      teacher_name || ' requested ' || COALESCE(NEW.leave_type, 'leave') || ' leave from ' || NEW.start_date || ' to ' || NEW.end_date || '. Reason: ' || COALESCE(NEW.reason, 'N/A'),
      'leave_request',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_leave_request_insert ON leave_requests;
CREATE TRIGGER trg_notify_leave_request_insert
  AFTER INSERT ON leave_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_on_leave_request_insert();

-- Auto-notify the teacher when their leave is approved
CREATE OR REPLACE FUNCTION notify_on_leave_request_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  teacher_user_id UUID;
  msg TEXT;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO teacher_user_id FROM teachers WHERE id = NEW.teacher_id;
  IF teacher_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    msg := 'Your ' || COALESCE(NEW.leave_type, 'leave') || ' request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been approved.';
    INSERT INTO notifications (user_id, title, body, type, is_read)
    VALUES (teacher_user_id, 'Leave Approved', msg, 'leave_request', false);
  ELSIF NEW.status = 'rejected' THEN
    msg := 'Your ' || COALESCE(NEW.leave_type, 'leave') || ' request from ' || NEW.start_date || ' to ' || NEW.end_date || ' has been rejected.';
    INSERT INTO notifications (user_id, title, body, type, is_read)
    VALUES (teacher_user_id, 'Leave Rejected', msg, 'leave_request', false);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_leave_request_update ON leave_requests;
CREATE TRIGGER trg_notify_leave_request_update
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_leave_request_update();
