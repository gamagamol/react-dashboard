import React, { useState } from 'react';
import {
    Shield,
    Mail,
    KeyRound,
    AlertTriangle,
    Loader2,
    Lock,
} from 'lucide-react';
import { signIn } from '../lib/authApi.js';
import { APP_CONFIG } from '../config/supabase.jsx';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            // onAuthStateChange di useAuth akan otomatis menangani redirect
        } catch (err) {
            setError(
                err.message || 'Login gagal. Periksa email dan password Anda.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
                <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/4 rounded-full blur-3xl" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(148,163,184,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.5) 1px, transparent 1px)',
                        backgroundSize: '44px 44px',
                    }}
                />
            </div>

            {/* Animated orb */}
            <div className="absolute top-24 right-24 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse" />
            <div
                className="absolute bottom-32 left-32 w-2 h-2 bg-indigo-400 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: '1s' }}
            />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-500/30 mb-5">
                        <Shield size={30} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {APP_CONFIG.name}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        {APP_CONFIG.subtitle}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
                    <div className="mb-7">
                        <h2 className="text-slate-100 font-bold text-lg">
                            Masuk ke Dashboard
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">
                            Masukkan kredensial akun Anda
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} className="shrink-0" />{' '}
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    size={15}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sso.id"
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <KeyRound
                                    size={15}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />{' '}
                                    Memverifikasi...
                                </>
                            ) : (
                                <>
                                    <Lock size={15} /> Masuk
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-7 pt-6 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                            {APP_CONFIG.name} · {APP_CONFIG.version}
                        </p>
                    </div>
                </div>

                {/* Hint */}
                <p className="text-center text-[11px] text-slate-700 mt-4">
                    Hubungi administrator jika akun belum tersedia
                </p>
            </div>
        </div>
    );
};
