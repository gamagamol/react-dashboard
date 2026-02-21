import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import {
    fetchAllMembers,
    insertMember,
    updateMember,
    deleteMember,
    checkNikExists,
    bulkInsertMembers,
} from '../lib/membersApi.js';
import { BEBAN_KERJA_WEIGHTS } from '../config/supabase.jsx';

/**
 * Hook utama untuk semua operasi member
 */
export const useMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllMembers();
            setMembers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMembers();

        const channel = supabase
            .channel('members-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'team_members' },
                () => {
                    loadMembers();
                },
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [loadMembers]);

    const addMember = useCallback(
        async (payload) => {
            const exists = await checkNikExists(payload.nik);
            if (exists) throw new Error(`NIK ${payload.nik} sudah terdaftar!`);
            const result = await insertMember(payload);
            await loadMembers();
            return result;
        },
        [loadMembers],
    );

    const editMember = useCallback(
        async (id, payload) => {
            const result = await updateMember(id, payload);
            await loadMembers();
            return result;
        },
        [loadMembers],
    );

    const removeMember = useCallback(
        async (id) => {
            await deleteMember(id);
            await loadMembers();
        },
        [loadMembers],
    );

    const bulkImport = useCallback(
        async (rows) => {
            setIsProcessing(true);
            try {
                const existingNIKs = new Set(members.map((m) => m.nik));
                const result = await bulkInsertMembers(rows, existingNIKs);
                await loadMembers();
                return result;
            } finally {
                setIsProcessing(false);
            }
        },
        [members, loadMembers],
    );

    return {
        members,
        loading,
        error,
        isProcessing,
        loadMembers,
        addMember,
        editMember,
        removeMember,
        bulkImport,
    };
};

/**
 * Hook untuk filtering, sorting, dan searching members
 */
export const useFilteredMembers = (
    members,
    { searchTerm, filterUnit, activeSummaryFilter, sortConfig },
) => {
    return useMemo(() => {
        let result = [...members];

        // Filter search
        if (searchTerm) {
            const sl = searchTerm.toLowerCase();
            result = result.filter(
                (m) =>
                    m.nama?.toLowerCase().includes(sl) ||
                    m.nik?.toLowerCase().includes(sl) ||
                    m.project?.toLowerCase().includes(sl) ||
                    m.spesialisasi?.some((s) => s.toLowerCase().includes(sl)),
            );
        }

        // Filter unit
        if (filterUnit && filterUnit !== 'All') {
            result = result.filter((m) => m.unit === filterUnit);
        }

        // Filter summary cards
        if (activeSummaryFilter === 'organik') {
            result = result.filter((m) => m.status_kepegawaian === 'Organik');
        } else if (activeSummaryFilter === 'critical') {
            result = result.filter((m) => m.utilisasi > 90);
        } else if (activeSummaryFilter === 'expiring') {
            result = result.filter((m) => {
                if (!m.kontrak_berakhir) return false;
                const diff =
                    (new Date(m.kontrak_berakhir) - new Date()) /
                    (1000 * 60 * 60 * 24);
                return diff >= 0 && diff < 60;
            });
        }

        // Sort
        if (sortConfig?.key) {
            result.sort((a, b) => {
                let va = a[sortConfig.key] ?? '';
                let vb = b[sortConfig.key] ?? '';
                if (sortConfig.key === 'beban_kerja') {
                    va = BEBAN_KERJA_WEIGHTS[a.beban_kerja] ?? 0;
                    vb = BEBAN_KERJA_WEIGHTS[b.beban_kerja] ?? 0;
                }
                if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
                if (va > vb) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [members, searchTerm, filterUnit, activeSummaryFilter, sortConfig]);
};

/**
 * Hook untuk menghitung statistik dashboard
 */
export const useDashboardStats = (members) => {
    return useMemo(
        () => ({
            total: members.length,
            organik: members.filter((m) => m.status_kepegawaian === 'Organik')
                .length,
            kontrakSegera: members.filter((m) => {
                if (!m.kontrak_berakhir) return false;
                const diff =
                    (new Date(m.kontrak_berakhir) - new Date()) /
                    (1000 * 60 * 60 * 24);
                return diff >= 0 && diff < 60;
            }).length,
            criticalCount: members.filter((m) => m.utilisasi > 90).length,
        }),
        [members],
    );
};

/**
 * Hook untuk notifikasi kontrak jatuh tempo
 */
export const useContractNotifications = (members) => {
    return useMemo(() => {
        const now = new Date();
        return members
            .filter((m) => {
                if (!m.kontrak_berakhir) return false;
                const expiry = new Date(m.kontrak_berakhir);
                const diffMonths =
                    (expiry.getFullYear() - now.getFullYear()) * 12 +
                    (expiry.getMonth() - now.getMonth());
                return diffMonths >= 0 && diffMonths <= 2;
            })
            .map((m) => ({
                id: m.id,
                nama: m.nama,
                pesan: `Kontrak berakhir pada ${new Date(m.kontrak_berakhir).toLocaleDateString('id-ID')}`,
                tipe:
                    (new Date(m.kontrak_berakhir) - now) /
                        (1000 * 60 * 60 * 24) <
                    30
                        ? 'urgent'
                        : 'warning',
            }));
    }, [members]);
};
