-- ─── Online presence on profiles ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- RLS: allow authenticated users to update their own presence
DROP POLICY IF EXISTS "update_own_presence" ON profiles;
CREATE POLICY "update_own_presence" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── direct_messages table (1-on-1 chat) ───
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  is_read boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON direct_messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_pair ON direct_messages (
  LEAST(sender_id::text, receiver_id::text),
  GREATEST(sender_id::text, receiver_id::text),
  created_at DESC
);

CREATE POLICY "read_own_direct_messages" ON direct_messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "insert_own_direct_message" ON direct_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "update_own_direct_message" ON direct_messages FOR UPDATE
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "delete_own_direct_message" ON direct_messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
