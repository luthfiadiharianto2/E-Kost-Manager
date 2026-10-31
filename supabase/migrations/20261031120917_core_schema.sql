-- E-Kost Manager: skema inti (pengganti migrations Laravel)
-- id user = uuid dari auth.users; tabel lain memakai bigint identity.

-- ===== Skema privat untuk fungsi security definer (tidak diekspos Data API) =====
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ===== PROFIL PENGGUNA (1:1 dengan auth.users) =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text unique,
  email text not null,
  role text not null default 'tenant' check (role in ('admin','tenant')),
  phone text, whatsapp text, address text, avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.owner_profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null unique default auth.uid() references public.profiles(id) on delete cascade,
  nama_kost text, alamat text, kode_pos text, provinsi text, kota text,
  kecamatan text, kelurahan text, pilihan_pembayaran text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kosts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nama_kost text not null,
  alamat_kost text not null default '',
  jumlah_kamar int not null default 0,
  harga numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index kosts_user_id_idx on public.kosts (user_id);

create table public.room_types (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null,
  price int not null check (price >= 0),
  facilities text, description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index room_types_user_id_idx on public.room_types (user_id);

create table public.kamars (
  id bigint generated always as identity primary key,
  kost_id bigint not null references public.kosts(id) on delete cascade,
  tenant_id uuid references public.profiles(id) on delete set null,
  nomor_kamar text not null,
  tipe_kamar text not null,
  harga_sewa int not null check (harga_sewa >= 0),
  status text not null default 'tersedia' check (status in ('tersedia','terisi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- unik per kost (di Laravel unik global)
  unique (kost_id, nomor_kamar)
);
create index kamars_kost_id_idx on public.kamars (kost_id);
create index kamars_tenant_id_idx on public.kamars (tenant_id);

create table public.invitations (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  email text not null,
  name text,
  token text not null unique,
  expires_at timestamptz not null,
  is_used boolean not null default false,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index invitations_email_is_used_idx on public.invitations (email, is_used);
create index invitations_owner_id_idx on public.invitations (owner_id);

create table public.testimonis (
  id bigint generated always as identity primary key,
  nama text not null check (char_length(nama) between 1 and 100),
  email text not null check (char_length(email) <= 200),
  pesan text not null check (char_length(pesan) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- ===== updated_at generik =====
create function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.owner_profiles
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.kosts
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.room_types
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.kamars
  for each row execute function private.set_updated_at();

-- ===== Profil otomatis untuk setiap user Auth baru =====
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
    new.email,
    'tenant'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Email di profiles mengikuti auth.users (setelah user konfirmasi ganti email)
create function private.sync_user_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_user_email();

-- ===== Cegah eskalasi hak akses: user biasa tidak boleh ubah role/email =====
-- Fungsi security definer (register_owner, sync email) berjalan sebagai owner fungsi,
-- jadi hanya request langsung dari client (role anon/authenticated) yang ditolak.
create function private.guard_profile_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.role is distinct from old.role then
      raise exception 'Role tidak dapat diubah' using errcode = '42501';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Email hanya dapat diubah melalui verifikasi akun' using errcode = '42501';
    end if;
    if new.id is distinct from old.id then
      raise exception 'ID tidak dapat diubah' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_profile_update before update on public.profiles
  for each row execute function private.guard_profile_update();

-- Penghuni kamar hanya boleh diubah lewat RPC assign_tenant (yang memvalidasi undangan)
create function private.guard_kamar_tenant() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' and new.tenant_id is not null then
      raise exception 'Penghuni kamar diatur melalui fitur assign penyewa' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and new.tenant_id is distinct from old.tenant_id then
      raise exception 'Penghuni kamar diatur melalui fitur assign penyewa' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_kamar_tenant before insert or update on public.kamars
  for each row execute function private.guard_kamar_tenant();
