-- Seed data demo E-Kost Manager.
-- Prasyarat: akun Auth demo sudah dibuat lewat `node supabase/scripts/create-demo-users.mjs`
-- (password diambil dari env DEMO_PASSWORD, tidak pernah disimpan di repo).
--   pemilik.demo@ekost.test               -> pemilik (admin)
--   penyewa1..5.demo@ekost.test           -> penyewa yang sudah menerima undangan
-- Aman dijalankan berulang (idempotent).

do $$
declare
  v_owner uuid;
  v_kost bigint;
  v_tenant uuid;
  r record;
begin
  select id into v_owner from auth.users where email = 'pemilik.demo@ekost.test';
  if v_owner is null then
    raise notice 'Akun pemilik.demo@ekost.test belum ada. Jalankan supabase/scripts/create-demo-users.mjs dulu.';
    return;
  end if;

  update public.profiles
     set role = 'admin', name = 'Pemilik Demo', phone = '081200000001', whatsapp = '081200000001',
         address = 'Jl. Kampus No. 10, Purwokerto'
   where id = v_owner;

  insert into public.owner_profiles (user_id, nama_kost, alamat, kode_pos, provinsi, kota, kecamatan, kelurahan, pilihan_pembayaran)
  values (v_owner, 'Kost Mawar Demo', 'Jl. Kampus No. 10', '53147', 'JAWA TENGAH', 'KABUPATEN BANYUMAS',
          'PURWOKERTO SELATAN', 'KARANGPUCUNG', 'transfer')
  on conflict (user_id) do nothing;

  select id into v_kost from public.kosts where user_id = v_owner order by id limit 1;
  if v_kost is null then
    insert into public.kosts (user_id, nama_kost, alamat_kost, jumlah_kamar, harga)
    values (v_owner, 'Kost Mawar Demo', 'Jl. Kampus No. 10, Purwokerto', 12, 800000)
    returning id into v_kost;
  end if;

  insert into public.room_types (user_id, name, price, facilities, description)
  select v_owner, t.name, t.price, t.facilities, t.description
  from (values
    ('Standar', 800000,  'Kasur, Lemari, Meja, Kipas', 'Kamar mandi luar'),
    ('Deluxe',  1100000, 'Kasur, Lemari, Meja, AC',    'Kamar mandi dalam'),
    ('VIP',     1500000, 'Kasur Queen, Lemari, Meja, AC, Water Heater', 'Kamar mandi dalam, balkon')
  ) as t(name, price, facilities, description)
  where not exists (select 1 from public.room_types rt where rt.user_id = v_owner and rt.name = t.name);

  -- 3 lantai x 4 kamar
  insert into public.kamars (kost_id, nomor_kamar, tipe_kamar, harga_sewa, status)
  select v_kost, k.nomor, k.tipe, k.harga, 'tersedia'
  from (values
    ('101','Standar',800000), ('102','Standar',800000), ('103','Standar',800000), ('104','Deluxe',1100000),
    ('201','Deluxe',1100000), ('202','Deluxe',1100000), ('203','Standar',800000), ('204','VIP',1500000),
    ('301','VIP',1500000),    ('302','Deluxe',1100000), ('303','Standar',800000), ('304','VIP',1500000)
  ) as k(nomor, tipe, harga)
  on conflict (kost_id, nomor_kamar) do nothing;

  -- Penyewa demo: undangan sudah diterima + ditempatkan di kamar
  for r in
    select * from (values
      ('penyewa1.demo@ekost.test', 'Sari Penyewa',  '102'),
      ('penyewa2.demo@ekost.test', 'Andi Penyewa',  '104'),
      ('penyewa3.demo@ekost.test', 'Rina Penyewa',  '201'),
      ('penyewa4.demo@ekost.test', 'Dodi Penyewa',  '204'),
      ('penyewa5.demo@ekost.test', 'Maya Penyewa',  '302')
    ) as t(email, name, room)
  loop
    select id into v_tenant from auth.users where email = r.email;
    continue when v_tenant is null;

    update public.profiles set name = r.name, role = 'tenant' where id = v_tenant;

    insert into public.invitations (owner_id, email, name, token, expires_at, is_used, accepted_at)
    select v_owner, r.email, r.name, encode(extensions.gen_random_bytes(32), 'hex'), now() + interval '7 days', true, now()
    where not exists (select 1 from public.invitations i where i.owner_id = v_owner and i.email = r.email);

    update public.kamars set tenant_id = v_tenant, status = 'terisi'
     where kost_id = v_kost and nomor_kamar = r.room and tenant_id is null;
  end loop;

  update public.kosts set jumlah_kamar = (select count(*) from public.kamars where kost_id = v_kost)
   where id = v_kost;
end $$;
