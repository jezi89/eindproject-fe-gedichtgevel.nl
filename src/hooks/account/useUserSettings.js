/**
 * useUserSettings Hook
 *
 * Manages user account settings and preferences
 * Provides state management for profile, privacy, and account settings
 *
 * @returns {Object} Settings state and methods
 */

import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../auth/useAuth';
import {userSettingsService} from '@/services/settings/userSettingsService';

export function useUserSettings() {
    const {user} = useAuth();
    const [settings, setSettings] = useState({
        display_name: null,
        email_notifications: true,
        theme_preference: 'dark',
        updated_at: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load settings on mount
    useEffect(() => {
        if (user?.id) {
            loadSettings();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Load user settings from database
     */
    const loadSettings = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const result = await userSettingsService.getUserSettings(user.id);

            if (result.success) {
                setSettings(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Update settings
     */
    const updateSettings = useCallback(async (updates) => {
        if (!user?.id) {
            setError('Je moet ingelogd zijn om instellingen te wijzigen');
            return {success: false};
        }

        setSaveSuccess(false);
        setError(null);

        try {
            const result = await userSettingsService.updateUserSettings(user.id, updates);

            if (result.success) {
                setSettings(result.data);
                setSaveSuccess(true);
                // Auto-hide success message after 3 seconds
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            return {success: false, error: err.message};
        }
    }, [user?.id]);

    /**
     * Update display name
     */
    const updateDisplayName = useCallback(async (displayName) => {
        return await updateSettings({display_name: displayName});
    }, [updateSettings]);

    /**
     * Toggle email notifications
     */
    const toggleEmailNotifications = useCallback(async () => {
        const newValue = !settings.email_notifications;
        return await updateSettings({email_notifications: newValue});
    }, [settings.email_notifications, updateSettings]);

    /**
     * Update theme preference
     */
    const updateTheme = useCallback(async (theme) => {
        if (!['dark', 'light'].includes(theme)) {
            setError('Ongeldig thema gekozen');
            return {success: false};
        }
        return await updateSettings({theme_preference: theme});
    }, [updateSettings]);

    /**
     * Change password
     */
    const changePassword = useCallback(async (newPassword) => {
        setSaveSuccess(false);
        setError(null);

        try {
            const result = await userSettingsService.changePassword(newPassword);

            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            return {success: false, error: err.message};
        }
    }, []);

    /**
     * Delete account
     */
    const deleteAccount = useCallback(async () => {
        if (!user?.id) return {success: false};

        setError(null);

        try {
            const result = await userSettingsService.deleteUserAccount(user.id);

            if (!result.success) {
                setError(result.error);
            }

            return result;
        } catch (err) {
            setError(err.message);
            return {success: false, error: err.message};
        }
    }, [user?.id]);

    /**
     * Export user data
     */
    const exportData = useCallback(async () => {
        if (!user?.id) return {success: false};

        try {
            const result = await userSettingsService.exportUserData(user.id);

            if (result.success) {
                // Create downloadable JSON file
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `gedichtgevel-data-${new Date().toISOString()}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }

            return result;
        } catch (err) {
            setError(err.message);
            return {success: false, error: err.message};
        }
    }, [user?.id]);

    /**
     * Clear messages
     */
    const clearMessages = useCallback(() => {
        setError(null);
        setSaveSuccess(false);
    }, []);

    return {
        // State
        settings,
        loading,
        error,
        saveSuccess,

        // Methods
        loadSettings,
        updateSettings,
        updateDisplayName,
        toggleEmailNotifications,
        updateTheme,
        changePassword,
        deleteAccount,
        exportData,
        clearMessages
    };
}
