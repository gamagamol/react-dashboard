import React from 'react';
import {
    AlertTriangle,
    CheckCircle,
    X,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
} from 'lucide-react';
import { BEBAN_KERJA_COLORS } from '../../config/supabase.jsx';

export const Toast = ({ message, onClose }) => {
    if (!message?.text) return null;
    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${
                message.type === 'error'
                    ? 'bg-red-600'
                    : message.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
            } text-white`}
        >
            {message.type === 'error' ? (
                <AlertTriangle size={18} />
            ) : (
                <CheckCircle size={18} />
            )}
            <span className="text-sm font-bold">{message.text}</span>
            <button
                onClick={onClose}
                className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export const SortIcon = ({ columnKey, sortConfig }) => {
    if (sortConfig?.key !== columnKey)
        return <ArrowUpDown size={12} className="text-slate-600" />;
    return sortConfig.direction === 'asc' ? (
        <ChevronUp size={12} className="text-blue-400" />
    ) : (
        <ChevronDown size={12} className="text-blue-400" />
    );
};

export const BebanBadge = ({ value }) => (
    <span
        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wide ${BEBAN_KERJA_COLORS[value] || ''}`}
    >
        {value}
    </span>
);

export const StatusKontrakBadge = ({ member, darkMode }) => {
    if (!member.kontrak_berakhir) {
        return (
            <span
                className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${
                    darkMode
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-600'
                }`}
            >
                Organik
            </span>
        );
    }
    const isExpired = new Date(member.kontrak_berakhir) < new Date();
    return (
        <span
            className={`text-[11px] font-bold ${isExpired ? 'text-red-400' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}
        >
            {new Date(member.kontrak_berakhir).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })}
            {member.sisa_hari_kontrak !== null &&
                member.sisa_hari_kontrak <= 60 && (
                    <span className="ml-1 text-[9px] text-orange-400 font-black">
                        ({member.sisa_hari_kontrak}h)
                    </span>
                )}
        </span>
    );
};

export const LoadingSpinner = ({ text = 'Memuat data...' }) => (
    <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">{text}</span>
    </div>
);

export const EmptyState = ({ message = 'Tidak ada data ditemukan.' }) => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600">
            <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
        </div>
        <p className="text-sm italic">{message}</p>
    </div>
);

export const Avatar = ({ nama, darkMode }) => {
    const initials = (nama || '?')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return (
        <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                darkMode
                    ? 'bg-slate-800 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
            }`}
        >
            {initials}
        </div>
    );
};

export const UtilBar = ({ value, darkMode }) => (
    <div className="w-24">
        <div className="text-[10px] font-bold mb-1 text-slate-300">
            {value}%
        </div>
        <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
        >
            <div
                className={`h-full transition-all duration-700 rounded-full ${
                    value > 90
                        ? 'bg-red-500'
                        : value > 75
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                }`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export const FormField = ({ label, children }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            {label}
        </label>
        {children}
    </div>
);

export const inputClass = (darkMode, disabled = false) =>
    `w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
        darkMode
            ? `bg-slate-800 border-slate-700 text-slate-200 ${disabled ? 'disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed' : ''}`
            : `bg-white border-slate-200 ${disabled ? 'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed' : ''}`
    }`;
