-- Storage avatar + Realtime kamar

-- Bucket publik baca (URL publik untuk <img>), maks 2 MB, hanya jpeg/png/jpg/gif
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/jpg', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Tulis/hapus hanya di folder milik sendiri: avatars/{auth.uid()}/...
-- (SELECT dibatasi ke folder sendiri agar bucket tidak bisa di-list publik)
create policy "avatars: baca folder sendiri" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: unggah ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: ubah di folder sendiri" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: hapus di folder sendiri" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Realtime: perubahan kamars (RLS tetap berlaku, penyewa hanya menerima baris kamarnya).
-- testimonis sengaja TIDAK dimasukkan: payload realtime memuat kolom email pengirim.
alter publication supabase_realtime add table public.kamars;
