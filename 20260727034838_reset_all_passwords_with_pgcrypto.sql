-- Reset all 12 user passwords using pgcrypto's crypt() function
-- This ensures the hash format matches what Supabase Auth expects

UPDATE auth.users SET encrypted_password = crypt('Soknith27', gen_salt('bf')) WHERE email = 'hour.soknith@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('NATH@@sovann', gen_salt('bf')) WHERE email = 'mao.nath@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('KIMhien@@Sovan', gen_salt('bf')) WHERE email = 'hol.kimhien@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('RUM@@Kiry', gen_salt('bf')) WHERE email = 'oeung.rum@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('SAMan@@Kiry', gen_salt('bf')) WHERE email = 'y.saman@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('SINuon@@sovann', gen_salt('bf')) WHERE email = 'hang.sinuon@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('CHANther@@sova', gen_salt('bf')) WHERE email = 'try.chanther@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('VANra@@kiry', gen_salt('bf')) WHERE email = 'khvea.vanra@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('PIsey@@kiry', gen_salt('bf')) WHERE email = 'ek.pisey@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('THAry@@sovann', gen_salt('bf')) WHERE email = 'soeurng.thary@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('MANY@@sovann', gen_salt('bf')) WHERE email = 'ken.many@sovannkiri.edu.kh';
UPDATE auth.users SET encrypted_password = crypt('LYna@@Kiry', gen_salt('bf')) WHERE email = 'lyy.naa@sovannkiri.edu.kh';
