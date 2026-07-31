/*
# Add position and teaching_class columns to teachers table

1. Changes to existing tables
- `teachers`: add `position` (text, nullable) — stores the teacher's job title in Khmer (e.g. "លេខាធិការ", "គ្រូបង្រៀន / ថ្នាក់ទី៦")
- `teachers`: add `teaching_class` (text, nullable) — stores the assigned class (e.g. "ថ្នាក់ទី១" through "ថ្នាក់ទី៦", or NULL if not assigned)

2. Data seeding
- Update each teacher's position and teaching_class based on the provided list:
  - Hol Kimhien: លេខាធិការ (no class)
  - Oeung Rum: បណ្ណរក្ស (no class)
  - Y Saman: គ្រូបង្រៀន / ថ្នាក់ទី៦
  - Hang Sinuon: គ្រូបង្រៀន / ថ្នាក់ទី៥
  - Try Chanther: គ្រូបង្រៀន / ថ្នាក់ទី៤
  - Khvea Vanra: គ្រូបង្រៀន (no class)
  - Ek Pisey: គ្រូបង្រៀន / ថ្នាក់ទី២
  - Soeurng Thary: គ្រូបង្រៀន / ថ្នាក់ទី១
  - Ken Many: គ្រូបង្រៀន (no class)
  - Lyy Naa: គ្រូបង្រៀន / ថ្នាក់ទី៣
- Also update emails to the official @sovannkiri.edu.kh format

3. Security
- No RLS policy changes needed — existing policies on teachers table remain unchanged.

4. Notes
- position and teaching_class are both nullable; NULL means "not assigned"
- The ID card display will show "គ្រូបង្រៀន" when teaching_class is NULL
*/

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS teaching_class text;

-- Seed positions, teaching classes, and emails
UPDATE teachers SET position = 'លេខាធិការ', teaching_class = NULL, email = 'hol.kimhien@sovannkiri.edu.kh' WHERE name ILIKE '%hol%kimhien%' OR name ILIKE '%Hol%Kimhien%';
UPDATE teachers SET position = 'បណ្ណរក្ស', teaching_class = NULL, email = 'oeung.rum@sovannkiri.edu.kh' WHERE name ILIKE '%oeung%rum%' OR name ILIKE '%Oeung*Rum%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី៦', teaching_class = 'ថ្នាក់ទី៦', email = 'y.saman@sovannkiri.edu.kh' WHERE name ILIKE '%y%saman%' OR name ILIKE '%Y*Saman%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី៥', teaching_class = 'ថ្នាក់ទី៥', email = 'hang.sinuon@sovannkiri.edu.kh' WHERE name ILIKE '%hang*sinuon%' OR name ILIKE '%Hang*Sinuon%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី៤', teaching_class = 'ថ្នាក់ទី៤', email = 'try.chanther@sovannkiri.edu.kh' WHERE name ILIKE '%try*chanther%' OR name ILIKE '%Try*Chanther%';
UPDATE teachers SET position = 'គ្រូបង្រៀន', teaching_class = NULL, email = 'khvea.vanra@sovannkiri.edu.kh' WHERE name ILIKE '%khvea*vanra%' OR name ILIKE '%Khvea*Vanra%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី២', teaching_class = 'ថ្នាក់ទី២', email = 'ek.pisey@sovannkiri.edu.kh' WHERE name ILIKE '%ek*pisey%' OR name ILIKE '%Ek*Pisey%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី១', teaching_class = 'ថ្នាក់ទី១', email = 'soeurng.thary@sovannkiri.edu.kh' WHERE name ILIKE '%soeurng*thary%' OR name ILIKE '%Soeurng*Thary%';
UPDATE teachers SET position = 'គ្រូបង្រៀន', teaching_class = NULL, email = 'ken.many@sovannkiri.edu.kh' WHERE name ILIKE '%ken*many%' OR name ILIKE '%Ken*Many%';
UPDATE teachers SET position = 'គ្រូបង្រៀន / ថ្នាក់ទី៣', teaching_class = 'ថ្នាក់ទី៣', email = 'lyy.naa@sovannkiri.edu.kh' WHERE name ILIKE '%lyy*naa%' OR name ILIKE '%Lyy*Naa%';

-- Update admin emails
UPDATE teachers SET email = 'hour.soknith@sovannkiri.edu.kh' WHERE name ILIKE '%hour*soknith%' OR name ILIKE '%Hour*Soknith%';
UPDATE teachers SET email = 'mao.nath@sovannkiri.edu.kh' WHERE name ILIKE '%mao*nath%' OR name ILIKE '%Mao*Nath%';
