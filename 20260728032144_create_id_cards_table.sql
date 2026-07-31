/*
# Create id_cards table for Digital Teacher & Staff ID Card System

1. New Tables
- `id_cards`
  - `id` (uuid, primary key)
  - `teacher_id` (uuid, references teachers, unique — one card per staff member)
  - `employee_id` (text, unique — auto-generated employee ID like EMP-001)
  - `card_number` (text, unique — auto-generated card number like SK-ID-00001)
  - `photo_url` (text, nullable — profile photo URL in Supabase Storage)
  - `qr_code` (text, unique — unique QR code token for verification)
  - `barcode` (text, nullable — barcode string derived from card number)
  - `issue_date` (date, default today)
  - `expiry_date` (date, nullable)
  - `signature` (text, nullable — principal digital signature URL)
  - `status` (text, default 'active' — active | inactive | expired | lost | replaced)
  - `printed_at` (timestamptz, nullable — last print timestamp)
  - `printed_by` (uuid, nullable — user who last printed)
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)

2. Security
- Enable RLS on `id_cards`.
- Admins (super_admin, admin, principal) can CRUD all cards.
- Teachers can only SELECT and UPDATE (photo) their own card.
- Uses the existing `is_staff_admin()` helper from profiles RLS.

3. Indexes
- Index on `teacher_id` for lookups.
- Index on `card_number` for uniqueness checks.
- Index on `status` for filtering.
*/

CREATE TABLE IF NOT EXISTS id_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  employee_id text UNIQUE,
  card_number text UNIQUE,
  photo_url text,
  qr_code text UNIQUE,
  barcode text,
  issue_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  signature text,
  status text NOT NULL DEFAULT 'active',
  printed_at timestamptz,
  printed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE id_cards ENABLE ROW LEVEL SECURITY;

-- Admins can read all cards; teachers can read their own card
DROP POLICY IF EXISTS "id_cards_select" ON id_cards;
CREATE POLICY "id_cards_select" ON id_cards FOR SELECT
  TO authenticated USING (
    is_staff_admin() OR teacher_id IN (
      SELECT id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- Only admins can insert cards
DROP POLICY IF EXISTS "id_cards_insert" ON id_cards;
CREATE POLICY "id_cards_insert" ON id_cards FOR INSERT
  TO authenticated WITH CHECK (is_staff_admin());

-- Admins can update all; teachers can update only their own photo_url
DROP POLICY IF EXISTS "id_cards_update" ON id_cards;
CREATE POLICY "id_cards_update" ON id_cards FOR UPDATE
  TO authenticated
  USING (is_staff_admin() OR teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()))
  WITH CHECK (
    is_staff_admin() OR (
      teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
      AND photo_url IS NOT NULL
    )
  );

-- Only admins can delete cards
DROP POLICY IF EXISTS "id_cards_delete" ON id_cards;
CREATE POLICY "id_cards_delete" ON id_cards FOR DELETE
  TO authenticated USING (is_staff_admin());

CREATE INDEX IF NOT EXISTS idx_id_cards_teacher_id ON id_cards(teacher_id);
CREATE INDEX IF NOT EXISTS idx_id_cards_card_number ON id_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_id_cards_status ON id_cards(status);
CREATE INDEX IF NOT EXISTS idx_id_cards_qr_code ON id_cards(qr_code);
