// src/hooks/useLookup.js
// Lookup tables: units & status_pegawai
// Data ini relatif statis — di-fetch sekali saat komponen mount
// Kalau admin tambah unit/status baru, user perlu refresh halaman
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export const useLookup = () => {
  const [units,         setUnits]         = useState([]);
  const [statusPegawai, setStatusPegawai] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [u, sp] = await Promise.all([
          supabase.from('units').select('id, nama').order('id'),
          supabase.from('status_pegawai').select('id, nama').order('id'),
        ]);

        if (u.error)  console.error('fetch units error:', u.error);
        if (sp.error) console.error('fetch status_pegawai error:', sp.error);

        setUnits(u.data   || []);
        setStatusPegawai(sp.data || []);
      } catch (err) {
        console.error('useLookup error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { units, statusPegawai, loading };
};