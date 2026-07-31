/*
# Create Teacher Group Chat Tables

1. New Tables
- `chat_rooms`: Stores chat rooms (only one room for the school group)
- `chat_members`: Tracks who is in each room, mute status, last read time
- `chat_messages`: Stores all messages with soft-delete, edit, pin, reply support
- `chat_attachments`: Metadata for uploaded files

2. Security (RLS)
- All tables: authenticated users only
- chat_rooms: all authenticated can read; admin/super_admin can insert/update
- chat_members: authenticated can read; users insert own; admin can update (mute)
- chat_messages: authenticated read all; users insert/update/delete own; admin can delete/pin any
- chat_attachments: authenticated can read; message owner can insert

3. Indexes
- chat_messages: room_id + created_at for message loading
- chat_members: room_id + user_id unique

4. Notes
- Uses Realtime via Supabase subscriptions
- Soft delete preserves history
- profiles.role is a text column (values: 'admin', 'super_admin', 'teacher', 'principal')
*/

-- ─── chat_rooms ───
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_chat_rooms" ON chat_rooms;
CREATE POLICY "read_chat_rooms" ON chat_rooms FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_chat_rooms_admin" ON chat_rooms;
CREATE POLICY "insert_chat_rooms_admin" ON chat_rooms FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "update_chat_rooms_admin" ON chat_rooms;
CREATE POLICY "update_chat_rooms_admin" ON chat_rooms FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ─── chat_members ───
CREATE TABLE IF NOT EXISTS chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_muted boolean DEFAULT false,
  last_read_at timestamptz,
  UNIQUE (room_id, user_id)
);

ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_chat_members" ON chat_members;
CREATE POLICY "read_chat_members" ON chat_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_chat_member" ON chat_members;
CREATE POLICY "insert_own_chat_member" ON chat_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chat_member" ON chat_members;
CREATE POLICY "update_own_chat_member" ON chat_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_chat_member_admin" ON chat_members;
CREATE POLICY "update_chat_member_admin" ON chat_members FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ─── chat_messages ───
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  image_url text,
  file_url text,
  file_name text,
  file_type text,
  reply_to_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply ON chat_messages (reply_to_id);

DROP POLICY IF EXISTS "read_chat_messages" ON chat_messages;
CREATE POLICY "read_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_chat_message" ON chat_messages;
CREATE POLICY "insert_own_chat_message" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chat_message" ON chat_messages;
CREATE POLICY "update_own_chat_message" ON chat_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat_message" ON chat_messages;
CREATE POLICY "delete_own_chat_message" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_delete_chat_message" ON chat_messages;
CREATE POLICY "admin_delete_chat_message" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "admin_update_chat_message" ON chat_messages;
CREATE POLICY "admin_update_chat_message" ON chat_messages FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ─── chat_attachments ───
CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_chat_attachments" ON chat_attachments;
CREATE POLICY "read_chat_attachments" ON chat_attachments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_chat_attachments" ON chat_attachments;
CREATE POLICY "insert_chat_attachments" ON chat_attachments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_messages m
      WHERE m.id = message_id AND m.user_id = auth.uid()
    )
  );

-- ─── Enable Realtime ───
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;

-- ─── Seed default room ───
INSERT INTO chat_rooms (id, name, description)
SELECT '00000000-0000-0000-0000-000000000001', 'SovannKiri Teacher Group', 'School-wide teacher communication group'
WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE id = '00000000-0000-0000-0000-000000000001');
