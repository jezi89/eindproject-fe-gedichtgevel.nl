/**
 * useUserStats Hook
 *
 * Fetches and manages user activity statistics
 * Provides formatted data for statistics dashboard
 *
 * @returns {Object} Statistics state and methods
 */

import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../auth/useAuth';
import {userStatsService} from '@/services/stats/userStatsService';

export function useUserStats() {
    const {user} = useAuth();
    const [stats, setStats] = useState({
        totalFavoritePoems: 0,
        totalFavoriteAuthors: 0,
        topAuthors: [],
        recentActivity: [],
        lastActivityDate: null
    });
    const [monthlyActivity, setMonthlyActivity] = useState([]);
    const [favoriteThemes, setFavoriteThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load stats on mount
    useEffect(() => {
        if (user?.id) {
            loadStats();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Load all statistics
     */
    const loadStats = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const [statsResult, monthlyResult, themesResult] = await Promise.all([
                userStatsService.getUserStats(user.id),
                userStatsService.getMonthlyActivity(user.id, 6),
                userStatsService.getFavoriteThemes(user.id)
            ]);

            if (statsResult.success) {
                setStats(statsResult.data);
            } else {
                throw new Error(statsResult.error);
            }

            if (monthlyResult.success) {
                setMonthlyActivity(monthlyResult.data);
            }

            if (themesResult.success) {
                setFavoriteThemes(themesResult.data);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    /**
     * Refresh statistics (useful after adding/removing favorites)
     */
    const refreshStats = useCallback(async () => {
        await loadStats();
    }, [loadStats]);

    /**
     * Get formatted summary for display
     */
    const getSummary = useCallback(() => {
        return {
            totalFavorites: stats.totalFavoritePoems + stats.totalFavoriteAuthors,
            mostFavoritedAuthor: stats.topAuthors[0]?.author || 'Geen data',
            lastActivity: stats.lastActivityDate
                ? new Date(stats.lastActivityDate).toLocaleDateString('nl-NL')
                : 'Geen activiteit',
            activeThisMonth: monthlyActivity[monthlyActivity.length - 1]?.count || 0
        };
    }, [stats, monthlyActivity]);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        stats,
        monthlyActivity,
        favoriteThemes,
        loading,
        error,

        // Methods
        loadStats,
        refreshStats,
        getSummary,
        clearError
    };
}
