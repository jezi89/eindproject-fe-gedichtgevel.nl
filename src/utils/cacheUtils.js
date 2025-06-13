import apiCacheService from '@/services/cache/apiCacheService.js';
import searchCacheService from '@/services/cache/searchCacheService';

/**
 * Cache Utilities
 * Helper functions for monitoring and managing cache performance
 */

/**
 * Get comprehensive cache statistics
 * @returns {Promise<Object>} Combined cache statistics
 */
export async function getCacheStats() {
    try {
        const [apiStats, searchStats] = await Promise.all([
            apiCacheService.getStats(),
            searchCacheService.getStats()
        ]);

        return {
            api: apiStats,
            search: searchStats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to get cache stats:', error);
        return {
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Log cache performance to console
 */
export async function logCachePerformance() {
    const stats = await getCacheStats();

    console.group('🚀 Cache Performance Report');

    if (stats.error) {
        console.error('❌ Error getting stats:', stats.error);
        console.groupEnd();
        return;
    }

    // API Cache Stats
    console.group('📡 API Cache (L1/L2 Hierarchy)');
    console.log(`L1 Hit Rate: ${stats.api.l1HitRate}`);
    console.log(`L2 Hit Rate: ${stats.api.l2HitRate}`);
    console.log(`Total Hit Rate: ${stats.api.totalHitRate}`);
    console.log(`Memory Cache Size: ${stats.api.memoryCacheSize} entries`);
    console.log(`Total Requests: ${stats.api.total}`);
    console.groupEnd();

    // Search Cache Stats
    console.group('🔍 Search Cache (Persistent)');
    console.log(`Persistent Entries: ${stats.search.searchCacheEntries}`);
    console.log(`Context Entries: ${stats.search.contextEntries}`);
    console.log(`Memory Entries: ${stats.search.memoryCacheEntries}`);
    console.log(`Initialized: ${stats.search.initialized}`);
    console.groupEnd();

    console.log(`Generated at: ${stats.timestamp}`);
    console.groupEnd();
}

/**
 * Clear all caches (useful for debugging)
 */
export async function clearAllCaches() {
    try {
        await Promise.all([
            apiCacheService.clear(),
            searchCacheService.clear()
        ]);

        console.log('✅ All caches cleared successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear caches:', error);
        return false;
    }
}

/**
 * Reset cache statistics (useful for testing)
 */
export function resetCacheStats() {
    try {
        apiCacheService.resetStats();
        console.log('✅ Cache statistics reset');
        return true;
    } catch (error) {
        console.error('❌ Failed to reset cache stats:', error);
        return false;
    }
}

/**
 * Expose cache utilities to window for debugging (development only)
 */
export function exposeDebugUtils() {
    if (import.meta.env?.MODE === 'development' || process.env.NODE_ENV === 'development') {
        window.cacheUtils = {
            getStats: getCacheStats,
            logPerformance: logCachePerformance,
            clearAll: clearAllCaches,
            resetStats: resetCacheStats
        };

        console.log('🔧 Cache debug utilities exposed to window.cacheUtils');
        console.log('Available methods: getStats(), logPerformance(), clearAll(), resetStats()');
    }
}

// Auto-expose in development
if (typeof window !== 'undefined') {
    exposeDebugUtils();
}