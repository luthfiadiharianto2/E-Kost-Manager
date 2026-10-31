-- Uji RLS dengan meniru JWT pengguna berbeda (jalankan di SQL editor sebagai postgres).
-- Hasil yang diharapkan ada di kolom komentar; "LOLOS (BUG)" berarti kebocoran.
create temp table if not exists _rls_result(test text, result text);
truncate _rls_result;
grant all on _rls_result to authenticated, anon;
do $$
declare t1 uuid; o uuid; n int;
begin
  select id into t1 from auth.users where email='penyewa1.demo@ekost.test';
  select id into o from auth.users where email='pemilik.demo@ekost.test';

  -- sebagai penyewa1 (harap: 1 kamar, 1 profil, 0 owner_rooms, 0 undangan, ubah role ditolak)
  perform set_config('request.jwt.claims', json_build_object('sub', t1, 'role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.kamars; insert into _rls_result values ('penyewa1: kamars terlihat', n::text);
  select count(*) into n from public.profiles; insert into _rls_result values ('penyewa1: profiles terlihat', n::text);
  select count(*) into n from public.owner_rooms(); insert into _rls_result values ('penyewa1: owner_rooms()', n::text);
  select count(*) into n from public.invitations; insert into _rls_result values ('penyewa1: invitations', n::text);
  select count(*) into n from public.kosts; insert into _rls_result values ('penyewa1: kosts terlihat', n::text);
  begin update public.profiles set role='admin' where id=t1; insert into _rls_result values ('penyewa1: ubah role','LOLOS (BUG)');
  exception when others then insert into _rls_result values ('penyewa1: ubah role','ditolak: '||sqlerrm); end;
  begin update public.kamars set status='tersedia'; get diagnostics n = row_count; insert into _rls_result values ('penyewa1: update kamars (baris)', n::text);
  exception when others then insert into _rls_result values ('penyewa1: update kamars','ditolak: '||sqlerrm); end;
  insert into _rls_result values ('penyewa1: tenant_my_room nomor', (public.tenant_my_room()->'room'->>'nomor_kamar'));
  reset role;

  -- sebagai pemilik (harap: semua kamarnya, penyewanya, set tenant_id langsung ditolak)
  perform set_config('request.jwt.claims', json_build_object('sub', o, 'role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.owner_rooms(); insert into _rls_result values ('pemilik: owner_rooms()', n::text);
  select count(*) into n from public.owner_tenants(); insert into _rls_result values ('pemilik: owner_tenants()', n::text);
  begin update public.kamars set tenant_id = o where nomor_kamar='101'; insert into _rls_result values ('pemilik: set tenant_id langsung','LOLOS (BUG)');
  exception when others then insert into _rls_result values ('pemilik: set tenant_id langsung','ditolak: '||sqlerrm); end;
  reset role;

  -- anon (harap: semua ditolak)
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  begin select count(*) into n from public.kamars; insert into _rls_result values ('anon: kamars', n::text);
  exception when others then insert into _rls_result values ('anon: kamars','ditolak: '||sqlerrm); end;
  begin perform email from public.testimonis limit 1; insert into _rls_result values ('anon: baca email testimoni','LOLOS (BUG)');
  exception when others then insert into _rls_result values ('anon: baca email testimoni','ditolak: '||sqlerrm); end;
  begin perform public.owner_rooms(); insert into _rls_result values ('anon: owner_rooms','LOLOS (BUG)');
  exception when others then insert into _rls_result values ('anon: owner_rooms','ditolak: '||sqlerrm); end;
  reset role;
end $$;
select * from _rls_result;
