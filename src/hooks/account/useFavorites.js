/**
 * useFavorites Hook
 *
 * Manages user favorites (poems and authors)
 * Provides state management and CRUD operations for favorites
 *
 * @returns {Object} Favorites state and methods
 */

import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../auth/useAuth';
import {favoritesService} from '@/services/favorites/favoritesService';

export function useFavorites() {
    const {user} = useAuth();
    const [favoritePoems, setFavoritePoems] = useState([]);
    const [favoriteAuthors, setFavoriteAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load favorites on mount
    useEffect(() => {
        if (user?.id) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Load all favorites from database
     */
    const loadFavorites = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const [poemsResult, authorsResult] = await Promise.all([
                favoritesService.getFavoritePoems(user.id),
                favoritesService.getFavoriteAuthors(user.id)
            ]);

            if (poemsResult.success) {
                setFavoritePoems(poemsResult.data);
            } else {
                throw new Error(poemsResult.error);
            }

            if (authorsResult.success) {
                setFavoriteAuthors(authorsResult.data);
            } else {
                throw new Error(authorsResult.error);
            }
        } catch (err) {
            console.error('Failed to load favorites:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Add a poem to favorites
     */
    const addPoem = useCallback(async (poem) => {
        if (!user?.id) {
            setError('Je moet ingelogd zijn om favorieten toe te voegen');
            return {success: false, error: 'Not authenticated'};
        }

        const result = await favoritesService.addFavoritePoem(user.id, poem);

        if (result.success) {
            setFavoritePoems(prev => [result.data, ...prev]);
        } else {
            setError(result.error);
        }

        return result;
    }, [user?.id]);

    /**
     * Remove a poem from favorites
     */
    const removePoem = useCallback(async (poemId) => {
        if (!user?.id) return {success: false};

        const result = await favoritesService.removeFavoritePoem(user.id, poemId);

        if (result.success) {
            setFavoritePoems(prev => prev.filter(poem => poem.id !== poemId));
        } else {
            setError(result.error);
        }

        return result;
    }, [user?.id]);

    /**
     * Check if a poem is favorited
     */
    const isPoemFavorited = useCallback(async (poemTitle, poemAuthor) => {
        if (!user?.id) return {isFavorited: false};

        return await favoritesService.checkPoemFavorited(user.id, poemTitle, poemAuthor);
    }, [user?.id]);

    /**
     * Add an author to favorites
     */
    const addAuthor = useCallback(async (authorName) => {
        if (!user?.id) {
            setError('Je moet ingelogd zijn om favorieten toe te voegen');
            return {success: false, error: 'Not authenticated'};
        }

        const result = await favoritesService.addFavoriteAuthor(user.id, authorName);

        if (result.success) {
            setFavoriteAuthors(prev => [result.data, ...prev]);
        } else {
            setError(result.error);
        }

        return result;
    }, [user?.id]);

    /**
     * Remove an author from favorites
     */
    const removeAuthor = useCallback(async (authorId) => {
        if (!user?.id) return {success: false};

        const result = await favoritesService.removeFavoriteAuthor(user.id, authorId);

        if (result.success) {
            setFavoriteAuthors(prev => prev.filter(author => author.id !== authorId));
        } else {
            setError(result.error);
        }

        return result;
    }, [user?.id]);

    /**
     * Check if an author is favorited
     */
    const isAuthorFavorited = useCallback(async (authorName) => {
        if (!user?.id) return {isFavorited: false};

        return await favoritesService.checkAuthorFavorited(user.id, authorName);
    }, [user?.id]);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        favoritePoems,
        favoriteAuthors,
        loading,
        error,

        // Poem methods
        addPoem,
        removePoem,
        isPoemFavorited,

        // Author methods
        addAuthor,
        removeAuthor,
        isAuthorFavorited,

        // Utility methods
        loadFavorites,
        clearError
    };
}
