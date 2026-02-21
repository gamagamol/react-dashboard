
export const supabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
    anonKey:
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
};

export const APP_CONFIG = {
    name: 'Dashboard Manage Operation SSO',
    subtitle: 'Service Desk and Operation',
    version: 'v2.5',
};

export const UNITS = [
    'Network Ops',
    'Cloud Infra',
    'Security Ops',
    'Database Management',
    'CATRINE'
];

export const STATUS_KEPEGAWAIAN = [
    'Organik',
    'Outsourcing - ISH',
    'Outsourcing - Koptel',
    'CRS',
];

export const SHIFT_OPTIONS = ['Pagi', 'Siang', 'Malam'];
export const MODE_KERJA_OPTIONS = ['Onsite', 'Hybrid', 'Remote'];

export const BEBAN_KERJA_WEIGHTS = {
    Critical: 4,
    High: 3,
    Balanced: 2,
    Low: 1,
};

export const BEBAN_KERJA_COLORS = {
    Critical: 'bg-red-500/10 text-red-400 border-red-500/30',
    High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    Balanced: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};
