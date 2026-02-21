# Dashboard Manage Operation SSO — v2.5

## 📁 Struktur Project

```
sso-dashboard/
├── database/
│   └── schema.sql              ← Schema PostgreSQL lengkap (jalankan di Supabase Studio)
│
├── src/
│   ├── config/
│   │   └── supabase.jsx         ← Konfigurasi URL, key, konstanta enum
│   │
│   ├── lib/
│   │   ├── supabaseClient.js   ← Supabase client singleton
│   │   ├── authApi.js          ← signIn, signOut, getSession, getUserRole
│   │   └── membersApi.js       ← fetch, insert, update, delete, bulk, views
│   │
│   ├── hooks/
│   │   ├── useAuth.js          ← Hook: auth state + role
│   │   ├── useMembers.js       ← Hook: data, CRUD, filter, sort, stats, notif
│   │   └── useExport.js        ← Hook: export CSV/Excel, template, parse file
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx       ← Halaman login
│   │   └── DashboardPage.jsx   ← Halaman dashboard (orkestrasi)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.jsx       ← Toast, SortIcon, Badge, Avatar, dll
│   │   ├── auth/               ← (reserved untuk future components)
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.jsx  ← Header, notif, export, logout
│   │   │   ├── SummaryCards.jsx     ← 4 kartu statistik
│   │   │   └── TableToolbar.jsx     ← Search, filter unit
│   │   └── members/
│   │       ├── MemberList.jsx   ← Tabel data personil (LIST)
│   │       └── MemberForm.jsx   ← Modal Add/Edit/View (INSERT/UPDATE)
│   │
│   └── App.jsx                 ← Root: auth routing (login vs dashboard)
│
├── .env.example                ← Template environment variables
└── package.json
```

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env sesuai kredensial Supabase Anda
```

### 3. Jalankan SQL Schema

Buka **Supabase Studio → SQL Editor** dan jalankan seluruh isi `database/schema.sql`

### 4. Buat user login

Di Supabase Studio → **Authentication → Users → Add User**
Isi email + password, lalu set sebagai Admin:

```sql
UPDATE public.user_roles SET role = 'Admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@sso.id');
```

### 5. Jalankan dev server

```bash
npm run dev
```

---

## 🔑 Environment Variables

| Variable                 | Keterangan           |
| ------------------------ | -------------------- |
| `VITE_SUPABASE_URL`      | URL Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Anon/Publishable key |

**Local:** `http://127.0.0.1:54321` + key dari `supabase start`
**Cloud:** URL & key dari `dashboard.supabase.com → Settings → API`

---

## 🗄️ Database Schema

### Tabel: `members`

| Kolom              | Tipe     | Keterangan                               |
| ------------------ | -------- | ---------------------------------------- |
| `id`               | UUID     | Primary key                              |
| `nik`              | TEXT     | Unique, tidak bisa duplikat              |
| `utilisasi`        | SMALLINT | 0–100, trigger auto-hitung `beban_kerja` |
| `beban_kerja`      | ENUM     | Auto-kalkulasi via DB trigger            |
| `kontrak_berakhir` | DATE     | NULL untuk Organik                       |

### Views

- `v_members_detail` — members + `sisa_hari_kontrak` + `status_kontrak`
- `v_dashboard_summary` — 1 row statistik keseluruhan
- `v_stats_per_unit` — statistik per unit

### RLS Policies

- **SELECT**: semua authenticated user
- **INSERT/UPDATE/DELETE**: hanya role Admin (via `user_roles` table)

---

## ✨ Fitur

- ✅ Login/Logout dengan Supabase Auth
- ✅ Role-based access (Admin vs Viewer dari DB)
- ✅ Realtime — data update otomatis
- ✅ CRUD lengkap (List, View, Add, Edit, Delete)
- ✅ Bulk Import Excel/CSV dengan validasi duplikat NIK
- ✅ Export ke CSV & Excel (.xlsx)
- ✅ Download template Excel
- ✅ Filter, Search, Sort
- ✅ Notifikasi kontrak jatuh tempo (H-60)
- ✅ Dark/Light mode
