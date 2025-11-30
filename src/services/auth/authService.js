/**
 * Authentication Service
 *
 * This service provides pure functions for Supabase authentication operations.
 * It serves as a thin wrapper around Supabase client with consistent error handling.
 *
 * Architecture Role:
 * - Pure JavaScript functions (no React dependencies)
 * - Can be used in any JavaScript environment (client, server, workers)
 * - Handles all direct Supabase auth operations
 * - Provides consistent response format
 * - Used by React hooks (useSupabaseAuth) for UI integration
 *
 * Design Pattern: Functional Module Pattern
 * - Each function is independent and stateless
 * - Consistent error handling across all functions
 * - Easy to test and mock
 */

import {supabase} from '../supabase/supabase';

// Helper function for consistent error handling
const handleAuthError = (operation, error) => {
    console.error(`${operation} error:`, error);
    return {success: false, error: error.message};
};

// Helper function for successful responses
const handleAuthSuccess = (data = null) => {
    return {success: true, ...(data && {data})};
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} captchaToken - Optional captcha token
 * @param {Object} profileData - Additional profile data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */

// TODO Checken of profiledata paramtere gebruikt moet worden
const register = async (email, password, captchaToken = null) => {

    // Todo captcha token implementeren en checken of het nu modulair is
    try {
        const options = {}
        if (captchaToken) {
            options.captcha_token = captchaToken;
        }

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                ...options,
                // TODO: Check and test email confirmation
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            // Supabase returns specific error codes for existing users
            // TODO Check if double check nodig is
            if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
                throw new Error('Een account met dit e-mailadres bestaat al. Probeer in te loggen.');
            }
            throw error;
        }

        // Automatically create user profile by database trigger

        return handleAuthSuccess(data);
    } catch (error) {
        return handleAuthError('Registration', error);
    }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} captchaToken - Optional captcha token
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */

// Maak login een interne functie, geen export
const login = async (email, password, captchaToken = null) => {
    try {
        const authOptions = {};
        if (captchaToken) {
            authOptions.captcha_token = captchaToken;
        }

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
            // Expression to only include options if they are provided, by checking if the object contains at least one key and using a spread operator to conditionally add the options property
            ...(Object.keys(authOptions).length > 0 ? {options: authOptions} : {})
        });

        if (error) {
            throw error;
        }

        return handleAuthSuccess(data);
    } catch (error) {
        return handleAuthError('Login', error);
    }

};

/**
 * Logout user
 * @returns {Promise<{success: boolean, error?: string}>}
 */

const logout = async () => {
    try {
        const {error} = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        return handleAuthSuccess();
    } catch (error) {
        return handleAuthError('Logout', error);
    }
};


/**
 * Get current session
 * @returns {Promise<{session: Object|null, error?: string}>}
 */

const getSession = async () => {
    try {
        const {data: {session}, error} = await supabase.auth.getSession();
        if (error) {
            throw error;
        }
        return handleAuthSuccess(session);
    } catch (error) {
        return handleAuthError('Get Session', error);
    }
};

/**
 * Get current user
 * @returns {Promise<{user: Object|null, error?: string}>}
 */

const getCurrentUser = async () => {
    try {
        const {data, error} = await supabase.auth.getUser();
        if (error) throw error;
        return {user: data.user};
    } catch (error) {
        console.error('Get user error:', error);
        return {user: null, error: error.message};
    }
};


/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function for auth state changes
 * @returns {Function} Unsubscribe function
 */

const onAuthStateChange = (callback) => {
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session);
        }
    );

    return () => subscription.unsubscribe();
};

/**
 * Refresh session token
 * @returns {Promise<{success: boolean, session?: Object, error?: string}>}
 */

const refreshToken = async () => {
    try {
        const {data, error} = await supabase.auth.refreshSession();
        if (error) throw error;
        return {success: true, session: data.session};
    } catch (error) {
        return handleAuthError('Token refresh', error);
    }
};

/**
 * Check if a user with the given email already exists
 * @param {string} email - The email to check
 * @returns {Promise<{exists: boolean, error?: string}>}
 */

const checkUserExists = async (email) => {
    try {
        const {data, error} = await supabase
            .from('profile')
            .select('id')
            .eq('email', email)
            .single();

        if (error && error.code === 'PGRST116') {
            return {exists: false};
        }

        if (error) throw error;

        return {exists: !!data};
    } catch (error) {
        console.error('Error checking user existence:', error);
        return {exists: false, error: error.message};
    }
};


/**
 * Send password reset email
 * @param {string} email - The email to send reset link to
 * @returns {Promise<{success: boolean, error?: string}>}
 */

const sendPasswordResetEmail = async (email) => {
    try {
        const {error} = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        return handleAuthSuccess();
    } catch (error) {
        return handleAuthError('Password reset', error);
    }
};

/**
 * Update user password after reset
 * @param {string} newPassword - The new password
 * @returns {Promise<{success: boolean, error?: string}>}
 */

const updatePassword = async (newPassword) => {
    try {
        const {error} = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return handleAuthSuccess();
    } catch (error) {
        return handleAuthError('Password update', error);
    }
};





/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */


// updateUser als wrapper blijft als named export
const updateUser = async (updates) => {
    if (updates.password) {
        return updatePassword(updates.password);
    }
    // TODO: Voor andere updates, implementatie toevoegen
    return updatePassword(updates.password);
};

/**
 * Sign in with an OAuth provider
 * @param {('google'|'github'|'facebook')} provider - The OAuth provider
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const signInWithProvider = async (provider) => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
        });
        if (error) {
            throw error;
        }
        return handleAuthSuccess();
    } catch (error) {
        return handleAuthError(`Sign in with ${provider}`, error);
    }
};

export {
    getSession,
    onAuthStateChange,
    refreshToken as refreshSession,
    register,
    sendPasswordResetEmail as resetPasswordForEmail,
    login as signInWithPassword,
    signInWithProvider,
    logout,
    updateUser,
    updatePassword,
    checkUserExists,
    getCurrentUser
};
