import db, {CACHE_CONFIG} from './dexieConfig';

/**
 * ApiCacheService
 * Implements a hierarchical L1/L2 caching strategy for individual API calls:
 * 1. L1 Cache (Memory Map) - Ultra-fast access for recent calls
 * 2. L2 Cache (Dexie/IndexedDB) - Persistent storage for longer-term caching
 */
class ApiCacheService {
    constructor() {
        // L1 Cache - In-memory Map for fastest access
        this.memoryCache = new Map();

        // Configuration for smart TTL
        this.TTL_CONFIG = {
            development: 30 * 60 * 1000,     // 30 minutes in development
            production: 4 * 60 * 60 * 1000,  // 4 hours in production
            failed: 5 * 60 * 1000,           // 5 minutes for failed requests
            popular: 24 * 60 * 60 * 1000     // 24 hours for popular searches
        };

        // Determine environment
        const isDevelopment = import.meta.env?.MODE === 'development' || process.env.NODE_ENV === 'development';
        this.defaultTTL = isDevelopment ? this.TTL_CONFIG.development : this.TTL_CONFIG.production;

        // Track initialization
        this.initialized = false;

        // Performance stats
        this.stats = {
            l1Hits: 0,
            l2Hits: 0,
            misses: 0,
            sets: 0
        };
    }

    /**
     * Initialize the API cache service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Ensure database is ready
            await db.ready;

            // Add API cache table to existing schema if not exists
            if (!db.apiCache) {
                console.log('Adding apiCache table to existing database');
                // This will require a version update in production
            }

            this.initialized = true;
            console.log('ApiCacheService initialized');
        } catch (error) {
            console.error('Failed to initialize ApiCacheService:', error);
        }
    }

    /**
     * Get data from cache (L1 → L2 → null)
     * @param {string} key - Cache key (e.g., "poetrydb:title:shakespeare")
     * @returns {Promise<Array|null>} Cached data or null
     */
    async get(key) {
        const normalizedKey = key.toLowerCase();

        // L1 Cache Check (Memory)
        const l1Data = this.memoryCache.get(normalizedKey);
        if (l1Data && Date.now() - l1Data.timestamp < l1Data.ttl) {
            this.stats.l1Hits++;
            console.log(`API L1 cache hit: ${key} (TTL: ${Math.round(l1Data.ttl / 60000)}min)`);
            return l1Data.data;
        }

        // Remove expired L1 entry
        if (l1Data) {
            this.memoryCache.delete(normalizedKey);
        }

        // L2 Cache Check (Dexie) - First check if we have the table
        try {
            // For now, check if apiCache table exists
            const hasApiCache = db.tables.some(table => table.name === 'apiCache');

            if (hasApiCache) {
                const l2Data = await db.apiCache
                    .where('cacheKey')
                    .equals(normalizedKey)
                    .reverse()
                    .sortBy('timestamp');

                if (l2Data.length > 0) {
                    const latest = l2Data[0];
                    if (Date.now() - latest.timestamp < latest.ttl) {
                        this.stats.l2Hits++;
                        console.log(`API L2 cache hit: ${key} (TTL: ${Math.round(latest.ttl / 60000)}min)`);

                        // Promote to L1 cache
                        this.memoryCache.set(normalizedKey, {
                            data: latest.data,
                            timestamp: latest.timestamp,
                            ttl: latest.ttl,
                            type: latest.type
                        });

                        return latest.data;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to read from L2 API cache:', error);
        }

        this.stats.misses++;
        console.log(`API cache miss: ${key}`);
        return null;
    }

    /**
     * Set data in cache (both L1 and L2)
     * @param {string} key - Cache key
     * @param {Array} data - Data to cache
     * @param {string} type - Cache type ('normal', 'failed', 'popular')
     */
    async set(key, data, type = 'normal') {
        const normalizedKey = key.toLowerCase();
        const timestamp = Date.now();

        // Determine TTL based on type
        let ttl = this.defaultTTL;
        switch (type) {
            case 'failed':
                ttl = this.TTL_CONFIG.failed;
                break;
            case 'popular':
                ttl = this.TTL_CONFIG.popular;
                break;
            default:
                ttl = this.defaultTTL;
        }

        // L1 Cache (Memory)
        this.memoryCache.set(normalizedKey, {
            data,
            timestamp,
            ttl,
            type
        });

        // L2 Cache (Dexie) - Only if table exists
        try {
            const hasApiCache = db.tables.some(table => table.name === 'apiCache');

            if (hasApiCache) {
                await db.apiCache.add({
                    cacheKey: normalizedKey,
                    data,
                    timestamp,
                    ttl,
                    type,
                    resultCount: Array.isArray(data) ? data.length : 1
                });
            }
        } catch (error) {
            console.error('Failed to write to L2 API cache:', error);
            // Continue anyway - L1 cache still works
        }

        this.stats.sets++;
        console.log(`API cache set: ${key} (TTL: ${Math.round(ttl / 60000)}min, type: ${type})`);
    }

    /**
     * Clear all caches
     */
    async clear() {
        this.memoryCache.clear();

        try {
            const hasApiCache = db.tables.some(table => table.name === 'apiCache');
            if (hasApiCache) {
                await db.apiCache.clear();
            }
            console.log('API caches cleared');
        } catch (error) {
            console.error('Failed to clear API caches:', error);
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache performance stats
     */
    getStats() {
        const total = this.stats.l1Hits + this.stats.l2Hits + this.stats.misses;

        return {
            ...this.stats,
            total,
            l1HitRate: total > 0 ? (this.stats.l1Hits / total * 100).toFixed(1) + '%' : '0%',
            l2HitRate: total > 0 ? (this.stats.l2Hits / total * 100).toFixed(1) + '%' : '0%',
            totalHitRate: total > 0 ? ((this.stats.l1Hits + this.stats.l2Hits) / total * 100).toFixed(1) + '%' : '0%',
            memoryCacheSize: this.memoryCache.size,
            initialized: this.initialized
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            l1Hits: 0,
            l2Hits: 0,
            misses: 0,
            sets: 0
        };
    }

    /**
     * Cleanup expired entries from memory cache
     */
    cleanupMemoryCache() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp >= entry.ttl) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired memory cache entries`);
        }
    }
}

// Export singleton instance
const apiCacheService = new ApiCacheService();

// Auto-initialize on import
apiCacheService.initialize().catch(console.error);

// Periodic memory cleanup (every 10 minutes)
setInterval(() => {
    apiCacheService.cleanupMemoryCache();
}, 10 * 60 * 1000);

export default apiCacheService;