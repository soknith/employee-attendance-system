-- Update afternoon_end default from 17:00 to 15:20 (school no longer operates until 5PM)
ALTER TABLE school_settings ALTER COLUMN afternoon_end SET DEFAULT '15:20';

-- Update any existing settings rows that still use the old 17:00 value
UPDATE school_settings SET afternoon_end = '15:20' WHERE afternoon_end = '17:00';

-- Ensure afternoon_late_after is 13:15 (15-minute grace period)
ALTER TABLE school_settings ALTER COLUMN afternoon_late_after SET DEFAULT '13:15';
UPDATE school_settings SET afternoon_late_after = '13:15' WHERE afternoon_late_after IS NULL OR afternoon_late_after = '13:00';

-- Ensure morning defaults are correct
ALTER TABLE school_settings ALTER COLUMN morning_start SET DEFAULT '07:00';
ALTER TABLE school_settings ALTER COLUMN morning_late_after SET DEFAULT '07:15';
ALTER TABLE school_settings ALTER COLUMN morning_end SET DEFAULT '11:00';
ALTER TABLE school_settings ALTER COLUMN afternoon_start SET DEFAULT '13:00';

UPDATE school_settings
SET morning_start = '07:00', morning_late_after = '07:15', morning_end = '11:00',
    afternoon_start = '13:00', afternoon_late_after = '13:15', afternoon_end = '15:20'
WHERE morning_start IS NULL OR afternoon_start IS NULL;
