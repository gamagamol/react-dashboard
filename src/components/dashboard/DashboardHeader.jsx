import React from 'react';
import {
    Shield,
    Sun,
    Moon,
    Bell,
    Download,
    Printer,
    LogOut,
    FileSpreadsheet,
    X,
    Plus,
    FileUp,
    Loader2,
    FileSpreadsheet as TemplateIcon,
} from 'lucide-react';
import { signOut } from '../../lib/authApi.js';
import {
    exportToCSV,
    exportToExcel,
    downloadTemplate,
} from '../../hooks/useExport.js';
import { APP_CONFIG } from '../../config/supabase.jsx';

export const DashboardHeader = ({
    user,
    role,
    darkMode,
    onToggleDark,
    members,
    notifications,
    showNotifications,
    onToggleNotifications,
    onCloseNotifications,
    isProcessing,
    fileInputRef,
    onBulkUploadClick,
    onAddMember,
}) => {
    const dm = darkMode;

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="max-w-full mx-auto mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-2xl shadow-sm ${dm ? 'bg-slate-900 border border-slate-800 text-blue-400' : 'bg-white text-blue-600'}`}
                >
                    <Shield size={30} />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight">
                        {APP_CONFIG.name}
                    </h1>
                    <p
                        className={`text-xs font-semibold ${dm ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                        {APP_CONFIG.subtitle} · {user?.email}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
                {/* Dark Mode Toggle */}
                <button
                    onClick={onToggleDark}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        dm
                            ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {dm ? <Sun size={16} /> : <Moon size={16} />}
                    <span className="hidden sm:inline">
                        {dm ? 'Terang' : 'Gelap'}
                    </span>
                </button>

                {/* Role indicator */}
                <div
                    className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                        dm
                            ? 'bg-slate-900 border-slate-800 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-500'
                    }`}
                >
                    {role === 'Admin' ? (
                        <span className="text-blue-400">⬡ Admin</span>
                    ) : (
                        <span className="text-slate-500">◯ Viewer</span>
                    )}
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleNotifications();
                        }}
                        className={`p-2.5 rounded-xl relative border transition-all ${
                            dm
                                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <Bell
                            size={18}
                            className={dm ? 'text-slate-300' : 'text-slate-600'}
                        />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-slate-950">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <NotificationPanel
                            notifications={notifications}
                            darkMode={dm}
                            onClose={onCloseNotifications}
                        />
                    )}
                </div>

                {/* Export group */}
                <div
                    className={`flex border rounded-xl overflow-hidden ${dm ? 'border-slate-800' : 'border-slate-200'}`}
                >
                    <button
                        onClick={() => exportToCSV(members)}
                        title="Export CSV"
                        className={`p-2.5 border-r transition-all ${dm ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={() => exportToExcel(members)}
                        title="Export Excel"
                        className={`p-2.5 border-r transition-all ${dm ? 'bg-slate-900 border-slate-800 text-emerald-500 hover:bg-slate-800' : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-50'}`}
                    >
                        <FileSpreadsheet size={16} />
                    </button>
                  
                </div>

                {/* Admin actions */}
                {role === 'Admin' && (
                    <>
                        <div
                            className={`flex border rounded-xl overflow-hidden ${dm ? 'border-slate-800' : 'border-slate-200'}`}
                        >
                            <button
                                onClick={downloadTemplate}
                                title="Download Template"
                                className={`p-2.5 border-r flex items-center gap-1.5 text-xs font-bold transition-all ${dm ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <TemplateIcon size={16} />
                                <span className="hidden sm:inline">
                                    Template
                                </span>
                            </button>
                            <button
                                onClick={onBulkUploadClick}
                                disabled={isProcessing}
                                title="Bulk Upload"
                                className={`p-2.5 flex items-center gap-1.5 text-xs font-bold transition-all ${dm ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                            >
                                {isProcessing ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FileUp size={16} />
                                )}
                                <span className="hidden sm:inline">Bulk</span>
                            </button>
                        </div>

                        <button
                            onClick={onAddMember}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            <Plus size={16} /> Personil
                        </button>
                    </>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        dm
                            ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-red-950/30'
                            : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'
                    }`}
                >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Keluar</span>
                </button>
            </div>
        </div>
    );
};

const NotificationPanel = ({ notifications, darkMode: dm, onClose }) => (
    <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl z-50 overflow-hidden ${
            dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
    >
        <div
            className={`px-5 py-3.5 border-b flex items-center justify-between ${dm ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
        >
            <span
                className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-slate-500'}`}
            >
                Peringatan Kontrak{' '}
                {notifications.length > 0 && `(${notifications.length})`}
            </span>
            <button
                onClick={onClose}
                className="text-slate-600 hover:text-slate-400 transition-colors"
            >
                <X size={14} />
            </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-600 italic">
                    Tidak ada kontrak jatuh tempo.
                </div>
            ) : (
                notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`px-5 py-4 border-b transition-colors ${
                            dm
                                ? 'border-slate-800 hover:bg-slate-800/50'
                                : 'border-slate-50 hover:bg-slate-50'
                        } ${n.tipe === 'urgent' ? (dm ? 'bg-red-950/20' : 'bg-red-50/60') : ''}`}
                    >
                        <div className="flex items-start gap-2">
                            <div
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.tipe === 'urgent' ? 'bg-red-500' : 'bg-amber-500'}`}
                            />
                            <div>
                                <p
                                    className={`text-xs font-bold ${dm ? 'text-slate-200' : 'text-slate-800'}`}
                                >
                                    {n.nama}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    {n.pesan}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
