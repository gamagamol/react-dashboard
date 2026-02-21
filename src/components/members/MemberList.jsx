import React from 'react';
import { MoreVertical, MapPin, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import { SortIcon, BebanBadge, StatusKontrakBadge, LoadingSpinner, EmptyState, Avatar, UtilBar } from '../ui/index.jsx';

export const MemberList = ({
  members,
  loading,
  role,
  darkMode,
  sortConfig,
  onRequestSort,
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
}) => {
  const dm = darkMode;

  const columns = [
    { key: 'project',          label: 'MO Project',    sortable: true  },
    { key: 'lokasi',           label: 'Lokasi',         sortable: true  },
    { key: 'kontrak_berakhir', label: 'Akhir Kontrak', sortable: true  },
    { key: 'utilisasi',        label: 'Utilisasi',      sortable: true  },
    { key: 'beban_kerja',      label: 'Beban',          sortable: true  },
    { key: 'status_shift',     label: 'Status & Shift', sortable: false },
    { key: 'spesialisasi',     label: 'Spesialisasi',   sortable: false },
  ];

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className={`text-[11px] font-bold uppercase tracking-wider ${dm ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              {/* Nama & NIK */}
              <th className="px-6 py-4 whitespace-nowrap">Nama & NIK</th>

              {columns.map(({ key, label, sortable }) => (
                <th
                  key={key}
                  className={`px-6 py-4 whitespace-nowrap ${sortable ? 'cursor-pointer hover:text-blue-400 transition-colors' : ''}`}
                  onClick={sortable ? () => onRequestSort(key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {label}
                    {sortable && <SortIcon columnKey={key} sortConfig={sortConfig} />}
                  </div>
                </th>
              ))}

              {/* Aksi */}
              <th className="px-6 py-4 text-center print:hidden">Aksi</th>
            </tr>
          </thead>

          <tbody className={`divide-y text-sm ${dm ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {members.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  darkMode={dm}
                  role={role}
                  openMenuId={openMenuId}
                  onToggleMenu={onToggleMenu}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const MemberRow = ({ member, darkMode: dm, role, openMenuId, onToggleMenu, onView, onEdit, onDelete }) => (
  <tr className={`transition-colors ${dm ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
    {/* Nama & NIK */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <Avatar nama={member.nama} darkMode={dm} />
        <div>
          <div className="font-semibold text-sm">{member.nama}</div>
          <div className="text-[10px] text-slate-500 font-mono tracking-tight">{member.nik}</div>
        </div>
      </div>
    </td>

    {/* Project */}
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-tight ${
        dm ? 'bg-blue-900/20 text-blue-400 border-blue-900/40' : 'bg-blue-50 text-blue-700 border-blue-100'
      }`}>
        {member.project}
      </span>
    </td>

    {/* Lokasi */}
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <MapPin size={12} className="text-slate-600" /> {member.lokasi}
      </div>
    </td>

    {/* Akhir Kontrak */}
    <td className="px-6 py-4">
      <StatusKontrakBadge member={member} darkMode={dm} />
    </td>

    {/* Utilisasi */}
    <td className="px-6 py-4">
      <UtilBar value={member.utilisasi} darkMode={dm} />
    </td>

    {/* Beban Kerja */}
    <td className="px-6 py-4">
      <BebanBadge value={member.beban_kerja} />
    </td>

    {/* Status & Shift */}
    <td className="px-6 py-4">
      <div className={`text-[11px] font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
        {member.status_kepegawaian}
      </div>
      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
        <Clock size={10} /> Shift {member.shift} · {member.mode_kerja}
      </div>
    </td>

    {/* Spesialisasi */}
    <td className="px-6 py-4">
      <div className="flex flex-wrap gap-1 max-w-[180px]">
        {(member.spesialisasi || []).map((skill, idx) => (
          <span key={idx} className={`px-1.5 py-0.5 rounded text-[9px] border ${
            dm ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-200'
          }`}>
            {skill}
          </span>
        ))}
      </div>
    </td>

    {/* Aksi */}
    <td className="px-6 py-4 text-center relative print:hidden">
      <button
        onClick={(e) => { e.stopPropagation(); onToggleMenu(member.id); }}
        className={`p-2 rounded-lg transition-all ${
          dm ? 'text-slate-600 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {openMenuId === member.id && (
        <ContextMenu
          member={member}
          darkMode={dm}
          role={role}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </td>
  </tr>
);

const ContextMenu = ({ member, darkMode: dm, role, onView, onEdit, onDelete }) => (
  <div
    onClick={(e) => e.stopPropagation()}
    className={`absolute right-12 top-1/2 -translate-y-1/2 z-40 border rounded-xl shadow-xl py-2 w-44 text-left overflow-hidden ${
      dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}
  >
    <button
      onClick={() => onView(member)}
      className={`w-full px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors ${
        dm ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Eye size={14} className="text-blue-400" /> Detail View
    </button>

    {role === 'Admin' && (
      <>
        <button
          onClick={() => onEdit(member)}
          className={`w-full px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors ${
            dm ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Edit2 size={14} className="text-emerald-400" /> Edit Profile
        </button>
        <hr className={dm ? 'border-slate-700 my-1' : 'border-slate-100 my-1'} />
        <button
          onClick={() => onDelete(member.id)}
          className={`w-full px-4 py-2 text-xs font-semibold flex items-center gap-3 transition-colors text-red-400 ${
            dm ? 'hover:bg-red-950/30' : 'hover:bg-red-50'
          }`}
        >
          <Trash2 size={14} /> Delete Staff
        </button>
      </>
    )}
  </div>
);