import React, { useState, useEffect, useRef, useCallback } from 'react';

// Hooks
import {
    useMembers,
    useFilteredMembers,
    useDashboardStats,
    useContractNotifications,
} from '../Hooks/useMembers.js';
import { useXLSX, parseExcelFile } from '../hooks/useExport.js';

// Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader.jsx';
import { SummaryCards } from '../components/dashboard/SummaryCards.jsx';
import { TableToolbar } from '../components/dashboard/TableToolbar.jsx';
import { MemberList } from '../components/members/MemberList.jsx';
import { MemberForm } from '../components/members/MemberForm.jsx';
import { Toast } from '../components/ui/index.jsx';

// Config
import { APP_CONFIG } from '../config/supabase.jsx';

export const DashboardPage = ({ user, role, darkMode, onToggleDark }) => {
    useXLSX();

    const {
        members,
        loading,
        isProcessing,
        addMember,
        editMember,
        removeMember,
        bulkImport,
    } = useMembers();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('All');
    const [activeSummaryFilter, setActiveSummaryFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc',
    });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [modalState, setModalState] = useState({
        open: false,
        mode: 'view', // 'view' | 'edit' | 'add'
        data: null,
        loading: false,
    });

    const fileInputRef = useRef(null);

    const filteredMembers = useFilteredMembers(members, {
        searchTerm,
        filterUnit,
        activeSummaryFilter,
        sortConfig,
    });

    const stats = useDashboardStats(members);
    const notifications = useContractNotifications(members);

    const showStatus = useCallback((text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }, []);

    const closeModal = useCallback(() => {
        setModalState({
            open: false,
            mode: 'view',
            data: null,
            loading: false,
        });
    }, []);

    useEffect(() => {
        const handler = () => {
            setOpenMenuId(null);
            setShowNotifications(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const handleRequestSort = useCallback((key) => {
        setSortConfig((prev) => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const handleToggleSummaryFilter = useCallback((id) => {
        setActiveSummaryFilter((prev) => (prev === id ? 'all' : id));
    }, []);

    const openView = useCallback((member) => {
        setModalState({
            open: true,
            mode: 'view',
            data: member,
            loading: false,
        });
        setOpenMenuId(null);
    }, []);

    const openEdit = useCallback((member) => {
        setModalState({
            open: true,
            mode: 'edit',
            data: member,
            loading: false,
        });
        setOpenMenuId(null);
    }, []);

    const openAdd = useCallback(() => {
        const nextNIK = `IT${new Date().getFullYear()}${String(members.length + 1).padStart(3, '0')}`;
        setModalState({
            open: true,
            mode: 'add',
            data: {
                nik: nextNIK,
                nama: '',
                unit: 'Network Ops',
                project: '',
                lokasi: '',
                kontak: '',
                utilisasi: 50,
                status_kepegawaian: 'Organik',
                shift: 'Pagi',
                mode_kerja: 'Onsite',
                kontrak_berakhir: '',
                spesialisasi: [],
            },
            loading: false,
        });
    }, [members.length]);

    const handleSave = useCallback(
        async (payload) => {
            setModalState((prev) => ({ ...prev, loading: true }));
            try {
                if (modalState.mode === 'add') {
                    await addMember(payload);
                    showStatus('Personil berhasil ditambahkan!', 'success');
                } else {
                    await editMember(modalState.data.id, payload);
                    showStatus('Data berhasil diperbarui!', 'success');
                }
                closeModal();
            } catch (err) {
                showStatus(err.message || 'Terjadi kesalahan', 'error');
                setModalState((prev) => ({ ...prev, loading: false }));
            }
        },
        [modalState, addMember, editMember, showStatus, closeModal],
    );

    const handleDelete = useCallback(
        async (id) => {
            if (
                !window.confirm(
                    'Hapus data personil ini? Tindakan tidak bisa dibatalkan.',
                )
            )
                return;
            try {
                await removeMember(id);
                showStatus('Data berhasil dihapus.', 'success');
            } catch (err) {
                showStatus(err.message || 'Gagal menghapus data', 'error');
            }
        },
        [removeMember, showStatus],
    );

    const handleBulkUpload = useCallback(
        async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const rows = await parseExcelFile(file);
                if (!rows.length) {
                    showStatus('File kosong!', 'error');
                    return;
                }
                const { successCount, duplicateCount } = await bulkImport(rows);
                showStatus(
                    `Selesai. Berhasil: ${successCount}, Duplikat dilewati: ${duplicateCount}`,
                    duplicateCount > 0 ? 'warning' : 'success',
                );
            } catch (err) {
                showStatus(err.message || 'Gagal memproses file', 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        },
        [bulkImport, showStatus],
    );

    const dm = darkMode;

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${dm ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-4 md:p-8 pb-20`}
        >
            {/* Toast */}
            <Toast
                message={message}
                onClose={() => setMessage({ text: '', type: '' })}
            />

            {/* Hidden file input for bulk upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleBulkUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
            />

            {/* Header */}
            <DashboardHeader
                user={user}
                role={role}
                darkMode={dm}
                onToggleDark={onToggleDark}
                members={members}
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={() => setShowNotifications((p) => !p)}
                onCloseNotifications={() => setShowNotifications(false)}
                isProcessing={isProcessing}
                fileInputRef={fileInputRef}
                onBulkUploadClick={() => fileInputRef.current?.click()}
                onAddMember={openAdd}
            />

            {/* Summary Cards */}
            <SummaryCards
                stats={stats}
                activeFilter={activeSummaryFilter}
                onToggleFilter={handleToggleSummaryFilter}
                darkMode={dm}
            />

            {/* Main Table Card */}
            <div
                className={`rounded-3xl border shadow-sm overflow-hidden ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
                {/* Toolbar */}
                <TableToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterUnit={filterUnit}
                    onFilterUnitChange={setFilterUnit}
                    darkMode={dm}
                    totalShown={filteredMembers.length}
                    totalAll={members.length}
                />

                {/* Table */}
                <MemberList
                    members={filteredMembers}
                    loading={loading}
                    role={role}
                    darkMode={dm}
                    sortConfig={sortConfig}
                    onRequestSort={handleRequestSort}
                    openMenuId={openMenuId}
                    onToggleMenu={(id) =>
                        setOpenMenuId((prev) => (prev === id ? null : id))
                    }
                    onView={openView}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />

                {/* Table Footer */}
                <div
                    className={`px-6 py-3 border-t flex justify-between items-center text-[10px] font-medium text-slate-600 ${dm ? 'border-slate-800' : 'border-slate-100'}`}
                >
                    <span>
                        Menampilkan <strong>{filteredMembers.length}</strong>{' '}
                        dari <strong>{members.length}</strong> personil
                    </span>
                    <span className="italic">
                        {APP_CONFIG.name} {APP_CONFIG.version}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <div className="flex gap-6">
                    {[
                        ['bg-blue-500', 'Normal'],
                        ['bg-orange-500', 'High'],
                        ['bg-red-500', 'Critical'],
                        ['bg-emerald-500', 'Organik'],
                    ].map(([color, label]) => (
                        <span key={label} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${color}`} />{' '}
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {modalState.open && modalState.data && (
                <MemberForm
                    mode={modalState.mode}
                    initialData={modalState.data}
                    darkMode={dm}
                    role={role}
                    loading={modalState.loading}
                    onSubmit={handleSave}
                    onClose={closeModal}
                    onSwitchToEdit={() =>
                        setModalState((prev) => ({ ...prev, mode: 'edit' }))
                    }
                />
            )}
        </div>
    );
};
