
CREATE POLICY "Pet photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Users upload own pet photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own pet photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own pet photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
