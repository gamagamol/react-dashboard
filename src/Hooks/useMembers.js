// src/hooks/useMembers.js
// Data members: di-fetch dari DB setiap kali dibutuhkan
// Realtime subscription memastikan data auto-update saat ada perubahan
// Data yang TIDAK berubah selama session: user session (di useAuth)
// Data yang SELALU fresh dari DB: members, units, status_pegawai
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import {
  fetchAllMembers,
  insertMember,
  updateMember,
  deleteMember,
  checkNikExists,
  bulkInsertMembers,
} from '../lib/MembersApi.js';
import { BEBAN_KERJA_WEIGHTS } from '../config/supabase.jsx';

// ─── Hook utama: members data + CRUD + realtime ───────────────────────────────
export const useMembers = () => {
  const [members,      setMembers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selalu fetch fresh dari DB — tidak pakai cache
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message);
      console.error('loadMembers error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch pertama kali saat komponen mount
    loadMembers();

    // Realtime: auto re-fetch setiap ada INSERT/UPDATE/DELETE di tabel members
    const channel = supabase
      .channel('members-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => {
          // Fetch ulang dari DB saat ada perubahan — tidak pakai data dari event
          // supaya data yang ditampilkan selalu konsisten dengan DB
          loadMembers();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadMembers]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addMember = useCallback(async (payload) => {
    const exists = await checkNikExists(payload.nik);
    if (exists) throw new Error(`NIK "${payload.nik}" sudah terdaftar!`);
    const result = await insertMember(payload);
    // loadMembers() akan dipanggil otomatis oleh realtime subscription
    return result;
  }, []);

  const editMember = useCallback(async (id, payload) => {
    const exists = await checkNikExists(payload.nik, id);
    if (exists) throw new Error(`NIK "${payload.nik}" sudah digunakan member lain!`);
    const result = await updateMember(id, payload);
    // loadMembers() akan dipanggil otomatis oleh realtime subscription
    return result;
  }, []);

  const removeMember = useCallback(async (id) => {
    await deleteMember(id);
    // loadMembers() akan dipanggil otomatis oleh realtime subscription
  }, []);

  const bulkImport = useCallback(async (rows) => {
    setIsProcessing(true);
    try {
      const existingNIKs = new Set(members.map((m) => m.nik));
      const result = await bulkInsertMembers(rows, existingNIKs);
      // loadMembers() akan dipanggil otomatis oleh realtime subscription
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [members]);

  return { members, loading, error, isProcessing, loadMembers, addMember, editMember, removeMember, bulkImport };
};

// ─── Hook: filter + sort ──────────────────────────────────────────────────────
export const useFilteredMembers = (members, { searchTerm, filterUnit, activeSummaryFilter, sortConfig }) => {
  return useMemo(() => {
    let result = [...members];

    if (searchTerm) {
      const sl = searchTerm.toLowerCase();
      result = result.filter((m) =>
        m.nama?.toLowerCase().includes(sl)      ||
        m.nik?.toLowerCase().includes(sl)       ||
        m.project?.toLowerCase().includes(sl)   ||
        m.unit_nama?.toLowerCase().includes(sl) ||
        m.spesialisasi?.some((s) => s.toLowerCase().includes(sl))
      );
    }

    if (filterUnit && filterUnit !== 'All') {
      result = result.filter((m) => m.unit_nama === filterUnit);
    }

    if (activeSummaryFilter === 'organik') {
      result = result.filter((m) => m.status_nama === 'Organik');
    } else if (activeSummaryFilter === 'critical') {
      result = result.filter((m) => m.utilisasi > 90);
    } else if (activeSummaryFilter === 'expiring') {
      result = result.filter((m) => {
        if (!m.kontrak_berakhir) return false;
        const diff = (new Date(m.kontrak_berakhir) - new Date()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 60;
      });
    }

    if (sortConfig?.key) {
      result.sort((a, b) => {
        let va = a[sortConfig.key] ?? '';
        let vb = b[sortConfig.key] ?? '';
        if (sortConfig.key === 'beban_kerja') {
          va = BEBAN_KERJA_WEIGHTS[a.beban_kerja] ?? 0;
          vb = BEBAN_KERJA_WEIGHTS[b.beban_kerja] ?? 0;
        }
        if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
        if (va > vb) return sortConfig.direction === 'asc' ?  1 : -1;
        return 0;
      });
    }

    return result;
  }, [members, searchTerm, filterUnit, activeSummaryFilter, sortConfig]);
};

// ─── Hook: stats untuk summary cards ─────────────────────────────────────────
export const useDashboardStats = (members) => {
  return useMemo(() => ({
    total:         members.length,
    organik:       members.filter((m) => m.status_nama === 'Organik').length,
    kontrakSegera: members.filter((m) => {
      if (!m.kontrak_berakhir) return false;
      const diff = (new Date(m.kontrak_berakhir) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 60;
    }).length,
    criticalCount: members.filter((m) => m.utilisasi > 90).length,
  }), [members]);
};

// ─── Hook: notifikasi kontrak jatuh tempo ────────────────────────────────────
export const useContractNotifications = (members) => {
  return useMemo(() => {
    const now = new Date();
    return members
      .filter((m) => {
        if (!m.kontrak_berakhir) return false;
        const diff = (new Date(m.kontrak_berakhir) - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 60;
      })
      .map((m) => ({
        id:    m.id,
        nama:  m.nama,
        pesan: `Kontrak berakhir ${new Date(m.kontrak_berakhir).toLocaleDateString('id-ID')}`,
        tipe:  (new Date(m.kontrak_berakhir) - now) / (1000 * 60 * 60 * 24) < 30 ? 'urgent' : 'warning',
      }));
  }, [members]);
};