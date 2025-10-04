/**
 * useUserSettings Hook
 *
 * Manages user account settings and preferences
 * Provides state management for profile, privacy, and account settings
 *
 * @returns {Object} Settings state and methods
 */

import {useCallback, useState} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {useAuth} from '../auth/useAuth';
import {userSettingsService} from '@/services/settings/userSettingsService';
import { supabaseApiService } from '../../services/api/apiService';

export function useUserSettings() {
    const {user} = useAuth();
    const queryClient = useQueryClient();

    const { data: settings, isLoading: loading, error } = useQuery({
        queryKey: ['userSettings', user?.id],
        queryFn: () => supabaseApiService.getUserSettings(user.id),
        enabled: !!user?.id,
    });

    const [saveSuccess, setSaveSuccess] = useState(false);

    const { mutateAsync: updateSettingsMutation } = useMutation({
        mutationFn: (updates) => userSettingsService.updateUserSettings(user.id, updates),
        onSuccess: (result) => {
            if (result.success) {
                queryClient.setQueryData(['userSettings', user?.id], result.data);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        }
    });

    const updateSettings = useCallback(async (updates) => {
        if (!user?.id) {
            return {success: false, error: 'Je moet ingelogd zijn om instellingen te wijzigen'};
        }
        return await updateSettingsMutation(updates);
    }, [user?.id, updateSettingsMutation]);


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
    }, [settings, updateSettings]);

    /**
     * Update theme preference
     */
    const updateTheme = useCallback(async (theme) => {
        if (!['dark', 'light'].includes(theme)) {
            return {success: false, error: 'Ongeldig thema gekozen'};
        }
        return await updateSettings({theme_preference: theme});
    }, [updateSettings]);

    /**
     * Change password
     */
    const changePassword = useCallback(async (newPassword) => {
        setSaveSuccess(false);

        try {
            const result = await userSettingsService.changePassword(newPassword);

            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }

            return result;
        } catch (err) {
            return {success: false, error: err.message};
        }
    }, []);

    /**
     * Delete account
     */
    const deleteAccount = useCallback(async () => {
        if (!user?.id) return {success: false};

        try {
            const result = await userSettingsService.deleteUserAccount(user.id);
            return result;
        } catch (err) {
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
            return {success: false, error: err.message};
        }
    }, [user?.id]);

    /**
     * Clear messages
     */
    const clearMessages = useCallback(() => {
        setSaveSuccess(false);
    }, []);

    return {
        // State
        settings,
        loading,
        error,
        saveSuccess,

        // Methods
        loadSettings: () => queryClient.invalidateQueries(['userSettings', user?.id]),
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