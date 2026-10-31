-- tenant_my_room: sertakan fasilitas dari tipe kamar pemilik (untuk kartu "Informasi Kost Saya")
create or replace function private.tenant_my_room() returns json
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
      'harga_sewa', k.harga_sewa, 'status', k.status,
      'facilities', (select rt.facilities from public.room_types rt
                     where rt.user_id = ks.user_id and rt.name = k.tipe_kamar
                     order by rt.id limit 1)),
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
