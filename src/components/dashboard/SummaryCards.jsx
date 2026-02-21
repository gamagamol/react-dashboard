import React from 'react';
import { Users, UserCheck, Calendar, AlertTriangle } from 'lucide-react';

const CARDS = [
  {
    id: 'all',
    label: 'Total Personil',
    icon: Users,
    statKey: 'total',
    color: 'blue',
    desc: 'Semua data',
    activeBg: 'bg-blue-600 border-blue-500',
    hoverBorder: 'hover:border-blue-500/50',
    iconColor: 'text-blue-400',
  },
  {
    id: 'organik',
    label: 'Pegawai Organik',
    icon: UserCheck,
    statKey: 'organik',
    color: 'emerald',
    desc: 'Pegawai tetap',
    activeBg: 'bg-emerald-600 border-emerald-500',
    hoverBorder: 'hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'expiring',
    label: 'Kontrak Segera',
    icon: Calendar,
    statKey: 'kontrakSegera',
    color: 'orange',
    desc: 'Jatuh tempo H-60',
    activeBg: 'bg-orange-500 border-orange-400',
    hoverBorder: 'hover:border-orange-500/50',
    iconColor: 'text-orange-400',
  },
  {
    id: 'critical',
    label: 'Utilisasi Kritis',
    icon: AlertTriangle,
    statKey: 'criticalCount',
    color: 'red',
    desc: 'Beban > 90%',
    activeBg: 'bg-red-600 border-red-500',
    hoverBorder: 'hover:border-red-500/50',
    iconColor: 'text-red-400',
  },
];

export const SummaryCards = ({ stats, activeFilter, onToggleFilter, darkMode }) => {
  const dm = darkMode;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {CARDS.map((card) => {
        const isActive = activeFilter === card.id;
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            onClick={() => onToggleFilter(card.id)}
            className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
              isActive
                ? `${card.activeBg} text-white shadow-lg`
                : dm
                  ? `bg-slate-900 border-slate-800 ${card.hoverBorder}`
                  : `bg-white border-slate-100 ${card.hoverBorder}`
            }`}
          >
            {/* Background glow when active */}
            {isActive && (
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isActive ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {card.label}
                </span>
                <Icon
                  size={20}
                  className={isActive ? 'text-white/80' : card.iconColor}
                />
              </div>

              <div className="text-3xl font-black leading-none">
                {stats[card.statKey] ?? 0}
              </div>

              <p className={`text-[10px] mt-2 font-medium ${
                isActive ? 'text-white/60' : 'text-slate-500'
              }`}>
                {card.desc}
              </p>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-6 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};