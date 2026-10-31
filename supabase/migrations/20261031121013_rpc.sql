-- RPC pengganti endpoint Laravel. Logika security definer ada di skema private;
-- public.* hanyalah pembungkus security invoker yang dipanggil client via supabase.rpc().

-- ===== register_owner (POST /auth/register) =====
create function private.register_owner(
  p_name text, p_whatsapp text, p_nama_kost text, p_alamat text, p_kode_pos text,
  p_provinsi text, p_kota text, p_kecamatan text, p_kelurahan text, p_pilihan_pembayaran text
) returns json
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'Sesi tidak valid, silakan verifikasi OTP ulang' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'Profil pengguna tidak ditemukan' using errcode = 'P0002';
  end if;
  if v_profile.role = 'admin' then
    raise exception 'Email sudah terdaftar sebagai pemilik kost' using errcode = '23505';
  end if;
  if exists (select 1 from public.kamars where tenant_id = v_uid)
     or exists (select 1 from public.invitations where lower(email) = lower(v_profile.email) and is_used) then
    raise exception 'Email ini sudah terdaftar sebagai penyewa' using errcode = '23505';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_nama_kost), '') = '' then
    raise exception 'Nama pemilik dan nama kost wajib diisi' using errcode = '22023';
  end if;

  update public.profiles
     set role = 'admin', name = trim(p_name), phone = p_whatsapp, whatsapp = p_whatsapp, address = p_alamat
   where id = v_uid
  returning * into v_profile;

  insert into public.owner_profiles
    (user_id, nama_kost, alamat, kode_pos, provinsi, kota, kecamatan, kelurahan, pilihan_pembayaran)
  values
    (v_uid, p_nama_kost, p_alamat, p_kode_pos, p_provinsi, p_kota, p_kecamatan, p_kelurahan, p_pilihan_pembayaran);

  insert into public.kosts (user_id, nama_kost, alamat_kost, jumlah_kamar, harga)
  values (v_uid, p_nama_kost, coalesce(p_alamat, ''), 0, 0);

  return row_to_json(v_profile);
end;
$$;

-- ===== owner_rooms (GET /owner/rooms) =====
create function private.owner_rooms()
returns table (
  id bigint, kost_id bigint, nomor_kamar text, tipe_kamar text, harga_sewa int,
  status text, tenant_id uuid, tenant_name text
)
language sql stable security definer set search_path = '' as $$
  select k.id, k.kost_id, k.nomor_kamar, k.tipe_kamar, k.harga_sewa, k.status, k.tenant_id, p.name
  from public.kamars k
  join public.kosts ks on ks.id = k.kost_id
  left join public.profiles p on p.id = k.tenant_id
  where ks.user_id = (select auth.uid())
  order by k.id;
$$;

-- ===== assign_tenant (PUT /owner/rooms/{id}/assign-tenant) =====
create function private.assign_tenant(p_room_id bigint, p_tenant_id uuid) returns json
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_room public.kamars;
  v_tenant_email text;
begin
  select k.* into v_room
  from public.kamars k join public.kosts ks on ks.id = k.kost_id
  where k.id = p_room_id and ks.user_id = v_uid
  for update of k;
  if not found then
    raise exception 'Kamar tidak ditemukan' using errcode = 'P0002';
  end if;

  if p_tenant_id is not null then
    select email into v_tenant_email from public.profiles where id = p_tenant_id and role = 'tenant';
    if v_tenant_email is null or not exists (
      select 1 from public.invitations
      where owner_id = v_uid and is_used and lower(email) = lower(v_tenant_email)
    ) then
      raise exception 'Penyewa tidak ditemukan atau belum menerima undangan Anda' using errcode = 'P0002';
    end if;
  end if;

  update public.kamars
     set tenant_id = p_tenant_id,
         status = case when p_tenant_id is null then 'tersedia' else 'terisi' end
   where id = p_room_id
  returning * into v_room;

  return (
    select json_build_object(
      'id', v_room.id, 'kost_id', v_room.kost_id, 'nomor_kamar', v_room.nomor_kamar,
      'tipe_kamar', v_room.tipe_kamar, 'harga_sewa', v_room.harga_sewa, 'status', v_room.status,
      'tenant_id', v_room.tenant_id,
      'tenant_name', (select name from public.profiles where id = v_room.tenant_id)
    )
  );
end;
$$;

-- ===== tenant_my_room (GET /tenant/my-room) =====
create function private.tenant_my_room() returns json
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_result json;
begin
  if not exists (select 1 from public.profiles where id = v_uid and role = 'tenant') then
    raise exception 'Hanya penyewa yang dapat mengakses informasi kamar ini' using errcode = '42501';
  end if;

  select json_build_object(
    'kost', case when ks.id is null then null else json_build_object(
      'id', ks.id, 'nama_kost', ks.nama_kost, 'alamat_kost', ks.alamat_kost,
      'jumlah_kamar', ks.jumlah_kamar, 'harga', ks.harga) end,
    'room', json_build_object(
      'id', k.id, 'nomor_kamar', k.nomor_kamar, 'tipe_kamar', k.tipe_kamar,
      'harga_sewa', k.harga_sewa, 'status', k.status),
    'owner', case when o.id is null then null else json_build_object(
      'id', o.id, 'name', o.name, 'phone', o.phone, 'whatsapp', o.whatsapp) end
  ) into v_result
  from public.kamars k
  left join public.kosts ks on ks.id = k.kost_id
  left join public.profiles o on o.id = ks.user_id
  where k.tenant_id = v_uid
  order by k.id
  limit 1;

  return v_result;
end;
$$;

-- ===== owner_tenants (GET /owner/tenants) =====
create function private.owner_tenants()
returns table (
  id uuid, name text, email text, phone text, whatsapp text, room text, status text,
  created_at timestamptz, updated_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  with invited as (
    select distinct lower(i.email) as email
    from public.invitations i
    where i.owner_id = (select auth.uid()) and i.is_used
  ),
  rooms as (
    select k.tenant_id,
           string_agg(k.nomor_kamar, ', ' order by k.id) as room,
           bool_or(k.status = 'terisi') as active
    from public.kamars k join public.kosts ks on ks.id = k.kost_id
    where ks.user_id = (select auth.uid()) and k.tenant_id is not null
    group by k.tenant_id
  )
  select p.id, p.name, p.email, p.phone, p.whatsapp, r.room,
         case when r.tenant_id is null then 'Aktif' when r.active then 'Aktif' else 'Tidak Aktif' end,
         p.created_at, p.updated_at
  from public.profiles p
  join invited inv on inv.email = lower(p.email)
  left join rooms r on r.tenant_id = p.id
  where p.role = 'tenant'
  order by p.name;
$$;

-- ===== Hak eksekusi fungsi private =====
revoke all on function private.register_owner(text, text, text, text, text, text, text, text, text, text) from public, anon;
revoke all on function private.owner_rooms() from public, anon;
revoke all on function private.assign_tenant(bigint, uuid) from public, anon;
revoke all on function private.tenant_my_room() from public, anon;
revoke all on function private.owner_tenants() from public, anon;
grant execute on function private.register_owner(text, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function private.owner_rooms() to authenticated;
grant execute on function private.assign_tenant(bigint, uuid) to authenticated;
grant execute on function private.tenant_my_room() to authenticated;
grant execute on function private.owner_tenants() to authenticated;

-- ===== Pembungkus publik (security invoker) =====
create function public.register_owner(
  p_name text, p_whatsapp text, p_nama_kost text, p_alamat text, p_kode_pos text,
  p_provinsi text, p_kota text, p_kecamatan text, p_kelurahan text, p_pilihan_pembayaran text
) returns json
language sql security invoker set search_path = '' as $$
  select private.register_owner(p_name, p_whatsapp, p_nama_kost, p_alamat, p_kode_pos,
                                p_provinsi, p_kota, p_kecamatan, p_kelurahan, p_pilihan_pembayaran);
$$;

create function public.owner_rooms()
returns table (
  id bigint, kost_id bigint, nomor_kamar text, tipe_kamar text, harga_sewa int,
  status text, tenant_id uuid, tenant_name text
)
language sql stable security invoker set search_path = '' as $$
  select * from private.owner_rooms();
$$;

create function public.assign_tenant(p_room_id bigint, p_tenant_id uuid) returns json
language sql security invoker set search_path = '' as $$
  select private.assign_tenant(p_room_id, p_tenant_id);
$$;

create function public.tenant_my_room() returns json
language sql stable security invoker set search_path = '' as $$
  select private.tenant_my_room();
$$;

create function public.owner_tenants()
returns table (
  id uuid, name text, email text, phone text, whatsapp text, room text, status text,
  created_at timestamptz, updated_at timestamptz
)
language sql stable security invoker set search_path = '' as $$
  select * from private.owner_tenants();
$$;

revoke all on function public.register_owner(text, text, text, text, text, text, text, text, text, text) from public, anon;
revoke all on function public.owner_rooms() from public, anon;
revoke all on function public.assign_tenant(bigint, uuid) from public, anon;
revoke all on function public.tenant_my_room() from public, anon;
revoke all on function public.owner_tenants() from public, anon;
grant execute on function public.register_owner(text, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.owner_rooms() to authenticated;
grant execute on function public.assign_tenant(bigint, uuid) to authenticated;
grant execute on function public.tenant_my_room() to authenticated;
grant execute on function public.owner_tenants() to authenticated;
