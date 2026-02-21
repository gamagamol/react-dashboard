import React from 'react';
import { Search, Filter } from 'lucide-react';
import { UNITS } from '../../config/supabase.jsx';

export const TableToolbar = ({
    searchTerm,
    onSearchChange,
    filterUnit,
    onFilterUnitChange,
    darkMode,
    totalShown,
    totalAll,
}) => {
    const dm = darkMode;

    return (
        <div
            className={`px-6 py-4 border-b flex flex-col xl:flex-row justify-between gap-4 items-start xl:items-center ${
                dm ? 'border-slate-800' : 'border-slate-100'
            }`}
        >
            {/* Search */}
            <div className="relative flex-1 max-w-xl w-full">
                <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                    type="text"
                    placeholder="Cari Nama, NIK, Project, Spesialisasi..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        dm
                            ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600'
                            : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Unit Filter */}
                <div className="relative">
                    <Filter
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <select
                        value={filterUnit}
                        onChange={(e) => onFilterUnitChange(e.target.value)}
                        className={`appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${
                            dm
                                ? 'bg-slate-800 border-slate-700 text-slate-200'
                                : 'bg-white border-slate-200 text-slate-700'
                        }`}
                    >
                        <option value="All">Semua Unit</option>
                        {UNITS.map((u) => (
                            <option key={u} value={u}>
                                {u}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Count indicator */}
                <div
                    className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                        dm
                            ? 'bg-slate-800 border-slate-700 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                >
                    {totalShown} / {totalAll}
                </div>
            </div>
        </div>
    );
};
