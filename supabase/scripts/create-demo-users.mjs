// Membuat akun Auth demo lewat Supabase Admin API, lalu seed.sql bisa dijalankan.
//
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service role key, JANGAN di-commit> \
//   DEMO_PASSWORD=<password demo> \
//   node supabase/scripts/create-demo-users.mjs
//
// Service role key hanya dipakai di mesin lokal; jangan pernah ditaruh di env Vercel / VITE_*.

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;

if (!url || !serviceKey || !password) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan DEMO_PASSWORD terlebih dahulu.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('DEMO_PASSWORD minimal 8 karakter.');
  process.exit(1);
}

const users = [
  { email: 'pemilik.demo@ekost.test', name: 'Pemilik Demo' },
  { email: 'penyewa1.demo@ekost.test', name: 'Sari Penyewa' },
  { email: 'penyewa2.demo@ekost.test', name: 'Andi Penyewa' },
  { email: 'penyewa3.demo@ekost.test', name: 'Rina Penyewa' },
  { email: 'penyewa4.demo@ekost.test', name: 'Dodi Penyewa' },
  { email: 'penyewa5.demo@ekost.test', name: 'Maya Penyewa' },
];

for (const u of users) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: u.email, password, email_confirm: true, user_metadata: { name: u.name } }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) console.log(`dibuat   ${u.email}`);
  else if (res.status === 422 || String(body.msg || body.message).includes('already')) console.log(`sudah ada ${u.email}`);
  else console.error(`gagal    ${u.email}: ${res.status} ${body.msg || body.message || ''}`);
}

console.log('Selesai. Jalankan supabase/seed.sql (SQL editor / `supabase db reset`) untuk mengisi data demo.');
