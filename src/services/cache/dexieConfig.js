import Dexie from 'dexie';

// TODO Checken hoe Dexie caching systeem werkt

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

// Version 3: Add canvas poem cache table
db.version(3).stores({
    // Keep existing tables
    searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',
    searchContext: '++id, contextKey, timestamp',
    metadata: 'key, value, lastUpdated',
    preferences: 'key, value',
    apiCache: '++id, cacheKey, timestamp, ttl, type, resultCount, [cacheKey+timestamp]',

    // Canvas poem cache for currently loaded poem in design mode
    canvasPoems: '++id, [title+author], title, author, timestamp, accessCount, lastAccessed, [timestamp+accessCount]'
});

// Cache configuration constants
export const CACHE_CONFIG = {
    SEARCH_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    CONTEXT_TTL: 24 * 60 * 60 * 1000, // 24 hours
    CANVAS_POEM_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_SEARCH_CACHE_ENTRIES: 100,
    MAX_CONTEXT_ENTRIES: 10,
    MAX_API_CACHE_ENTRIES: 500, // More API calls than searches
    MAX_CANVAS_POEMS: 20 // Keep recent canvas poems
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
        let totalCleanedEntries = 0;

        // Clean search cache
        try {
            const oldSearches = await db.searchCache
                .where('timestamp')
                .below(now - CACHE_CONFIG.SEARCH_CACHE_TTL)
                .toArray();

            if (oldSearches.length > 0) {
                await db.searchCache.bulkDelete(oldSearches.map(s => s.id));
                totalCleanedEntries += oldSearches.length;
                console.log(`Cleaned up ${oldSearches.length} old search cache entries`);
            }
        } catch (error) {
            console.error('Failed to clean search cache:', error);
        }

        // Clean context cache
        try {
            const oldContexts = await db.searchContext
                .where('timestamp')
                .below(now - CACHE_CONFIG.CONTEXT_TTL)
                .toArray();

            if (oldContexts.length > 0) {
                await db.searchContext.bulkDelete(oldContexts.map(c => c.id));
                totalCleanedEntries += oldContexts.length;
                console.log(`Cleaned up ${oldContexts.length} old context entries`);
            }
        } catch (error) {
            console.error('Failed to clean context cache:', error);
        }

        // Limit total entries for search cache
        try {
            const searchCount = await db.searchCache.count();
            if (searchCount > CACHE_CONFIG.MAX_SEARCH_CACHE_ENTRIES) {
                const toDelete = await db.searchCache
                    .orderBy('timestamp')
                    .limit(searchCount - CACHE_CONFIG.MAX_SEARCH_CACHE_ENTRIES)
                    .toArray();
                await db.searchCache.bulkDelete(toDelete.map(s => s.id));
                totalCleanedEntries += toDelete.length;
            }
        } catch (error) {
            console.error('Failed to limit search cache entries:', error);
        }

        // Clean and limit API cache entries (if table exists)
        if (db.apiCache) {
            try {
                // Clean expired API cache entries - get all entries and filter in memory
                // This is safer than using complex queries with dynamic TTL
                const allApiCaches = await db.apiCache.toArray();
                const expiredApiCaches = allApiCaches.filter(entry => {
                    const entryTTL = entry.ttl || CACHE_CONFIG.SEARCH_CACHE_TTL;
                    const isExpired = now > (entry.timestamp + entryTTL);
                    return isExpired;
                });

                // Also clean entries older than 24 hours regardless of TTL
                const oneDayAgo = now - (24 * 60 * 60 * 1000);
                const veryOldApiCaches = allApiCaches.filter(entry => entry.timestamp < oneDayAgo);

                // Combine and deduplicate using Map
                const combinedEntries = [...expiredApiCaches, ...veryOldApiCaches];
                const apiCachesToDelete = [...new Map(
                    combinedEntries.map(entry => [entry.id, entry])
                ).values()];

                if (apiCachesToDelete.length > 0) {
                    await db.apiCache.bulkDelete(apiCachesToDelete.map(a => a.id));
                    console.log(`Cleaned up ${apiCachesToDelete.length} old API cache entries`);
                }
            } catch (error) {
                console.error('Failed to clean API cache entries:', error);
                // Continue with other cleanup tasks even if API cache cleanup fails
            }

            // Limit total API cache entries
            try {
                const apiCount = await db.apiCache.count();
                if (apiCount > CACHE_CONFIG.MAX_API_CACHE_ENTRIES) {
                    const toDeleteApi = await db.apiCache
                        .orderBy('timestamp')
                        .limit(apiCount - CACHE_CONFIG.MAX_API_CACHE_ENTRIES)
                        .toArray();
                    await db.apiCache.bulkDelete(toDeleteApi.map(a => a.id));
                    totalCleanedEntries += toDeleteApi.length;
                }
            } catch (error) {
                console.error('Failed to limit API cache entries:', error);
            }
        }

        // Clean and limit canvas poems cache
        if (db.canvasPoems) {
            try {
                // Clean expired canvas poems
                const oldCanvasPoems = await db.canvasPoems
                    .where('lastAccessed')
                    .below(now - CACHE_CONFIG.CANVAS_POEM_TTL)
                    .toArray();

                if (oldCanvasPoems.length > 0) {
                    await db.canvasPoems.bulkDelete(oldCanvasPoems.map(p => p.id));
                    totalCleanedEntries += oldCanvasPoems.length;
                    console.log(`Cleaned up ${oldCanvasPoems.length} old canvas poems`);
                }

                // Limit total canvas poems (keep most recently accessed)
                const canvasPoemCount = await db.canvasPoems.count();
                if (canvasPoemCount > CACHE_CONFIG.MAX_CANVAS_POEMS) {
                    const toDeletePoems = await db.canvasPoems
                        .orderBy('lastAccessed')
                        .limit(canvasPoemCount - CACHE_CONFIG.MAX_CANVAS_POEMS)
                        .toArray();
                    await db.canvasPoems.bulkDelete(toDeletePoems.map(p => p.id));
                    totalCleanedEntries += toDeletePoems.length;
                }
            } catch (error) {
                console.error('Failed to clean canvas poems cache:', error);
            }
        }

        if (totalCleanedEntries > 0) {
            console.log(`Cache cleanup completed: ${totalCleanedEntries} total entries removed`);
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
        // Don't rethrow - allow app to continue functioning even if cache cleanup fails
    }
}

/**
 * Reset entire database - useful for resolving corruption issues
 * WARNING: This will delete ALL cached data
 */
export async function resetDatabase() {
    try {
        console.warn('Resetting entire cache database...');
        await db.delete();

        // Recreate the database
        const newDb = new Dexie('GedichteGevelCache');

        // Redefine schema
        newDb.version(1).stores({
            searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',
            searchContext: '++id, contextKey, timestamp',
            metadata: 'key, value, lastUpdated',
            preferences: 'key, value'
        });

        newDb.version(2).stores({
            searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',
            searchContext: '++id, contextKey, timestamp',
            metadata: 'key, value, lastUpdated',
            preferences: 'key, value',
            apiCache: '++id, cacheKey, timestamp, ttl, type, resultCount, [cacheKey+timestamp]'
        });

        newDb.version(3).stores({
            searchCache: '++id, searchTerm, timestamp, resultCount, [searchTerm+timestamp]',
            searchContext: '++id, contextKey, timestamp',
            metadata: 'key, value, lastUpdated',
            preferences: 'key, value',
            apiCache: '++id, cacheKey, timestamp, ttl, type, resultCount, [cacheKey+timestamp]',
            canvasPoems: '++id, [title+author], title, author, timestamp, accessCount, lastAccessed, [timestamp+accessCount]'
        });

        await newDb.open();
        await initializeDatabase();

        console.log('Database reset completed successfully');
        return true;
    } catch (error) {
        console.error('Failed to reset database:', error);
        return false;
    }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
    try {
        const health = {
            isOpen: db.isOpen(),
            searchCacheCount: 0,
            contextCount: 0,
            apiCacheCount: 0,
            canvasPoemsCount: 0,
            errors: []
        };

        if (health.isOpen) {
            try {
                health.searchCacheCount = await db.searchCache.count();
            } catch (error) {
                health.errors.push(`Search cache error: ${error.message}`);
            }

            try {
                health.contextCount = await db.searchContext.count();
            } catch (error) {
                health.errors.push(`Context cache error: ${error.message}`);
            }

            if (db.apiCache) {
                try {
                    health.apiCacheCount = await db.apiCache.count();
                } catch (error) {
                    health.errors.push(`API cache error: ${error.message}`);
                }
            }

            if (db.canvasPoems) {
                try {
                    health.canvasPoemsCount = await db.canvasPoems.count();
                } catch (error) {
                    health.errors.push(`Canvas poems cache error: ${error.message}`);
                }
            }
        }

        return health;
    } catch (error) {
        return {
            isOpen: false,
            errors: [`Database error: ${error.message}`]
        };
    }
}

/**
 * Export database instance and utilities
 */
export default db;