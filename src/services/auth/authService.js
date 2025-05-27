import supabase from '../supabase/supabaseClient.js';

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

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} captchaToken - Optional captcha token
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */

/**
 * Logout user
 * @returns {Promise<{success: boolean, error?: string}>}
 */

/**
 * Get current session
 * @returns {Promise<{session: Object|null, error?: string}>}
 */

/**
 * Get current user
 * @returns {Promise<{user: Object|null, error?: string}>}
 */

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function for auth state changes
 * @returns {Function} Unsubscribe function
 */

/**
 * Refresh session token
 * @returns {Promise<{success: boolean, session?: Object, error?: string}>}
 */

/**
 * Check if a user with the given email already exists
 * @param {string} email - The email to check
 * @returns {Promise<{exists: boolean, error?: string}>}
 */

/**
 * Send password reset email
 * @param {string} email - The email to send reset link to
 * @returns {Promise<{success: boolean, error?: string}>}
 */

/**
 * Update user password after reset
 * @param {string} newPassword - The new password
 * @returns {Promise<{success: boolean, error?: string}>}
 */

/**
 * Create user profile after successful signup
 * @param {Object} user - The user object from Supabase auth
 * @param {Object} additionalData - Additional profile data
 * @returns {Promise<{success: boolean, error?: string}>}
 */

/**
 * Get user profile
 * @param {string} userId - The user ID
 * @returns {Promise<{profile: Object|null, error?: string}>}
 */

/**
 * Update user profile
 * @param {string} userId - The user ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */

/**
 * Default export for backward compatibility
 * This allows both named imports and default import
 */

/*
export default {
    register,
    login,
    logout,
    getSession,
    getCurrentUser,
    onAuthStateChange,
    refreshToken,
    checkUserExists,
    sendPasswordResetEmail,
    updatePassword,
    createUserProfile,
    getUserProfile,
    updateUserProfile
};*/
