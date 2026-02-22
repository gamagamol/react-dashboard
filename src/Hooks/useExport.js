// src/hooks/useExport.js
import { useEffect } from 'react';
import { fetchMembersForExport } from '../lib/membersApi.js';

// Load XLSX dari CDN
export const useXLSX = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
};

// Export ke CSV — pakai nama (bukan id)
export const exportToCSV = async () => {
  const rows = await fetchMembersForExport();
  if (!rows.length) { alert('Tidak ada data untuk di-export.'); return; }

  const headers = Object.keys(rows[0]);
  const content = [
    headers,
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`)),
  ].map((r) => r.join(',')).join('\n');

  triggerDownload(
    new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' }),
    `Report_SSO_${today()}.csv`
  );
};

// Export ke Excel — pakai nama (bukan id)
export const exportToExcel = async () => {
  if (!window.XLSX) { alert('XLSX library belum siap, coba lagi sebentar.'); return; }

  const rows = await fetchMembersForExport();
  if (!rows.length) { alert('Tidak ada data untuk di-export.'); return; }

  const headers = [
    'NIK', 'Nama', 'Unit', 'Project', 'Lokasi', 'Kontak',
    'Utilisasi', 'Status', 'Shift', 'Mode', 'Akhir_Kontrak',
    'Spesialisasi', 'Beban_Kerja',
  ];

  const wsData = [
    headers,
    ...rows.map((r) => headers.map((h) => r[h] ?? '')),
  ];

  const ws = window.XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 14 },
    { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 8  }, { wch: 10 },
    { wch: 14 }, { wch: 30 }, { wch: 12 },
  ];

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Members');
  window.XLSX.writeFile(wb, `Report_SSO_${today()}.xlsx`);
};

// Download template — kolom pakai nama bukan id
// Kolom Unit dan Status harus diisi dengan NAMA (bukan angka)
export const downloadTemplate = () => {
  if (!window.XLSX) { alert('XLSX library belum siap, coba lagi sebentar.'); return; }

  const templateData = [
    {
      NIK:           'IT2024001',
      Nama:          'Ahmad Subarjo',
      Unit:          'Network Ops',       // ← isi nama unit
      Project:       'MO Peruri',
      Lokasi:        'Jakarta',
      Kontak:        '08123456789',
      Utilisasi:     85,
      Status:        'Organik',           // ← isi nama status
      Shift:         'Pagi',
      Mode:          'Onsite',
      Akhir_Kontrak: '',
      Spesialisasi:  'Cisco, Fortigate',
    },
    {
      NIK:           'IT2024002',
      Nama:          'Siti Nurhaliza',
      Unit:          'Security Ops',
      Project:       'MO General',
      Lokasi:        'Bandung',
      Kontak:        '08198765432',
      Utilisasi:     95,
      Status:        'Outsourcing - ISH',
      Shift:         'Siang',
      Mode:          'Hybrid',
      Akhir_Kontrak: '2026-06-30',
      Spesialisasi:  'Firewall, SIEM',
    },
  ];

  const ws = window.XLSX.utils.json_to_sheet(templateData);

  // Tambah komentar / hint valid values di baris ke-4
  const hintRow = {
    NIK:           '← Unik, wajib diisi',
    Nama:          '← Nama lengkap',
    Unit:          'Pilihan: Network Ops | Cloud Infra | Security Ops | Database Management | CATRINE',
    Project:       '← Nama project',
    Lokasi:        '← Kota',
    Kontak:        '← No. HP',
    Utilisasi:     '← Angka 0-100',
    Status:        'Pilihan: Organik | Outsourcing - ISH | Outsourcing - Koptel | CRS',
    Shift:         'Pilihan: Pagi | Siang | Malam',
    Mode:          'Pilihan: Onsite | Hybrid | Remote',
    Akhir_Kontrak: '← Format: YYYY-MM-DD (kosongkan jika Organik)',
    Spesialisasi:  '← Pisahkan dengan koma',
  };
  window.XLSX.utils.sheet_add_json(ws, [hintRow], { skipHeader: true, origin: -1 });

  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 12 },
    { wch: 14 }, { wch: 10 }, { wch: 40 }, { wch: 10 }, { wch: 10 },
    { wch: 16 }, { wch: 30 },
  ];

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Template');
  window.XLSX.writeFile(wb, 'Template_Upload_MO_SSO.xlsx');
};

// Parse file Excel/CSV → array of objects
export const parseExcelFile = (file) =>
  new Promise((resolve, reject) => {
    if (!window.XLSX) { reject(new Error('XLSX library belum siap')); return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // defval: '' supaya cell kosong tidak undefined
        resolve(window.XLSX.utils.sheet_to_json(ws, { defval: '' }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsBinaryString(file);
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today        = () => new Date().toISOString().split('T')[0];
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
};