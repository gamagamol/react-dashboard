// src/components/members/MemberForm.jsx
import React, { useState } from 'react';
import { X, Eye, Edit2, Save, Loader2 } from 'lucide-react';
import { FormField, inputClass } from '../ui/index.jsx';
import {
    SHIFT_OPTIONS,
    MODE_KERJA_OPTIONS,
    BEBAN_KERJA_COLORS,
} from '../../config/supabase.jsx';

export const MemberForm = ({
    mode,
    initialData,
    darkMode,
    role,
    loading = false,
    onSubmit,
    onClose,
    onSwitchToEdit,
    units = [], 
    statusPegawai = [], 
}) => {
    const [form, setForm] = useState({
        ...initialData,
        spesialisasi: Array.isArray(initialData.spesialisasi)
            ? initialData.spesialisasi.join(', ')
            : initialData.spesialisasi || '',
    });

    const dm = darkMode;
    const isView = mode === 'view';
    const isAdd = mode === 'add';
    const ic = (dis = false) => inputClass(dm, dis);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const selectedStatusNama =
        statusPegawai.find((s) => s.id === parseInt(form.status_pegawai_id))
            ?.nama || '';
    const isOrganik = selectedStatusNama.toLowerCase() === 'organik';

    const handleSubmit = async (e) => {
        e.preventDefault();

        const unitNama =
            units.find((u) => u.id === parseInt(form.unit_id))?.nama || '';
        const statusNama =
            statusPegawai.find((s) => s.id === parseInt(form.status_pegawai_id))
                ?.nama || '';

        const payload = {
            nik: form.nik,
            nama: form.nama,
            unit_id: parseInt(form.unit_id),
            project: form.project,
            lokasi: form.lokasi,
            kontak: form.kontak,
            utilisasi: parseInt(form.utilisasi) || 0,
            status_pegawai_id: parseInt(form.status_pegawai_id),
            shift: form.shift || 'Pagi',
            mode_kerja: form.mode_kerja || 'Onsite',
            kontrak_berakhir: isOrganik ? null : form.kontrak_berakhir || null,
            spesialisasi:
                typeof form.spesialisasi === 'string'
                    ? form.spesialisasi
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : form.spesialisasi || [],
            // untuk normalizeRow di response
            unit_nama: unitNama,
            status_nama: statusNama,
        };

        await onSubmit(payload);
    };

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
                                  ? 'Tambah Personil Baru'
                                  : 'Update Data Personil'}
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
                        {/* NIK - free form, tidak disabled */}
                        <FormField label="NIK">
                            <input
                                name="nik"
                                required
                                value={form.nik || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Contoh: IT2024001"
                                className={`${ic(isView)} font-mono`}
                            />
                        </FormField>

                        {/* Nama */}
                        <FormField label="Nama Lengkap">
                            <input
                                name="nama"
                                required
                                value={form.nama || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Nama Lengkap"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Unit — dropdown dari DB */}
                        <FormField label="Unit">
                            {isView ? (
                                <div
                                    className={`${ic(true)} flex items-center`}
                                >
                                    {form.unit_nama || '-'}
                                </div>
                            ) : (
                                <select
                                    name="unit_id"
                                    required
                                    value={form.unit_id || ''}
                                    onChange={handleChange}
                                    className={ic()}
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </FormField>

                        {/* Project */}
                        <FormField label="MO Project">
                            <input
                                name="project"
                                required
                                value={form.project || ''}
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
                                value={form.lokasi || ''}
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
                                value={form.kontak || ''}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="08xxxxxxxxxx"
                                className={ic(isView)}
                            />
                        </FormField>

                        {/* Status Kepegawaian — dropdown dari DB */}
                        <FormField label="Status Kepegawaian">
                            {isView ? (
                                <div
                                    className={`${ic(true)} flex items-center`}
                                >
                                    {form.status_nama || '-'}
                                </div>
                            ) : (
                                <select
                                    name="status_pegawai_id"
                                    required
                                    value={form.status_pegawai_id || ''}
                                    onChange={handleChange}
                                    className={ic()}
                                >
                                    <option value="">-- Pilih Status --</option>
                                    {statusPegawai.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </FormField>

                        {/* Utilisasi */}
                        <FormField label="Utilisasi (%)">
                            <input
                                name="utilisasi"
                                type="number"
                                min="0"
                                max="100"
                                required
                                value={form.utilisasi ?? 50}
                                onChange={handleChange}
                                disabled={isView}
                                className={`${ic(isView)} font-bold`}
                            />
                            {!isView && (
                                <div className="mt-1.5 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            parseInt(form.utilisasi) > 90
                                                ? 'bg-red-500'
                                                : parseInt(form.utilisasi) > 75
                                                  ? 'bg-orange-500'
                                                  : 'bg-blue-500'
                                        }`}
                                        style={{
                                            width: `${Math.min(parseInt(form.utilisasi) || 0, 100)}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </FormField>

                        {/* Shift */}
                        <FormField label="Shift Kerja">
                            <select
                                name="shift"
                                value={form.shift || 'Pagi'}
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
                                value={form.mode_kerja || 'Onsite'}
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

                        {/* Akhir Kontrak */}
                        <FormField label="Akhir Kontrak">
                            <input
                                name="kontrak_berakhir"
                                type="date"
                                value={form.kontrak_berakhir || ''}
                                onChange={handleChange}
                                disabled={isView || isOrganik}
                                className={ic(isView || isOrganik)}
                            />
                            {isOrganik && !isView && (
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                    Tidak berlaku untuk pegawai Organik
                                </p>
                            )}
                        </FormField>

                        {/* Spesialisasi */}
                        <div className="md:col-span-2">
                            <FormField label="Spesialisasi (pisahkan dengan koma)">
                                <input
                                    name="spesialisasi"
                                    type="text"
                                    value={form.spesialisasi || ''}
                                    onChange={handleChange}
                                    disabled={isView}
                                    placeholder="Cisco, Fortigate, Mikrotik"
                                    className={ic(isView)}
                                />
                            </FormField>
                        </div>

                        {/* Info tambahan saat view */}
                        {isView && (
                            <div className="md:col-span-2">
                                <div
                                    className={`grid grid-cols-3 gap-4 p-4 rounded-2xl border ${dm ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <InfoItem label="Beban Kerja" dm={dm}>
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${BEBAN_KERJA_COLORS[form.beban_kerja] || ''}`}
                                        >
                                            {form.beban_kerja || '-'}
                                        </span>
                                    </InfoItem>
                                    <InfoItem
                                        label="Dibuat"
                                        value={
                                            form.created_at
                                                ? new Date(
                                                      form.created_at,
                                                  ).toLocaleDateString('id-ID')
                                                : '-'
                                        }
                                        dm={dm}
                                    />
                                    <InfoItem
                                        label="Diupdate"
                                        value={
                                            form.updated_at
                                                ? new Date(
                                                      form.updated_at,
                                                  ).toLocaleDateString('id-ID')
                                                : '-'
                                        }
                                        dm={dm}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div
                        className={`mt-7 pt-6 border-t flex justify-end gap-3 ${dm ? 'border-slate-800' : 'border-slate-100'}`}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {isView ? 'Tutup' : 'Batal'}
                        </button>
                        {isView && role === 'Admin' && (
                            <button
                                type="button"
                                onClick={onSwitchToEdit}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                            >
                                <Edit2 size={16} /> Edit
                            </button>
                        )}
                        {!isView && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
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

const InfoItem = ({ label, value, dm, children }) => (
    <div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            {label}
        </div>
        {children || (
            <div
                className={`text-xs font-bold ${dm ? 'text-slate-300' : 'text-slate-700'}`}
            >
                {value || '-'}
            </div>
        )}
    </div>
);
