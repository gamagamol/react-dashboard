import { supabase } from './supabaseClient.js';

/**
 * Ambil semua members, diurutkan berdasarkan nama
 * Menggunakan view v_members_detail untuk mendapatkan info kontrak
 */
export const fetchAllMembers = async () => {
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('nama', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Ambil satu member berdasarkan ID
 */
export const fetchMemberById = async (id) => {
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Tambah member baru
 * @param {Object} payload - data member tanpa id, created_at, updated_at
 */
export const insertMember = async (payload) => {
    const { data, error } = await supabase
        .from('team_members')
        .insert(sanitizePayload(payload))
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update member yang sudah ada
 * @param {string} id - UUID member
 * @param {Object} payload - data yang ingin diupdate
 */
export const updateMember = async (id, payload) => {
    const {
        id: _id,
        created_at: _ca,
        updated_at: _ua,
        sisa_hari_kontrak: _shk,
        status_kontrak: _sk,
        ...rest
    } = payload;

    const { data, error } = await supabase
        .from('team_members')
        .update(sanitizePayload(rest))
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Hapus member berdasarkan ID
 */
export const deleteMember = async (id) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);

    if (error) throw error;
    return true;
};

/**
 * Cek apakah NIK sudah ada (untuk validasi duplikat)
 */
export const checkNikExists = async (nik, excludeId = null) => {
    let query = supabase.from('team_members').select('id').eq('nik', nik);

    if (excludeId) query = query.neq('id', excludeId);

    const { data, error } = await query;
    if (error) throw error;
    return data.length > 0;
};

/**
 * Bulk insert members dari Excel/CSV
 * Memfilter duplikat NIK sebelum insert
 * @returns {{ successCount, duplicateCount, errors }}
 */
export const bulkInsertMembers = async (rows, existingNIKs = new Set()) => {
    const toInsert = [];
    let duplicateCount = 0;
    const errors = [];

    for (const item of rows) {
        const nik = String(item.NIK || '').trim();
        if (!nik || existingNIKs.has(nik)) {
            duplicateCount++;
            continue;
        }

        toInsert.push({
            nik,
            nama: item.Nama || 'Tanpa Nama',
            unit: item.Unit || 'Network Ops',
            project: item.Project || 'MO General',
            lokasi: item.Lokasi || 'Jakarta',
            kontak: item.Kontak || '-',
            utilisasi: parseInt(item.Utilisasi) || 0,
            status_kepegawaian: item.Status || 'Organik',
            shift: item.Shift || 'Pagi',
            mode_kerja: item.Mode || 'Onsite',
            kontrak_berakhir: item.Akhir_Kontrak || null,
            spesialisasi: item.Spesialisasi
                ? String(item.Spesialisasi)
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [],
        });

        existingNIKs.add(nik);
    }

    if (toInsert.length === 0) {
        return { successCount: 0, duplicateCount, errors };
    }

    const { error } = await supabase.from('team_members').insert(toInsert);
    if (error) throw error;

    return { successCount: toInsert.length, duplicateCount, errors };
};

/**
 * Ambil statistik dashboard dari view
 */
export const fetchDashboardSummary = async () => {
    const { data, error } = await supabase
        .from('v_dashboard_summary')
        .select('*')
        .single();

    if (error) throw error;
    return data;
};

/**
 * Ambil statistik per unit
 */
export const fetchStatsPerUnit = async () => {
    const { data, error } = await supabase.from('v_stats_per_unit').select('*');

    if (error) throw error;
    return data;
};


const sanitizePayload = (payload) => {
    const {
        id: _id,
        created_at: _ca,
        updated_at: _ua,
        sisa_hari_kontrak: _shk,
        status_kontrak: _sk,
        beban_kerja: _bk, 
        ...rest
    } = payload;

    return {
        ...rest,
        utilisasi: parseInt(rest.utilisasi) || 0,
        kontrak_berakhir: rest.kontrak_berakhir || null,
        spesialisasi: Array.isArray(rest.spesialisasi)
            ? rest.spesialisasi
            : typeof rest.spesialisasi === 'string'
              ? rest.spesialisasi
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
              : [],
    };
};
