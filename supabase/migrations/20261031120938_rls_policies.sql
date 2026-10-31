-- RLS: pemilik hanya data miliknya; penyewa hanya kamarnya sendiri.

-- ===== Helper (security definer, di skema private agar tidak bisa dipanggil via REST) =====
create function private.is_kost_owner(p_kost_id bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.kosts k
    where k.id = p_kost_id and k.user_id = (select auth.uid())
  );
$$;

create function private.my_tenant_kost_ids() returns setof bigint
language sql stable security definer set search_path = '' as $$
  select kost_id from public.kamars where tenant_id = (select auth.uid());
$$;

revoke all on function private.is_kost_owner(bigint) from public, anon;
revoke all on function private.my_tenant_kost_ids() from public, anon;
grant execute on function private.is_kost_owner(bigint) to authenticated;
grant execute on function private.my_tenant_kost_ids() to authenticated;

-- ===== Hak akses tabel (eksplisit, jangan andalkan default grant) =====
revoke all on public.profiles, public.owner_profiles, public.kosts, public.room_types,
  public.kamars, public.invitations, public.testimonis from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.owner_profiles to authenticated;
grant select, insert, update, delete on public.kosts to authenticated;
grant select, insert, update, delete on public.room_types to authenticated;
grant select, insert, update, delete on public.kamars to authenticated;
grant select, insert, delete on public.invitations to authenticated;
-- testimoni: email pengirim tidak ikut terbaca publik
grant select (id, nama, pesan, created_at) on public.testimonis to anon, authenticated;
grant insert (nama, email, pesan) on public.testimonis to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.owner_profiles enable row level security;
alter table public.kosts enable row level security;
alter table public.room_types enable row level security;
alter table public.kamars enable row level security;
alter table public.invitations enable row level security;
alter table public.testimonis enable row level security;

-- ===== profiles =====
create policy "profiles: baca milik sendiri" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: ubah milik sendiri" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ===== owner_profiles =====
create policy "owner_profiles: pemilik" on public.owner_profiles
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ===== room_types =====
create policy "room_types: pemilik" on public.room_types
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ===== kosts =====
create policy "kosts: pemilik kelola" on public.kosts
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "kosts: penyewa baca kost tempat tinggalnya" on public.kosts
  for select to authenticated
  using (id in (select private.my_tenant_kost_ids()));

-- ===== kamars =====
create policy "kamars: pemilik kelola" on public.kamars
  for all to authenticated
  using ((select private.is_kost_owner(kost_id)))
  with check ((select private.is_kost_owner(kost_id)));
create policy "kamars: penyewa baca kamarnya" on public.kamars
  for select to authenticated
  using (tenant_id = (select auth.uid()));

-- ===== invitations (validasi & penerimaan lewat Edge Function, bukan client) =====
create policy "invitations: pemilik baca" on public.invitations
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "invitations: pemilik buat" on public.invitations
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "invitations: pemilik hapus" on public.invitations
  for delete to authenticated using (owner_id = (select auth.uid()));

-- ===== testimonis =====
create policy "testimonis: publik baca" on public.testimonis
  for select to anon, authenticated using (true);
create policy "testimonis: publik kirim" on public.testimonis
  for insert to anon, authenticated
  with check (
    char_length(trim(nama)) between 1 and 100
    and char_length(trim(pesan)) between 1 and 1000
    and email like '%_@_%'
  );
