/*
# Create id_card_print_history table

1. New Tables
- `id_card_print_history`
  - `id` (uuid, primary key)
  - `card_id` (uuid, references id_cards)
  - `printed_by` (uuid, references auth.users)
  - `print_type` (text — front, back, both, pdf, png)
  - `copies` (int, default 1)
  - `layout` (text — a4, pvc)
  - `printed_at` (timestamptz, default now)

2. Security
- Admins can read all print history; teachers can read their own card's history.
- Only admins can insert print history records.
*/

CREATE TABLE IF NOT EXISTS id_card_print_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES id_cards(id) ON DELETE CASCADE,
  printed_by uuid,
  print_type text NOT NULL DEFAULT 'both',
  copies int NOT NULL DEFAULT 1,
  layout text NOT NULL DEFAULT 'pvc',
  printed_at timestamptz DEFAULT now()
);

ALTER TABLE id_card_print_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "print_history_select" ON id_card_print_history;
CREATE POLICY "print_history_select" ON id_card_print_history FOR SELECT
  TO authenticated USING (
    is_staff_admin() OR card_id IN (
      SELECT id FROM id_cards WHERE teacher_id IN (
        SELECT id FROM teachers WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "print_history_insert" ON id_card_print_history;
CREATE POLICY "print_history_insert" ON id_card_print_history FOR INSERT
  TO authenticated WITH CHECK (is_staff_admin());

CREATE INDEX IF NOT EXISTS idx_print_history_card_id ON id_card_print_history(card_id);
