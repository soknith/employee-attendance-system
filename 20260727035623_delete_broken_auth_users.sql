/*
# Delete broken manually-inserted auth users

1. What this does
   - Deletes 11 user accounts from auth.users that were manually inserted with INSERT INTO auth.users
   - These accounts are NOT recognized by GoTrue (the admin API only sees 1 of 12 users)
   - They will be recreated properly through the Supabase Admin API via an edge function
2. Also deletes corresponding profiles (will be recreated)
3. The one valid user (hour.soknith) is NOT deleted - it was created properly
*/

-- Delete profiles for broken users first (to avoid FK issues if any)
DELETE FROM public.profiles
WHERE user_id IN (
  'a1000001-0000-0000-0000-000000000001',
  'a1000002-0000-0000-0000-000000000002',
  'a1000003-0000-0000-0000-000000000003',
  'a1000004-0000-0000-0000-000000000004',
  'a1000005-0000-0000-0000-000000000005',
  'a1000006-0000-0000-0000-000000000006',
  'a1000007-0000-0000-0000-000000000007',
  'a1000008-0000-0000-0000-000000000008',
  'a1000009-0000-0000-0000-000000000009',
  'a1000010-0000-0000-0000-000000000010',
  'a1000011-0000-0000-0000-000000000011'
);

-- Delete the broken auth users
DELETE FROM auth.users
WHERE id IN (
  'a1000001-0000-0000-0000-000000000001',
  'a1000002-0000-0000-0000-000000000002',
  'a1000003-0000-0000-0000-000000000003',
  'a1000004-0000-0000-0000-000000000004',
  'a1000005-0000-0000-0000-000000000005',
  'a1000006-0000-0000-0000-000000000006',
  'a1000007-0000-0000-0000-000000000007',
  'a1000008-0000-0000-0000-000000000008',
  'a1000009-0000-0000-0000-000000000009',
  'a1000010-0000-0000-0000-000000000010',
  'a1000011-0000-0000-0000-000000000011'
);
