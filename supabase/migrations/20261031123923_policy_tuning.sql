-- Perbaikan advisor: satu policy SELECT per tabel (bukan dua policy permissive),
-- dan policy eksplisit untuk tabel rate limit (hanya service_role).

-- ===== kosts =====
drop policy "kosts: pemilik kelola" on public.kosts;
drop policy "kosts: penyewa baca kost tempat tinggalnya" on public.kosts;

create policy "kosts: baca (pemilik atau penyewa)" on public.kosts
  for select to authenticated
  using (user_id = (select auth.uid()) or id in (select private.my_tenant_kost_ids()));
create policy "kosts: pemilik tambah" on public.kosts
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "kosts: pemilik ubah" on public.kosts
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "kosts: pemilik hapus" on public.kosts
  for delete to authenticated using (user_id = (select auth.uid()));

-- ===== kamars =====
drop policy "kamars: pemilik kelola" on public.kamars;
drop policy "kamars: penyewa baca kamarnya" on public.kamars;

create policy "kamars: baca (pemilik atau penghuni)" on public.kamars
  for select to authenticated
  using (tenant_id = (select auth.uid()) or (select private.is_kost_owner(kost_id)));
create policy "kamars: pemilik tambah" on public.kamars
  for insert to authenticated with check ((select private.is_kost_owner(kost_id)));
create policy "kamars: pemilik ubah" on public.kamars
  for update to authenticated
  using ((select private.is_kost_owner(kost_id))) with check ((select private.is_kost_owner(kost_id)));
create policy "kamars: pemilik hapus" on public.kamars
  for delete to authenticated using ((select private.is_kost_owner(kost_id)));

-- ===== private.rate_limits =====
create policy "rate_limits: service role" on private.rate_limits
  for all to service_role using (true) with check (true);
