/**
 * useCanvasStorage Hook
 *
 * React hook for managing canvas design storage operations.
 * Provides loading states, error handling, and user feedback.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import {
    saveDesign,
    loadDesign,
    listUserDesigns,
    deleteDesign,
    updateDesignMetadata,
    duplicateDesign
} from '../../services/canvas/canvasStorageService';

export function useCanvasStorage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [designs, setDesigns] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    /**
     * Save current canvas design
     */
    const save = useCallback(async (poemData, canvasState, title = null, designId = null) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs op te slaan');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await saveDesign(user.id, poemData, canvasState, title, designId);

            if (!result.success) {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to save design';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Load a design by ID
     */
    const load = useCallback(async (designId) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs te laden');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await loadDesign(designId, user.id);

            if (!result.success) {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to load design';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * List user's designs
     */
    const list = useCallback(async (options = {}) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs te bekijken');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await listUserDesigns(user.id, options);

            if (result.success) {
                setDesigns(result.data);
                setTotalCount(result.count);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to list designs';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Delete a design
     */
    const remove = useCallback(async (designId) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs te verwijderen');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await deleteDesign(designId, user.id);

            if (result.success) {
                // Remove from local state
                setDesigns(prev => prev.filter(d => d.id !== designId));
                setTotalCount(prev => Math.max(0, prev - 1));
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to delete design';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Update design metadata
     */
    const updateMetadata = useCallback(async (designId, updates) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs te bewerken');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await updateDesignMetadata(designId, user.id, updates);

            if (result.success) {
                // Update local state
                setDesigns(prev =>
                    prev.map(d => d.id === designId ? { ...d, ...updates } : d)
                );
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to update design';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Duplicate a design
     */
    const duplicate = useCallback(async (designId, newTitle = null) => {
        if (!user) {
            setError('Je moet ingelogd zijn om designs te dupliceren');
            return { success: false, error: 'Not authenticated' };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await duplicateDesign(designId, user.id, newTitle);

            if (result.success) {
                // Add to local state
                setDesigns(prev => [result.data, ...prev]);
                setTotalCount(prev => prev + 1);
            } else {
                setError(result.error);
            }

            return result;
        } catch (err) {
            const errorMsg = err.message || 'Failed to duplicate design';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        isLoading,
        error,
        designs,
        totalCount,
        isAuthenticated: !!user,

        // Actions
        save,
        load,
        list,
        remove,
        updateMetadata,
        duplicate,
        clearError
    };
}
