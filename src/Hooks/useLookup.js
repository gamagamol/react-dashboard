import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export const useLookup = () => {
  const [units,         setUnits]         = useState([]);
  const [statusPegawai, setStatusPegawai] = useState([]);
  const [bebanKerja,    setBebanKerja]    = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [u, sp, bk] = await Promise.all([
        supabase.from('units').select('*').order('id'),
        supabase.from('status_pegawai').select('*').order('id'),
        supabase.from('beban_kerja').select('*').order('bobot'),
      ]);

      if (u.data)  setUnits(u.data);
      if (sp.data) setStatusPegawai(sp.data);
      if (bk.data) setBebanKerja(bk.data);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const getUnitNama         = (id) => units.find((u)  => u.id === id)?.nama || '-';
  const getStatusNama       = (id) => statusPegawai.find((s) => s.id === id)?.nama || '-';
  const getBebanKerjaNama   = (id) => bebanKerja.find((b)  => b.id === id)?.nama || '-';
  const getBebanKerjaBobot  = (id) => bebanKerja.find((b)  => b.id === id)?.bobot || 0;

  const getUnitId           = (nama) => units.find((u)  => u.nama === nama)?.id || null;
  const getStatusId         = (nama) => statusPegawai.find((s) => s.nama === nama)?.id || null;
  const getBebanKerjaId     = (nama) => bebanKerja.find((b)  => b.nama === nama)?.id || null;

  return {
    units,
    statusPegawai,
    bebanKerja,
    loading,
    getUnitNama,
    getStatusNama,
    getBebanKerjaNama,
    getBebanKerjaBobot,
    getUnitId,
    getStatusId,
    getBebanKerjaId,
  };
};