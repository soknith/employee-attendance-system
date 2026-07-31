/*
# Add check-in/check-out support to attendance_records

1. Changes to attendance_records
   - Add `check_type` column (text): 'check_in' or 'check_out'
   - Add `shift` column (text): 'morning' (07:00-12:00) or 'afternoon' (14:00-17:00)
   - Make `qr_code` nullable since tap-based check-in no longer uses QR
   - teacher_id becomes required context but stays nullable for safety

2. Notes
   - Existing rows are unaffected (check_type and shift default to null for old records)
   - New tap-based records will always have check_type and shift set
*/

ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS check_type text,
  ADD COLUMN IF NOT EXISTS shift text;
