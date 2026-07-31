-- Update existing user's password (hour.soknith already exists)
UPDATE auth.users
SET encrypted_password = '$2b$10$7XOQd7mUxa/JRP1UmNqS1.VUMT0/0APuQl0g87tZGGV1flWjwvfiG',
    email_confirmed_at = now(),
    role = 'authenticated'
WHERE email = 'hour.soknith@sovannkiri.edu.kh';

-- Insert remaining 11 new users into auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
SELECT
  u.id, u.email, u.hash, now(), 'authenticated', 'authenticated', now(), now(), '{}'::jsonb, '{}'::jsonb
FROM (VALUES
  ('a1000001-0000-0000-0000-000000000001'::uuid, 'mao.nath@sovannkiri.edu.kh', '$2b$10$b90ezz.to4FsqcxNxGh.du21UKESmlYYQTDSyF6HxnXoq4dtfv6FS'),
  ('a1000002-0000-0000-0000-000000000002'::uuid, 'hol.kimhien@sovannkiri.edu.kh', '$2b$10$XV9NquGYwiNf79VVfeV7y.2LEifi4x35cDQwP6c7nKecRyvfbpdDe'),
  ('a1000003-0000-0000-0000-000000000003'::uuid, 'oeung.rum@sovannkiri.edu.kh', '$2b$10$aMa/vsRcJs8ttdujfCceUe11E2G7yQRXPwFjQ4MqNmcjq6HmoCBFi'),
  ('a1000004-0000-0000-0000-000000000004'::uuid, 'y.saman@sovannkiri.edu.kh', '$2b$10$3zda8UVrgt0aQYj54SgC7udlQalOn.MueleP2zgc5nxg7DNxUsoIq'),
  ('a1000005-0000-0000-0000-000000000005'::uuid, 'hang.sinuon@sovannkiri.edu.kh', '$2b$10$D6WbV3zv4RXxYaBTY9mTmOIyqai0o4rPUvNmJJSElnaiLdh1.17Ey'),
  ('a1000006-0000-0000-0000-000000000006'::uuid, 'try.chanther@sovannkiri.edu.kh', '$2b$10$gnmeAmrmOILR42VXT7y0Ce8x86DZVtxK207uCGkWg1jeWjPWEVi7.'),
  ('a1000007-0000-0000-0000-000000000007'::uuid, 'khvea.vanra@sovannkiri.edu.kh', '$2b$10$ntu4G66gPaGmTdXbqZ0JHuIlv3jqSzZqiMaTZmrD.WRmEpPW4OAIK'),
  ('a1000008-0000-0000-0000-000000000008'::uuid, 'ek.pisey@sovannkiri.edu.kh', '$2b$10$G0Han3ugaTkaB7KMtDnVAe6RF9Nu4Rg8dMPCzl38p60aAmaB6Uy6m'),
  ('a1000009-0000-0000-0000-000000000009'::uuid, 'soeurng.thary@sovannkiri.edu.kh', '$2b$10$GAi2mzLd8qnYHguT72JCYeXzz3NXFe9.pz3NW3Ol.FInlwsyWK/Me'),
  ('a1000010-0000-0000-0000-000000000010'::uuid, 'ken.many@sovannkiri.edu.kh', '$2b$10$KVp.glkjMby6ppkpu9ufAOKNMNe6Js2NjSlMyCfH75onIYpDJr2hG'),
  ('a1000011-0000-0000-0000-000000000011'::uuid, 'lyy.naa@sovannkiri.edu.kh', '$2b$10$O44qvSnFHSnRvHKxeivx6OAQmxKAcis5UcuwbOKDiXLsZMtu8GvIq')
) AS u(id, email, hash)
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = u.email);

-- Insert identities for the new users (email column is generated, don't insert it)
INSERT INTO auth.identities (id, provider_id, user_id, provider, identity_data, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id::text,
  u.id,
  'email',
  jsonb_build_object('email', u.email, 'sub', u.id::text),
  now(),
  now()
FROM auth.users u
WHERE u.email IN (
  'mao.nath@sovannkiri.edu.kh',
  'hol.kimhien@sovannkiri.edu.kh',
  'oeung.rum@sovannkiri.edu.kh',
  'y.saman@sovannkiri.edu.kh',
  'hang.sinuon@sovannkiri.edu.kh',
  'try.chanther@sovannkiri.edu.kh',
  'khvea.vanra@sovannkiri.edu.kh',
  'ek.pisey@sovannkiri.edu.kh',
  'soeurng.thary@sovannkiri.edu.kh',
  'ken.many@sovannkiri.edu.kh',
  'lyy.naa@sovannkiri.edu.kh'
)
AND NOT EXISTS (SELECT 1 FROM auth.identities ai WHERE ai.user_id = u.id);

-- Update existing profile for hour.soknith
UPDATE profiles SET role = 'admin', full_name = 'Hour Soknith' WHERE user_id = '39e1bfac-6460-419d-a1af-f24aaac348ea';

-- Insert profiles for all new users
INSERT INTO profiles (user_id, role, full_name)
SELECT u.id, u.role, u.name
FROM (VALUES
  ('a1000001-0000-0000-0000-000000000001'::uuid, 'admin', 'Mao Nath'),
  ('a1000002-0000-0000-0000-000000000002'::uuid, 'teacher', 'Hol Kimhien'),
  ('a1000003-0000-0000-0000-000000000003'::uuid, 'teacher', 'Oeung Rum'),
  ('a1000004-0000-0000-0000-000000000004'::uuid, 'teacher', 'Y Saman'),
  ('a1000005-0000-0000-0000-000000000005'::uuid, 'teacher', 'Hang Sinuon'),
  ('a1000006-0000-0000-0000-000000000006'::uuid, 'teacher', 'Try Chanther'),
  ('a1000007-0000-0000-0000-000000000007'::uuid, 'teacher', 'Khvea Vanra'),
  ('a1000008-0000-0000-0000-000000000008'::uuid, 'teacher', 'Ek Pisey'),
  ('a1000009-0000-0000-0000-000000000009'::uuid, 'teacher', 'Soeurng Thary'),
  ('a1000010-0000-0000-0000-000000000010'::uuid, 'teacher', 'Ken Many'),
  ('a1000011-0000-0000-0000-000000000011'::uuid, 'teacher', 'Lyy Naa')
) AS u(id, role, name)
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);

-- Insert teacher records for all users
INSERT INTO teachers (user_id, name, department, email, gender, status)
SELECT u.id, u.name, u.dept, u.email, u.gender, 'active'
FROM (VALUES
  ('39e1bfac-6460-419d-a1af-f24aaac348ea'::uuid, 'Hour Soknith', 'Administration', 'hour.soknith@sovannkiri.edu.kh', 'male'),
  ('a1000001-0000-0000-0000-000000000001'::uuid, 'Mao Nath', 'Administration', 'mao.nath@sovannkiri.edu.kh', 'male'),
  ('a1000002-0000-0000-0000-000000000002'::uuid, 'Hol Kimhien', 'Khmer Literature', 'hol.kimhien@sovannkiri.edu.kh', 'male'),
  ('a1000003-0000-0000-0000-000000000003'::uuid, 'Oeung Rum', 'Mathematics', 'oeung.rum@sovannkiri.edu.kh', 'male'),
  ('a1000004-0000-0000-0000-000000000004'::uuid, 'Y Saman', 'Science', 'y.saman@sovannkiri.edu.kh', 'male'),
  ('a1000005-0000-0000-0000-000000000005'::uuid, 'Hang Sinuon', 'Social Studies', 'hang.sinuon@sovannkiri.edu.kh', 'male'),
  ('a1000006-0000-0000-0000-000000000006'::uuid, 'Try Chanther', 'Khmer Literature', 'try.chanther@sovannkiri.edu.kh', 'male'),
  ('a1000007-0000-0000-0000-000000000007'::uuid, 'Khvea Vanra', 'Mathematics', 'khvea.vanra@sovannkiri.edu.kh', 'male'),
  ('a1000008-0000-0000-0000-000000000008'::uuid, 'Ek Pisey', 'Science', 'ek.pisey@sovannkiri.edu.kh', 'female'),
  ('a1000009-0000-0000-0000-000000000009'::uuid, 'Soeurng Thary', 'English', 'soeurng.thary@sovannkiri.edu.kh', 'female'),
  ('a1000010-0000-0000-0000-000000000010'::uuid, 'Ken Many', 'Social Studies', 'ken.many@sovannkiri.edu.kh', 'male'),
  ('a1000011-0000-0000-0000-000000000011'::uuid, 'Lyy Naa', 'English', 'lyy.naa@sovannkiri.edu.kh', 'female')
) AS u(id, name, dept, email, gender)
WHERE NOT EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = u.id);
