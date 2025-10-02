import {CACHE_CONFIG, cleanupCache, db, getDatabaseHealth, resetDatabase} from './dexieConfig';

/**
 * SearchCacheService
 * Implements a two-tier caching strategy:
 * 1. Memory cache (Map) for instant access
 * 2. Persistent cache (Dexie/IndexedDB) for cross-session persistence
 */
class SearchCacheService {
    constructor() {
        // In-memory cache for fastest access
        this.memoryCache = new Map();

        // Track initialization
        this.initialized = false;

        // Cleanup interval
        this.cleanupInterval = null;
    }

    /**
     * Initialize the cache service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Clean up old entries on startup - with better error handling
            await cleanupCache();

            // Set up periodic cleanup (every 5 minutes) - wrapped in try-catch
            this.cleanupInterval = setInterval(async () => {
                try {
                    await cleanupCache();
                } catch (error) {
                    console.error('Periodic cache cleanup failed:', error);
                    // Don't stop the interval, just log the error
                }
            }, 5 * 60 * 1000);

            this.initialized = true;
            console.log('SearchCacheService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SearchCacheService:', error);
            // Mark as initialized anyway to prevent repeated failures
            this.initialized = true;
        }
    }

    /**
     * Set search term only (lightweight update)
     * @param {string} searchTerm - Search term to save
     * @param {string} source - Source of the search
     */
    async setSearchTerm(searchTerm, source) {
        try {
            const context = await this.getContext() || {};
            context.searchTerm = searchTerm;
            context.lastSearched = Date.now();
            context.lastSearchSource = source;

            await this.setContext(context);
        } catch (error) {
            console.error('Failed to set search term:', error);
        }
    }

    /**
     * Get search results from cache
     * @param {string} searchTerm - The search term to look up
     * @returns {Promise<Object|null>} Cached data or null if not found/expired
     */
    async get(searchTerm) {
        const normalizedTerm = searchTerm.trim().toLowerCase();

        // 1. Check memory cache first
        const memoryData = this.memoryCache.get(normalizedTerm);
        if (memoryData && this.isValid(memoryData.timestamp)) {
            console.log(`Cache hit (memory): ${normalizedTerm}`);
            return memoryData.data;
        }

        // 2. Check persistent cache
        try {
            const persistentData = await db.searchCache
                .where('searchTerm')
                .equals(normalizedTerm)
                .reverse()
                .sortBy('timestamp');

            if (persistentData.length > 0) {
                const latest = persistentData[0];
                if (this.isValid(latest.timestamp)) {
                    console.log(`Cache hit (persistent): ${normalizedTerm}`);

                    // Update memory cache
                    this.memoryCache.set(normalizedTerm, {
                        data: latest.data,
                        timestamp: latest.timestamp
                    });

                    return latest.data;
                }
            }
        } catch (error) {
            console.error('Failed to read from persistent cache:', error);
        }

        console.log(`Cache miss: ${normalizedTerm}`);
        return null;
    }

    /**
     * Store search results in cache
     * @param {string} searchTerm - The search term
     * @param {Array} data - The search results
     */
    async set(searchTerm, data) {
        const normalizedTerm = searchTerm.trim().toLowerCase();
        const timestamp = Date.now();

        // 1. Update memory cache
        this.memoryCache.set(normalizedTerm, {
            data,
            timestamp
        });

        // 2. Update persistent cache
        try {
            await db.searchCache.add({
                searchTerm: normalizedTerm,
                data,
                timestamp,
                resultCount: data.length
            });

            console.log(`Cached search results: ${normalizedTerm} (${data.length} results)`);
        } catch (error) {
            console.error('Failed to write to persistent cache:', error);
        }
    }

    /**
     * Save search context for navigation
     * @param {Object} context - Context data to save
     */
    async setContext(context) {
        const contextKey = 'current-search';
        const timestamp = Date.now();

        try {
            // Delete old context
            await db.searchContext
                .where('contextKey')
                .equals(contextKey)
                .delete();

            // Add new context
            await db.searchContext.add({
                contextKey,
                context,
                timestamp
            });

            console.log('Search context saved');
        } catch (error) {
            console.error('Failed to save search context:', error);
        }
    }

    /**
     * Get search context
     * @returns {Promise<Object|null>} Saved context or null
     */
    async getContext() {
        try {
            const context = await db.searchContext
                .where('contextKey')
                .equals('current-search')
                .first();

            if (context && this.isValid(context.timestamp, CACHE_CONFIG.CONTEXT_TTL)) {
                console.log('Search context retrieved');
                return context.context;
            }
        } catch (error) {
            console.error('Failed to retrieve search context:', error);
        }

        return null;
    }

    /**
     * Clear all caches
     */
    async clear() {
        this.memoryCache.clear();

        try {
            await db.searchCache.clear();
            await db.searchContext.clear();
            console.log('All caches cleared');
        } catch (error) {
            console.error('Failed to clear caches:', error);
        }
    }

    /**
     * Check if cached data is still valid
     * @param {number} timestamp - Cache timestamp
     * @param {number} ttl - Time to live (optional, defaults to search cache TTL)
     * @returns {boolean} True if valid
     */
    isValid(timestamp, ttl = CACHE_CONFIG.SEARCH_CACHE_TTL) {
        return Date.now() - timestamp < ttl;
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache stats
     */
    async getStats() {
        try {
            const searchCount = await db.searchCache.count();
            const contextCount = await db.searchContext.count();
            const memoryCacheSize = this.memoryCache.size;

            return {
                searchCacheEntries: searchCount,
                contextEntries: contextCount,
                memoryCacheEntries: memoryCacheSize,
                initialized: this.initialized
            };
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            return {
                error: error.message
            };
        }
    }

    /**
     * Reset database - utility for debugging
     */
    async resetDatabase() {
        try {
            this.memoryCache.clear();
            const result = await resetDatabase();
            if (result) {
                console.log('Database reset successful - please refresh the page');
            }
            return result;
        } catch (error) {
            console.error('Failed to reset database:', error);
            return false;
        }
    }

    /**
     * Get database health status
     */
    async getDatabaseHealth() {
        return await getDatabaseHealth();
    }

    /**
     * Cleanup on service destruction
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.memoryCache.clear();
        this.initialized = false;
    }
}

// Export singleton instance
export const searchCacheService = new SearchCacheService();

// Make debugging utilities available globally
if (typeof window !== 'undefined') {
    window.searchCacheService = searchCacheService;
    window.resetSearchCache = () => searchCacheService.resetDatabase();
    window.checkCacheHealth = () => searchCacheService.getDatabaseHealth();
}

// Auto-initialize on import
searchCacheService.initialize().catch(console.error);

