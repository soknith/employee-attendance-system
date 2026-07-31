-- Create teacher records for all teacher profiles that don't have one yet
INSERT INTO teachers (user_id, name, department, gender, status, email)
SELECT p.user_id, p.full_name, 'General', 'other', 'active', 
       (SELECT email FROM auth.users WHERE id = p.user_id)
FROM profiles p
WHERE p.role = 'teacher'
  AND NOT EXISTS (
    SELECT 1 FROM teachers t WHERE t.user_id = p.user_id
  );