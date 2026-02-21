import { useEffect } from 'react';

/**
 * Load XLSX library dari CDN
 */
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

/**
 * Export members ke file CSV
 */
export const exportToCSV = (members) => {
  const headers = [
    'NIK', 'Nama', 'Unit', 'Project', 'Lokasi', 'Kontak',
    'Utilisasi', 'Status', 'Shift', 'Mode Kerja',
    'Kontrak Berakhir', 'Spesialisasi', 'Beban Kerja',
  ];

  const rows = members.map((m) => [
    m.nik, m.nama, m.unit, m.project, m.lokasi, m.kontak,
    m.utilisasi, m.status_kepegawaian, m.shift, m.mode_kerja,
    m.kontrak_berakhir || 'Organik',
    (m.spesialisasi || []).join('; '),
    m.beban_kerja,
  ]);

  const content = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `Report_SSO_${today()}.csv`);
};

/**
 * Export members ke file Excel (.xlsx)
 */
export const exportToExcel = (members) => {
  if (!window.XLSX) {
    alert('XLSX library belum siap, coba lagi dalam 1–2 detik.');
    return;
  }

  const wsData = [
    ['NIK', 'Nama', 'Unit', 'Project', 'Lokasi', 'Kontak',
     'Utilisasi (%)', 'Status', 'Shift', 'Mode', 'Akhir Kontrak',
     'Spesialisasi', 'Beban Kerja', 'Sisa Hari Kontrak'],
    ...members.map((m) => [
      m.nik, m.nama, m.unit, m.project, m.lokasi, m.kontak,
      m.utilisasi, m.status_kepegawaian, m.shift, m.mode_kerja,
      m.kontrak_berakhir || '',
      (m.spesialisasi || []).join(', '),
      m.beban_kerja,
      m.sisa_hari_kontrak ?? 'N/A',
    ]),
  ];

  const ws = window.XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 14 },
    { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 8 }, { wch: 10 },
    { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 16 },
  ];

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Members');
  window.XLSX.writeFile(wb, `Report_SSO_${today()}.xlsx`);
};

/**
 * Download template Excel untuk bulk upload
 */
export const downloadTemplate = () => {
  if (!window.XLSX) {
    alert('XLSX library belum siap, coba lagi dalam 1–2 detik.');
    return;
  }

  const template = [
    {
      NIK: 'IT2024001',
      Nama: 'Ahmad Subarjo',
      Unit: 'Network Ops',
      Project: 'MO Peruri',
      Lokasi: 'Jakarta',
      Kontak: '08123456789',
      Utilisasi: 85,
      Status: 'Organik',
      Shift: 'Pagi',
      Mode: 'Onsite',
      Akhir_Kontrak: '',
      Spesialisasi: 'Cisco, Fortigate',
    },
    {
      NIK: 'IT2024002',
      Nama: 'Siti Nurhaliza',
      Unit: 'Security Ops',
      Project: 'MO General',
      Lokasi: 'Bandung',
      Kontak: '08198765432',
      Utilisasi: 95,
      Status: 'Outsourcing - ISH',
      Shift: 'Siang',
      Mode: 'Hybrid',
      Akhir_Kontrak: '2026-06-30',
      Spesialisasi: 'Firewall, SIEM',
    },
  ];

  const ws = window.XLSX.utils.json_to_sheet(template);
  ws['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 12 },
    { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 8 }, { wch: 10 },
    { wch: 14 }, { wch: 30 },
  ];

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Template');
  window.XLSX.writeFile(wb, 'Template_Upload_MO_SSO.xlsx');
};

/**
 * Parse file Excel/CSV ke array of objects
 */
export const parseExcelFile = (file) =>
  new Promise((resolve, reject) => {
    if (!window.XLSX) {
      reject(new Error('XLSX library belum siap'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(window.XLSX.utils.sheet_to_json(ws));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsBinaryString(file);
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};