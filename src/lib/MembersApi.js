// src/lib/membersApi.js
import { supabase } from './supabaseClient.js';

// ─── SELECT dengan JOIN ke lookup tables ──────────────────────────────────────
export const fetchAllMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select(`
      id, nik, nama, project, lokasi, kontak,
      utilisasi, shift, mode_kerja, kontrak_berakhir,
      spesialisasi, beban_kerja, created_at, updated_at,
      unit:unit_id ( id, nama ),
      status:status_pegawai_id ( id, nama )
    `)
    .order('nama', { ascending: true });

  if (error) { console.error('fetchAllMembers error:', error); throw error; }
  return (data || []).map(normalizeRow);
};

// ─── INSERT via form ──────────────────────────────────────────────────────────
// payload.unit_id dan payload.status_pegawai_id sudah berupa integer (id dari DB)
export const insertMember = async (payload) => {
  // Ambil nama status dari DB untuk cek isOrganik
  const statusNama = await resolveStatusNama(payload.status_pegawai_id);
  const cleaned    = buildPayload(payload, statusNama);

  const { data, error } = await supabase
    .from('members')
    .insert(cleaned)
    .select(`
      id, nik, nama, project, lokasi, kontak,
      utilisasi, shift, mode_kerja, kontrak_berakhir,
      spesialisasi, beban_kerja, created_at, updated_at,
      unit:unit_id ( id, nama ),
      status:status_pegawai_id ( id, nama )
    `)
    .single();

  if (error) throw error;
  return normalizeRow(data);
};

// ─── UPDATE via form ──────────────────────────────────────────────────────────
export const updateMember = async (id, payload) => {
  const statusNama = await resolveStatusNama(payload.status_pegawai_id);
  const cleaned    = buildPayload(payload, statusNama);

  const { data, error } = await supabase
    .from('members')
    .update(cleaned)
    .eq('id', id)
    .select(`
      id, nik, nama, project, lokasi, kontak,
      utilisasi, shift, mode_kerja, kontrak_berakhir,
      spesialisasi, beban_kerja, created_at, updated_at,
      unit:unit_id ( id, nama ),
      status:status_pegawai_id ( id, nama )
    `)
    .single();

  if (error) throw error;
  return normalizeRow(data);
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteMember = async (id) => {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ─── CEK DUPLIKAT NIK ─────────────────────────────────────────────────────────
export const checkNikExists = async (nik, excludeId = null) => {
  let query = supabase.from('members').select('id').eq('nik', nik);
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query;
  if (error) throw error;
  return data.length > 0;
};

// ─── BULK INSERT dari Excel ───────────────────────────────────────────────────
// User mengisi nama unit/status (teks), bukan id
// Fungsi ini fetch lookup dari DB, lalu resolve nama → id sebelum insert
export const bulkInsertMembers = async (rows, existingNIKs = new Set()) => {
  // Fetch lookup tables dari DB
  const [{ data: units, error: uErr }, { data: statusList, error: sErr }] = await Promise.all([
    supabase.from('units').select('id, nama'),
    supabase.from('status_pegawai').select('id, nama'),
  ]);

  if (uErr) throw new Error('Gagal mengambil data units: ' + uErr.message);
  if (sErr) throw new Error('Gagal mengambil data status pegawai: ' + sErr.message);

  // Map nama lowercase → id
  const unitMap   = buildLookupMap(units   || []);
  const statusMap = buildLookupMap(statusList || []);

  // Valid values untuk pesan error
  const validUnits   = (units   || []).map((u) => u.nama).join(', ');
  const validStatuses = (statusList || []).map((s) => s.nama).join(', ');

  // Cari id status Organik untuk cek kontrak
  const organikId = (statusList || []).find(
    (s) => s.nama.toLowerCase() === 'organik'
  )?.id;

  const toInsert     = [];
  let duplicateCount = 0;
  const errors       = [];

  for (const item of rows) {
    const nik = String(item.NIK || '').trim();

    // Skip duplikat
    if (!nik || existingNIKs.has(nik)) {
      duplicateCount++;
      continue;
    }

    // Validasi Unit — wajib ada, harus cocok dengan data di DB
    const unitNama = String(item.Unit || '').trim();
    if (!unitNama) {
      errors.push(`NIK ${nik}: Kolom "Unit" wajib diisi`);
      continue;
    }
    const unit_id = unitMap[unitNama.toLowerCase()];
    if (!unit_id) {
      errors.push(`NIK ${nik}: Unit "${unitNama}" tidak ditemukan. Pilihan valid: ${validUnits}`);
      continue;
    }

    // Validasi Status — wajib ada, harus cocok dengan data di DB
    const statusNama = String(item.Status || '').trim();
    if (!statusNama) {
      errors.push(`NIK ${nik}: Kolom "Status" wajib diisi`);
      continue;
    }
    const status_pegawai_id = statusMap[statusNama.toLowerCase()];
    if (!status_pegawai_id) {
      errors.push(`NIK ${nik}: Status "${statusNama}" tidak ditemukan. Pilihan valid: ${validStatuses}`);
      continue;
    }

    // Kontrak berakhir — null jika Organik
    const isOrganik      = status_pegawai_id === organikId;
    const kontrak_berakhir = isOrganik ? null : (String(item.Akhir_Kontrak || '').trim() || null);

    toInsert.push({
      nik,
      nama:             String(item.Nama    || '').trim() || 'Tanpa Nama',
      unit_id,
      project:          String(item.Project || '').trim() || 'MO General',
      lokasi:           String(item.Lokasi  || '').trim() || 'Jakarta',
      kontak:           String(item.Kontak  || '').trim() || '-',
      utilisasi:        Math.min(Math.max(parseInt(item.Utilisasi) || 0, 0), 100),
      status_pegawai_id,
      shift:            item.Shift || 'Pagi',
      mode_kerja:       item.Mode  || 'Onsite',
      kontrak_berakhir,
      spesialisasi:     item.Spesialisasi
        ? String(item.Spesialisasi).split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      // beban_kerja auto-diisi trigger DB dari utilisasi
    });

    existingNIKs.add(nik);
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('members').insert(toInsert);
    if (error) throw error;
  }

  return { successCount: toInsert.length, duplicateCount, errors };
};

// ─── FETCH untuk Export (flat, berisi nama bukan id) ─────────────────────────
export const fetchMembersForExport = async () => {
  const members = await fetchAllMembers();
  return members.map((m) => ({
    NIK:           m.nik,
    Nama:          m.nama,
    Unit:          m.unit_nama,
    Project:       m.project,
    Lokasi:        m.lokasi,
    Kontak:        m.kontak,
    Utilisasi:     m.utilisasi,
    Status:        m.status_nama,
    Shift:         m.shift,
    Mode:          m.mode_kerja,
    Akhir_Kontrak: m.kontrak_berakhir || '',
    Spesialisasi:  (m.spesialisasi || []).join(', '),
    Beban_Kerja:   m.beban_kerja,
  }));
};

// ─── Internal Helpers ─────────────────────────────────────────────────────────

// Normalize JOIN result → flat field
const normalizeRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    unit_id:           row.unit?.id   || row.unit_id,
    status_pegawai_id: row.status?.id || row.status_pegawai_id,
    unit_nama:         row.unit?.nama   || '-',
    status_nama:       row.status?.nama || '-',
    unit:   undefined,
    status: undefined,
  };
};

// Build payload INSERT/UPDATE — unit_id & status_pegawai_id sudah integer dari form
// statusNama di-resolve dari DB (bukan dari form) supaya tidak hardcode
const buildPayload = (payload, statusNama = '') => {
  const utilisasi  = Math.min(Math.max(parseInt(payload.utilisasi) || 0, 0), 100);
  const isOrganik  = statusNama.toLowerCase() === 'organik';

  return {
    nik:               String(payload.nik || '').trim(),
    nama:              String(payload.nama || '').trim(),
    unit_id:           parseInt(payload.unit_id),
    project:           String(payload.project  || '').trim(),
    lokasi:            String(payload.lokasi   || '').trim(),
    kontak:            String(payload.kontak   || '').trim(),
    utilisasi,
    status_pegawai_id: parseInt(payload.status_pegawai_id),
    shift:             payload.shift     || 'Pagi',
    mode_kerja:        payload.mode_kerja || 'Onsite',
    kontrak_berakhir:  isOrganik ? null : (payload.kontrak_berakhir || null),
    spesialisasi:      Array.isArray(payload.spesialisasi)
      ? payload.spesialisasi
      : typeof payload.spesialisasi === 'string'
        ? payload.spesialisasi.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    // beban_kerja tidak diisi — auto dari trigger DB
  };
};

// Fetch nama status dari DB berdasarkan id — untuk cek isOrganik di insert/update
const resolveStatusNama = async (statusId) => {
  if (!statusId) return '';
  const { data } = await supabase
    .from('status_pegawai')
    .select('nama')
    .eq('id', parseInt(statusId))
    .single();
  return data?.nama || '';
};

// Build map lowercase nama → id
const buildLookupMap = (arr) =>
  arr.reduce((acc, item) => {
    acc[item.nama.toLowerCase()] = item.id;
    return acc;
  }, {});