import Dexie from 'dexie';

/**
 * Dexie Database Configuration for gedichtegevel.nl
 * NOTE: Server-state caching now handled by TanStack Query
 * This database only stores local client state (canvas designs)
 */

// Create database instance
export const db = new Dexie('GedichteGevelCache');

// Define database schema - Version 4 (cleaned up from migration)
db.version(4).stores({
    // Canvas poem cache for currently loaded poem in design mode
    canvasPoems: '++id, [title+author], title, author, timestamp, accessCount, lastAccessed, [timestamp+accessCount]',

    // Metadata storage for canvas-related reference data
    metadata: 'key, value, lastUpdated'
});

// Cache configuration constants (canvas only)
export const CACHE_CONFIG = {
    CANVAS_POEM_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_CANVAS_POEMS: 20 // Keep recent canvas poems
};

/**
 * Initialize database with default data if needed
 */
async function initializeDatabase() {
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
 * Clear old canvas poems cache entries based on TTL
 */
export async function cleanupCache() {
    try {
        const now = Date.now();
        let totalCleanedEntries = 0;

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
    }
}

/**
 * Reset entire database - useful for resolving corruption issues
 * WARNING: This will delete ALL canvas designs
 */
export async function resetDatabase() {
    try {
        console.warn('Resetting canvas database...');
        await db.delete();

        // Recreate the database
        const newDb = new Dexie('GedichteGevelCache');

        // Redefine schema
        newDb.version(4).stores({
            canvasPoems: '++id, [title+author], title, author, timestamp, accessCount, lastAccessed, [timestamp+accessCount]',
            metadata: 'key, value, lastUpdated'
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
            canvasPoemsCount: 0,
            errors: []
        };

        if (health.isOpen && db.canvasPoems) {
            try {
                health.canvasPoemsCount = await db.canvasPoems.count();
            } catch (error) {
                health.errors.push(`Canvas poems error: ${error.message}`);
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

// Initialize database on load
initializeDatabase().catch(console.error);