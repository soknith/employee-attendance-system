/*
# Fix Chat RLS Policies to Use profiles.user_id

The profiles table has `id` (its own UUID) and `user_id` (references auth.users.id).
Previous policies incorrectly checked `p.id = auth.uid()` — must be `p.user_id = auth.uid()`.

1. Changes
- Drop and recreate admin-check policies on chat_rooms, chat_members, chat_messages
- All admin role checks now use `p.user_id = auth.uid()` instead of `p.id = auth.uid()`
*/

-- ─── chat_rooms: fix admin insert/update policies ───
DROP POLICY IF EXISTS "insert_chat_rooms_admin" ON chat_rooms;
CREATE POLICY "insert_chat_rooms_admin" ON chat_rooms FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "update_chat_rooms_admin" ON chat_rooms;
CREATE POLICY "update_chat_rooms_admin" ON chat_rooms FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ─── chat_members: fix admin update policy ───
DROP POLICY IF EXISTS "update_chat_member_admin" ON chat_members;
CREATE POLICY "update_chat_member_admin" ON chat_members FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ─── chat_messages: fix admin delete/update policies ───
DROP POLICY IF EXISTS "admin_delete_chat_message" ON chat_messages;
CREATE POLICY "admin_delete_chat_message" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "admin_update_chat_message" ON chat_messages;
CREATE POLICY "admin_update_chat_message" ON chat_messages FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );
