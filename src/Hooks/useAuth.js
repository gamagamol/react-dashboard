import { useState, useEffect } from 'react';
import { getSession, getUserRole, onAuthStateChange } from '../lib/authApi.js';

export const useAuth = () => {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState('Viewer');
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        getSession().then((s) => {
            setSession(s);
            if (s?.user) setRole(getUserRole(s.user));
            setAuthReady(true);
        });

        const unsubscribe = onAuthStateChange((s) => {
            setSession(s);
            if (s?.user) {
                setRole(getUserRole(s.user));
            } else {
                setRole('Viewer');
            }
        });

        return unsubscribe;
    }, []);

    return {
        session,
        user: session?.user ?? null,
        role,
        authReady,
    };
};
