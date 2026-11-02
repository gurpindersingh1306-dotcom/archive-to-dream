
create policy "Photos readable for signed links" on storage.objects for select to anon, authenticated
  using (bucket_id in ('avatars', 'listing-photos'));
create policy "Users upload into own folder" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'listing-photos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update own files" on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'listing-photos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own files" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'listing-photos') and (storage.foldername(name))[1] = auth.uid()::text);
