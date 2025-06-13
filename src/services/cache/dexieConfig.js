import Dexie from 'dexie';

/**
 * Dexie Database Configuration for gedichtegevel.nl
 * Provides persistent caching for search results and context preservation
 */

// Create database instance
export const db = new Dexie('GedichteGevelCache');

// Define database schema
db.version(1).stores({
    // Search cache with indexed fields for efficient queries
    searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',

    // Search context for preserving state between pages
    searchContext: '++id, contextKey, timestamp',

    // Metadata storage for known authors and other reference data
    metadata: 'key, value, lastUpdated',

    // User preferences and settings
    preferences: 'key, value'
});

// Version 2: Add API cache table
db.version(2).stores({
    // Keep existing tables
    searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',
    searchContext: '++id, contextKey, timestamp',
    metadata: 'key, value, lastUpdated',
    preferences: 'key, value',

    // New API cache table for individual API call caching
    apiCache: '++id, cacheKey, timestamp, ttl, type, resultCount, [cacheKey+timestamp]'
});

// Cache configuration constants
export const CACHE_CONFIG = {
    SEARCH_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    CONTEXT_TTL: 24 * 60 * 60 * 1000, // 24 hours
    MAX_SEARCH_CACHE_ENTRIES: 100,
    MAX_CONTEXT_ENTRIES: 10,
    MAX_API_CACHE_ENTRIES: 500 // More API calls than searches
};

/**
 * Initialize database with default data if needed
 */
export async function initializeDatabase() {
    try {
        const count = await db.metadata.count();
        if (count === 0) {
            // Add default metadata
            await db.metadata.add({
                key: 'dbVersion',
                value: '1.0.0',
                lastUpdated: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

/**
 * Clear old cache entries based on TTL
 */
export async function cleanupCache() {
    try {
        const now = Date.now();

        // Clean search cache
        const oldSearches = await db.searchCache
            .where('timestamp')
            .below(now - CACHE_CONFIG.SEARCH_CACHE_TTL)
            .toArray();

        if (oldSearches.length > 0) {
            await db.searchCache.bulkDelete(oldSearches.map(s => s.id));
            console.log(`Cleaned up ${oldSearches.length} old search cache entries`);
        }

        // Clean context cache
        const oldContexts = await db.searchContext
            .where('timestamp')
            .below(now - CACHE_CONFIG.CONTEXT_TTL)
            .toArray();

        if (oldContexts.length > 0) {
            await db.searchContext.bulkDelete(oldContexts.map(c => c.id));
            console.log(`Cleaned up ${oldContexts.length} old context entries`);
        }

        // Limit total entries for search cache
        const searchCount = await db.searchCache.count();
        if (searchCount > CACHE_CONFIG.MAX_SEARCH_CACHE_ENTRIES) {
            const toDelete = await db.searchCache
                .orderBy('timestamp')
                .limit(searchCount - CACHE_CONFIG.MAX_SEARCH_CACHE_ENTRIES)
                .toArray();
            await db.searchCache.bulkDelete(toDelete.map(s => s.id));
        }

        // Clean and limit API cache entries (if table exists)
        if (db.apiCache) {
            // Clean expired API cache entries
            const oldApiCaches = await db.apiCache
                .where('timestamp')
                .below(function () {
                    // Use a function to handle dynamic TTL per entry
                    return this.timestamp + this.ttl;
                })
                .toArray();

            // Fallback: clean entries older than 24 hours regardless of TTL
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            const veryOldApiCaches = await db.apiCache
                .where('timestamp')
                .below(oneDayAgo)
                .toArray();

            const apiCachesToDelete = [...new Set([...oldApiCaches, ...veryOldApiCaches])];

            if (apiCachesToDelete.length > 0) {
                await db.apiCache.bulkDelete(apiCachesToDelete.map(a => a.id));
                console.log(`Cleaned up ${apiCachesToDelete.length} old API cache entries`);
            }

            // Limit total API cache entries
            const apiCount = await db.apiCache.count();
            if (apiCount > CACHE_CONFIG.MAX_API_CACHE_ENTRIES) {
                const toDeleteApi = await db.apiCache
                    .orderBy('timestamp')
                    .limit(apiCount - CACHE_CONFIG.MAX_API_CACHE_ENTRIES)
                    .toArray();
                await db.apiCache.bulkDelete(toDeleteApi.map(a => a.id));
            }
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}

/**
 * Export database instance and utilities
 */
export default db;