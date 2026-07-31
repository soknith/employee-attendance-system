/*
# Create id-card-photos storage bucket policies

1. Storage
- Create a public bucket `id-card-photos` for storing teacher ID card profile photos.
- Allow authenticated users to upload to their own folder.
- Allow public read for photos (they appear on printed cards).
- Allow admins to upload/manage all photos.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('id-card-photos', 'id-card-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "id_card_photos_read" ON storage.objects;
CREATE POLICY "id_card_photos_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'id-card-photos');

DROP POLICY IF EXISTS "id_card_photos_insert" ON storage.objects;
CREATE POLICY "id_card_photos_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'id-card-photos'
    AND (
      is_staff_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "id_card_photos_update" ON storage.objects;
CREATE POLICY "id_card_photos_update" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'id-card-photos'
    AND (
      is_staff_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "id_card_photos_delete" ON storage.objects;
CREATE POLICY "id_card_photos_delete" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'id-card-photos'
    AND (
      is_staff_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
