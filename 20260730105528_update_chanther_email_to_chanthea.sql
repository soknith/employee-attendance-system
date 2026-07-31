/*
# Update auth email for Try Chanther -> Try Chanthea

1. Changes
- Update auth.users email from try.chanther@sovannkiri.edu.kh to try.chanthea@sovannkiri.edu.kh
- Update profiles.full_name from 'Try Chanther' to 'Try Chanthea'
- Update teachers.name and teachers.email accordingly
2. Security
- No schema changes, no RLS changes
- This is a one-time data correction requested by the admin
*/

-- Update auth email using the service role (this migration runs with elevated privileges)
UPDATE auth.users
SET email = 'try.chanthea@sovannkiri.edu.kh',
    email_change = 'try.chanthea@sovannkiri.edu.kh',
    email_change_confirm_status = 1,
    updated_at = now()
WHERE id = '2e91943a-d509-4ef5-b5f1-6c30c500b8ae';

-- Ensure profiles name is updated
UPDATE profiles
SET full_name = 'Try Chanthea', updated_at = now()
WHERE user_id = '2e91943a-d509-4ef5-b5f1-6c30c500b8ae';

-- Ensure teachers name and email are updated
UPDATE teachers
SET name = 'Try Chanthea', email = 'try.chanthea@sovannkiri.edu.kh', updated_at = now()
WHERE user_id = '2e91943a-d509-4ef5-b5f1-6c30c500b8ae';
