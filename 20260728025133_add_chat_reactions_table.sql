/*
# Add Chat Reactions Table

1. New Table
- `chat_reactions`: Stores emoji reactions on messages
  - id (uuid, PK)
  - message_id (uuid, FK to chat_messages, cascade delete)
  - user_id (uuid, FK to auth.users, cascade delete)
  - emoji (text, not null) — the emoji character
  - created_at (timestamptz)
  - UNIQUE (message_id, user_id, emoji) — one reaction per emoji per user

2. Security
- authenticated can read all reactions
- users insert own (user_id defaults to auth.uid())
- users delete own reactions

3. Notes
- Realtime enabled for live reaction updates
*/

CREATE TABLE IF NOT EXISTS chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_chat_reactions" ON chat_reactions;
CREATE POLICY "read_chat_reactions" ON chat_reactions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_chat_reaction" ON chat_reactions;
CREATE POLICY "insert_own_chat_reaction" ON chat_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat_reaction" ON chat_reactions;
CREATE POLICY "delete_own_chat_reaction" ON chat_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_reactions_message ON chat_reactions (message_id);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
