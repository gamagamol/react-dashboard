import { supabase } from './supabaseClient.js';

/**
 * Login dengan email & password
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;

    return data;
};

/**
 * Logout
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Ambil session aktif
 */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

/**
 * Ambil role user dari tabel user_roles
 * @param {string} userId - UUID dari auth.users
 * @returns {'Admin' | 'Viewer'}
 */
export const getUserRole = (user) => {
    const metaRole = user?.user_metadata?.role;
    return metaRole === 'admin-dashboard' ? 'Admin' : 'Viewer';
};

/**
 * Subscribe ke perubahan auth state
 * @param {Function} callback - (session) => void
 * @returns unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => subscription.unsubscribe();
};
