/**
 * User Settings Service
 *
 * Manages user account settings and preferences
 * Handles profile updates, password changes, and account deletion
 *
 * @module services/settings/userSettingsService
 */

import {supabase} from '../supabase/supabase';
import {updatePassword as authUpdatePassword} from '../auth/authService';

// Helper for consistent error handling
const handleError = (operation, error) => {
    console.error(`${operation} error:`, error);
    return {success: false, error: error.message};
};

// Helper for successful responses
const handleSuccess = (data = null) => {
    return {success: true, ...(data && {data})};
};

/**
 * Get user settings
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const getUserSettings = async (userId) => {
    try {
        const {data, error} = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // No settings found - create default settings
            return await createDefaultSettings(userId);
        }

        if (error) throw error;

        return handleSuccess(data);
    } catch (error) {
        return handleError('Get user settings', error);
    }
};

/**
 * Create default settings for new user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const createDefaultSettings = async (userId) => {
    try {
        const defaultSettings = {
            id: userId,
            display_name: null,
            email_notifications: true,
            theme_preference: 'dark',
            updated_at: new Date().toISOString()
        };

        const {data, error} = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

        if (error) throw error;

        return handleSuccess(data);
    } catch (error) {
        return handleError('Create default settings', error);
    }
};

/**
 * Update user settings
 * @param {string} userId - User ID
 * @param {Object} updates - Settings to update
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const updateUserSettings = async (userId, updates) => {
    try {
        // Ensure user_settings record exists
        const existing = await getUserSettings(userId);
        if (!existing.success) {
            throw new Error('Failed to get or create user settings');
        }

        const {data, error} = await supabase
            .from('user_settings')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return handleSuccess(data);
    } catch (error) {
        return handleError('Update user settings', error);
    }
};

/**
 * Update display name
 * @param {string} userId - User ID
 * @param {string} displayName - New display name
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const updateDisplayName = async (userId, displayName) => {
    return await updateUserSettings(userId, {display_name: displayName});
};

/**
 * Update email notification preferences
 * @param {string} userId - User ID
 * @param {boolean} enabled - Enable/disable email notifications
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const updateEmailNotifications = async (userId, enabled) => {
    return await updateUserSettings(userId, {email_notifications: enabled});
};

/**
 * Update theme preference
 * @param {string} userId - User ID
 * @param {string} theme - Theme preference ('dark' | 'light')
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const updateThemePreference = async (userId, theme) => {
    if (!['dark', 'light'].includes(theme)) {
        return handleError('Update theme', new Error('Invalid theme preference'));
    }
    return await updateUserSettings(userId, {theme_preference: theme});
};

/**
 * Change user password
 * Uses authService for password update
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const changePassword = async (newPassword) => {
    try {
        const result = await authUpdatePassword(newPassword);
        return result;
    } catch (error) {
        return handleError('Change password', error);
    }
};

/**
 * Delete user account and all associated data
 * WARNING: This is irreversible
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteUserAccount = async (userId) => {
    try {
      // Supabase RLS and CASCADE will handle deletion of related records
      // (favorites, settings, etc. if properly configured in DB)

      // Use RPC function to delete user account securely
      // The 'delete_user_account' function must be defined in Supabase
      const { error } = await supabase.rpc("delete_user_account", {
        user_id: userId,
      });

      if (error) throw error;

      return handleSuccess();
    } catch (error) {
        return handleError('Delete user account', error);
    }
};

/**
 * Export user data (GDPR compliance)
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
const exportUserData = async (userId) => {
    try {
        // Get all user data from different tables
        const [settings, favoritePoems, favoriteAuthors] = await Promise.all([
            supabase.from('user_settings').select('*').eq('id', userId).single(),
            supabase.from('user_favorite_poems').select('*').eq('user_id', userId),
            supabase.from('user_favorite_authors').select('*').eq('user_id', userId)
        ]);

        const exportData = {
            user_id: userId,
            exported_at: new Date().toISOString(),
            settings: settings.data || null,
            favorite_poems: favoritePoems.data || [],
            favorite_authors: favoriteAuthors.data || []
        };

        return handleSuccess(exportData);
    } catch (error) {
        return handleError('Export user data', error);
    }
};

export const userSettingsService = {
    getUserSettings,
    updateUserSettings,
    updateDisplayName,
    updateEmailNotifications,
    updateThemePreference,
    changePassword,
    deleteUserAccount,
    exportUserData
};
