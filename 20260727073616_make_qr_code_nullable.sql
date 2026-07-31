-- Make qr_code nullable so attendance records can be created without a QR code
ALTER TABLE attendance_records ALTER COLUMN qr_code DROP NOT NULL;