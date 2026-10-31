-- Fitur "Denah Kost" 2.5D/3D: bentuk bangunan + posisi kamar per lantai.

create table public.kost_layouts (
  id bigint generated always as identity primary key,
  kost_id bigint not null unique references public.kosts(id) on delete cascade,
  building_type text not null default 'memanjang'
    check (building_type in ('memanjang','lorong_tengah','l','u','halaman_tengah','kustom')),
  floors int not null default 1 check (floors between 1 and 10),
  grid_cols int not null default 8 check (grid_cols between 2 and 40),
  grid_rows int not null default 4 check (grid_rows between 1 and 40),
  -- jenis sel per lantai: {"1":[{"x":0,"y":0,"t":"room|corridor|void|stairs|bath"}], "2":[...]}
  footprint jsonb not null default '{}'::jsonb check (jsonb_typeof(footprint) = 'object'),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.kost_layouts
  for each row execute function private.set_updated_at();

alter table public.kamars
  add column floor int not null default 1 check (floor >= 1),
  add column grid_x int check (grid_x >= 0),
  add column grid_y int check (grid_y >= 0),
  add column span_x int not null default 1 check (span_x between 1 and 6),
  add column span_y int not null default 1 check (span_y between 1 and 6),
  add column door_side text check (door_side in ('n','e','s','w')),
  add constraint kamars_grid_pair check ((grid_x is null) = (grid_y is null));
create unique index kamars_cell_unique on public.kamars (kost_id, floor, grid_x, grid_y) where grid_x is not null;

-- ===== Hak akses & RLS =====
revoke all on public.kost_layouts from anon, authenticated;
grant select, insert, update, delete on public.kost_layouts to authenticated;
alter table public.kost_layouts enable row level security;

create policy "kost_layouts: baca (pemilik atau penyewa)" on public.kost_layouts
  for select to authenticated
  using ((select private.is_kost_owner(kost_id)) or kost_id in (select private.my_tenant_kost_ids()));
create policy "kost_layouts: pemilik tambah" on public.kost_layouts
  for insert to authenticated with check ((select private.is_kost_owner(kost_id)));
create policy "kost_layouts: pemilik ubah" on public.kost_layouts
  for update to authenticated
  using ((select private.is_kost_owner(kost_id))) with check ((select private.is_kost_owner(kost_id)));
create policy "kost_layouts: pemilik hapus" on public.kost_layouts
  for delete to authenticated using ((select private.is_kost_owner(kost_id)));

-- ===== get_kost_layout: layout + kamar; nama penghuni hanya untuk pemilik =====
create function private.get_kost_layout(p_kost_id bigint) returns json
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_is_owner boolean;
  v_is_tenant boolean;
begin
  v_is_owner := exists (select 1 from public.kosts where id = p_kost_id and user_id = v_uid);
  v_is_tenant := exists (select 1 from public.kamars where kost_id = p_kost_id and tenant_id = v_uid);
  if not v_is_owner and not v_is_tenant then
    raise exception 'Kost tidak ditemukan' using errcode = 'P0002';
  end if;

  return json_build_object(
    'kost', (select json_build_object('id', k.id, 'nama_kost', k.nama_kost) from public.kosts k where k.id = p_kost_id),
    'is_owner', v_is_owner,
    'layout', (
      select json_build_object(
        'id', l.id, 'kost_id', l.kost_id, 'building_type', l.building_type, 'floors', l.floors,
        'grid_cols', l.grid_cols, 'grid_rows', l.grid_rows, 'footprint', l.footprint, 'updated_at', l.updated_at)
      from public.kost_layouts l where l.kost_id = p_kost_id
    ),
    'rooms', coalesce((
      select json_agg(json_build_object(
        'id', r.id, 'nomor_kamar', r.nomor_kamar, 'tipe_kamar', r.tipe_kamar, 'harga_sewa', r.harga_sewa,
        'status', r.status, 'floor', r.floor, 'grid_x', r.grid_x, 'grid_y', r.grid_y,
        'span_x', r.span_x, 'span_y', r.span_y, 'door_side', r.door_side,
        'tenant_name', case when v_is_owner then p.name else null end,
        'tenant_id', case when v_is_owner then r.tenant_id else null end,
        'is_mine', r.tenant_id is not null and r.tenant_id = v_uid
      ) order by r.floor, r.nomor_kamar)
      from public.kamars r
      left join public.profiles p on p.id = r.tenant_id
      where r.kost_id = p_kost_id
    ), '[]'::json)
  );
end;
$$;

-- ===== save_kost_layout: simpan bentuk bangunan + posisi kamar dalam satu transaksi =====
-- p_rooms: [{"id":1,"floor":1,"grid_x":0,"grid_y":0,"span_x":1,"span_y":1,"door_side":"s"}, ...]
-- kamar yang tidak ada di p_rooms dianggap "belum ditempatkan" (grid_x/grid_y = null).
create function private.save_kost_layout(p_kost_id bigint, p_layout jsonb, p_rooms jsonb) returns json
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_floors int := coalesce((p_layout->>'floors')::int, 1);
  v_cols int := coalesce((p_layout->>'grid_cols')::int, 8);
  v_rows int := coalesce((p_layout->>'grid_rows')::int, 4);
  v_bad text;
begin
  if not exists (select 1 from public.kosts where id = p_kost_id and user_id = v_uid) then
    raise exception 'Kost tidak ditemukan' using errcode = 'P0002';
  end if;
  if jsonb_typeof(coalesce(p_rooms, '[]'::jsonb)) <> 'array' then
    raise exception 'Format data kamar tidak valid' using errcode = '22023';
  end if;

  -- kamar harus milik kost ini
  select r->>'id' into v_bad
  from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb)) r
  where not exists (select 1 from public.kamars k where k.id = (r->>'id')::bigint and k.kost_id = p_kost_id)
  limit 1;
  if v_bad is not null then
    raise exception 'Kamar % bukan milik kost ini', v_bad using errcode = '22023';
  end if;

  -- di dalam grid & jumlah lantai
  select k.nomor_kamar into v_bad
  from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb)) r
  join public.kamars k on k.id = (r->>'id')::bigint
  where (r->>'floor')::int not between 1 and v_floors
     or (r->>'grid_x')::int < 0 or (r->>'grid_y')::int < 0
     or (r->>'grid_x')::int + coalesce((r->>'span_x')::int, 1) > v_cols
     or (r->>'grid_y')::int + coalesce((r->>'span_y')::int, 1) > v_rows
  limit 1;
  if v_bad is not null then
    raise exception 'Kamar % berada di luar denah (lantai/grid)', v_bad using errcode = '22023';
  end if;

  -- tidak boleh tumpang tindih (perhitungkan span)
  with cells as (
    select (r->>'id')::bigint as id, (r->>'floor')::int as fl, gx, gy
    from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb)) r,
         generate_series((r->>'grid_x')::int, (r->>'grid_x')::int + coalesce((r->>'span_x')::int, 1) - 1) gx,
         generate_series((r->>'grid_y')::int, (r->>'grid_y')::int + coalesce((r->>'span_y')::int, 1) - 1) gy
  )
  select string_agg(distinct k.nomor_kamar, ', ') into v_bad
  from cells c1 join cells c2 on c1.fl = c2.fl and c1.gx = c2.gx and c1.gy = c2.gy and c1.id <> c2.id
  join public.kamars k on k.id = c1.id;
  if v_bad is not null then
    raise exception 'Kamar tumpang tindih: %', v_bad using errcode = '22023';
  end if;

  insert into public.kost_layouts (kost_id, building_type, floors, grid_cols, grid_rows, footprint)
  values (p_kost_id, coalesce(p_layout->>'building_type', 'memanjang'), v_floors, v_cols, v_rows,
          coalesce(p_layout->'footprint', '{}'::jsonb))
  on conflict (kost_id) do update
    set building_type = excluded.building_type, floors = excluded.floors,
        grid_cols = excluded.grid_cols, grid_rows = excluded.grid_rows, footprint = excluded.footprint;

  -- kosongkan dulu semua posisi (hindari bentrok unique index saat kamar bertukar tempat)
  update public.kamars set grid_x = null, grid_y = null where kost_id = p_kost_id;

  update public.kamars k
     set floor = (r->>'floor')::int,
         grid_x = (r->>'grid_x')::int,
         grid_y = (r->>'grid_y')::int,
         span_x = coalesce((r->>'span_x')::int, 1),
         span_y = coalesce((r->>'span_y')::int, 1),
         door_side = nullif(r->>'door_side', '')
    from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb)) r
   where k.id = (r->>'id')::bigint and k.kost_id = p_kost_id;

  return private.get_kost_layout(p_kost_id);
end;
$$;

revoke all on function private.get_kost_layout(bigint) from public, anon;
revoke all on function private.save_kost_layout(bigint, jsonb, jsonb) from public, anon;
grant execute on function private.get_kost_layout(bigint) to authenticated;
grant execute on function private.save_kost_layout(bigint, jsonb, jsonb) to authenticated;

create function public.get_kost_layout(p_kost_id bigint) returns json
language sql stable security invoker set search_path = '' as $$
  select private.get_kost_layout(p_kost_id);
$$;
create function public.save_kost_layout(p_kost_id bigint, p_layout jsonb, p_rooms jsonb) returns json
language sql security invoker set search_path = '' as $$
  select private.save_kost_layout(p_kost_id, p_layout, p_rooms);
$$;

revoke all on function public.get_kost_layout(bigint) from public, anon;
revoke all on function public.save_kost_layout(bigint, jsonb, jsonb) from public, anon;
grant execute on function public.get_kost_layout(bigint) to authenticated;
grant execute on function public.save_kost_layout(bigint, jsonb, jsonb) to authenticated;
