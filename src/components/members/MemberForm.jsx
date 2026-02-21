import React, { useState } from 'react';
import { X, Eye, Edit2, Save, Loader2 } from 'lucide-react';
import { FormField, inputClass } from '../ui/index.jsx';
import {
    UNITS,
    STATUS_KEPEGAWAIAN,
    SHIFT_OPTIONS,
    MODE_KERJA_OPTIONS,
} from '../../config/supabase.jsx';

/**
 * @param {Object}   props
 * @param {'view'|'edit'|'add'} props.mode
 * @param {Object}   props.initialData
 * @param {boolean}  props.darkMode
 * @param {string}   props.role - 'Admin' | 'Viewer'
 * @param {boolean}  props.loading
 * @param {Function} props.onSubmit  - async (formData) => void
 * @param {Function} props.onClose
 * @param {Function} props.onSwitchToEdit - () => void
 */
export const MemberForm = ({
    mode,
    initialData,
    darkMode,
    role,
    loading = false,
    onSubmit,
    onClose,
    onSwitchToEdit,
}) => {
    const [formData, setFormData] = useState({
        ...initialData,
        spesialisasi: Array.isArray(initialData.spesialisasi)
            ? initialData.spesialisasi.join(', ')
            : initialData.spesialisasi || '',
    });

    const dm = darkMode;
    const isView = mode === 'view';
    const isAdd = mode === 'add';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            utilisasi: parseInt(formData.utilisasi) || 0,
            spesialisasi:
                typeof formData.spesialisasi === 'string'
                    ? formData.spesialisasi
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : formData.spesialisasi || [],
            kontrak_berakhir:
                formData.status_kepegawaian === 'Organik'
                    ? null
                    : formData.kontrak_berakhir || null,
        };
        await onSubmit(payload);
    };

    const ic = (disabled = false) => inputClass(dm, disabled);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div
                className={`rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden ${dm ? 'bg-slate-900' : 'bg-white'}`}
            >
                {/* Header */}
                <div
                    className={`px-7 py-5 border-b flex items-center justify-between ${dm ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                >
                    <div className="flex items-center gap-3">
                        {isView ? (
                            <Eye size={18} className="text-blue-400" />
                        ) : (
                            <Edit2 size={18} className="text-emerald-400" />
                        )}
                        <span
                            className={`text-xs font-bold uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                            {isView
                                ? 'Detail Profile'
                                : isAdd
                                  ? 'New Entry — Personil Baru'
                                  : 'Update Record'}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    className="p-7 max-h-[78vh] overflow-y-auto"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* NIK — selalu disabled */}
                        <FormField label="NIK">
                            <input
                                name="nik"
                                required
                                value={formData.nik || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="NIK"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Nama */}
                        <FormField label="Nama Lengkap">
                            <input
                                name="nama"
                                required
                                value={formData.nama || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Nama Lengkap"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Unit */}
                        <FormField label="Unit">
                            <select
                                name="unit"
                                value={formData.unit || UNITS[0]}
                                onChange={handleChange}
                                disabled={isView}
                                className={ic(isView)}
                            >
                                {UNITS.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Project */}
                        <FormField label="MO Project">
                            <input
                                name="project"
                                required
                                value={formData.project || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Nama Project"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Lokasi */}
                        <FormField label="Lokasi">
                            <input
                                name="lokasi"
                                required
                                value={formData.lokasi || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Kota"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Kontak */}
                        <FormField label="Kontak">
                            <input
                                name="kontak"
                                required
                                value={formData.kontak || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="08xxxxxxxxxx"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Status Kepegawaian */}
                        <FormField label="Status Kepegawaian">
                            <select
                                name="status_kepegawaian"
                                value={formData.status_kepegawaian || 'Organik'}
                                onChange={handleChange}
                                disabled={isView}
                                className={ic(isView)}
                            >
                                {STATUS_KEPEGAWAIAN.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Utilisasi */}
                        <FormField label="Utilisasi (%)">
                            <input
                                name="utilisasi"
                                type="number"
                                min="0"
                                max="100"
                                required
                                value={formData.utilisasi ?? 50}
                                onChange={handleChange}
                                disabled={isView}
                                className={`${ic(isView)} font-bold`}
                            />
                            {/* Preview beban */}
                            {!isView && (
                                <div className="mt-1.5 w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            parseInt(formData.utilisasi) > 90
                                                ? 'bg-red-500'
                                                : parseInt(formData.utilisasi) >
                                                    75
                                                  ? 'bg-orange-500'
                                                  : 'bg-blue-500'
                                        }`}
                                        style={{
                                            width: `${Math.min(parseInt(formData.utilisasi) || 0, 100)}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </FormField>

                        {/* Shift */}
                        <FormField label="Shift Kerja">
                            <select
                                name="shift"
                                value={formData.shift || 'Pagi'}
                                onChange={handleChange}
                                disabled={isView}
                                className={ic(isView)}
                            >
                                {SHIFT_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Mode Kerja */}
                        <FormField label="Mode Kerja">
                            <select
                                name="mode_kerja"
                                value={formData.mode_kerja || 'Onsite'}
                                onChange={handleChange}
                                disabled={isView}
                                className={ic(isView)}
                            >
                                {MODE_KERJA_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Akhir Kontrak — disabled jika Organik */}
                        <FormField label="Akhir Kontrak">
                            <input
                                name="kontrak_berakhir"
                                type="date"
                                value={formData.kontrak_berakhir || ''}
                                onChange={handleChange}
                                disabled={
                                    isView ||
                                    formData.status_kepegawaian === 'Organik'
                                }
                                className={ic(
                                    isView ||
                                        formData.status_kepegawaian ===
                                            'Organik',
                                )}
                            />
                            {formData.status_kepegawaian === 'Organik' &&
                                !isView && (
                                    <p className="text-[10px] text-slate-600 mt-1 italic">
                                        Tidak berlaku untuk pegawai Organik
                                    </p>
                                )}
                        </FormField>

                        {/* Spesialisasi — full width */}
                        <div className="md:col-span-2">
                            <FormField label="Spesialisasi (pisahkan dengan koma)">
                                <input
                                    name="spesialisasi"
                                    type="text"
                                    value={formData.spesialisasi || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    placeholder="Cisco, Fortigate, Mikrotik"
                                    className={ic(isView)}
                                />
                            </FormField>
                        </div>

                        {/* Info badges saat view mode */}
                        {isView && formData.beban_kerja && (
                            <div className="md:col-span-2">
                                <div
                                    className={`flex flex-wrap gap-4 p-4 rounded-2xl border ${dm ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <InfoItem
                                        label="Beban Kerja"
                                        value={formData.beban_kerja}
                                        dm={dm}
                                    />
                                    {formData.sisa_hari_kontrak !== undefined &&
                                        formData.sisa_hari_kontrak !== null && (
                                            <InfoItem
                                                label="Sisa Kontrak"
                                                value={`${formData.sisa_hari_kontrak} hari`}
                                                dm={dm}
                                            />
                                        )}
                                    {formData.status_kontrak && (
                                        <InfoItem
                                            label="Status Kontrak"
                                            value={formData.status_kontrak}
                                            dm={dm}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div
                        className={`mt-7 pt-6 border-t flex justify-end gap-3 ${dm ? 'border-slate-800' : 'border-slate-100'}`}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                dm
                                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {isView ? 'Tutup' : 'Batal'}
                        </button>

                        {isView && role === 'Admin' && (
                            <button
                                type="button"
                                onClick={onSwitchToEdit}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                        )}

                        {!isView && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />{' '}
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} /> Simpan
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const InfoItem = ({ label, value, dm }) => (
    <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
            {label}
        </div>
        <div
            className={`text-xs font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}
        >
            {value}
        </div>
    </div>
);
