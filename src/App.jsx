import React, { useState, useEffect } from 'react';
import { useAuth } from './Hooks/useAuth.js';
import { LoginPage }    from './pages/Login.jsx';
import { DashboardPage } from './pages/Dashboard.jsx';
import { Loader2 } from 'lucide-react';

const App = () => {
  const { user, role, authReady } = useAuth();
  const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('theme') === 'dark');

  // Sync dark mode dengan DOM
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Loading saat auth belum siap
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-slate-600 text-xs font-medium tracking-widest uppercase">
          Menghubungkan...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardPage
      user={user}
      role={role}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((p) => !p)}
    />
  );
};

export default App;