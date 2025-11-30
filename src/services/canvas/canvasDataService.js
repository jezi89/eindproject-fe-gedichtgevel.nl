/**
 * Canvas Data Service
 * 
 * Handles poem data transport between search results and canvas.
 * Manages sessionStorage for temporary data storage and provides
 * data standardization and validation methods.
 */

export class CanvasDataService {
    static STORAGE_KEY = 'canvas-poem-data';
    static MAX_STORAGE_SIZE = 1024 * 1024; // 1MB limit for safety
    
    /**
     * Store poem data for canvas transport
     * @param {Object} poemData - Raw poem data from search results
     * @returns {Object} Standardized poem data
     */
    static storePoemForCanvas(poemData) {
        try {

            const standardizedData = this.standardizePoemData(poemData);
            const dataString = JSON.stringify(standardizedData);
            
            // Check size limit
            if (dataString.length > this.MAX_STORAGE_SIZE) {

                standardizedData.lines = standardizedData.lines.slice(0, 100); // Limit to 100 lines
            }
            
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(standardizedData));

            return standardizedData;
        } catch (error) {

            throw new Error('Failed to store poem data for canvas');
        }
    }
    
    /**
     * Retrieve poem data for canvas
     * @returns {Object|null} Stored poem data or null if not found
     */
    static getPoemForCanvas() {
        try {
            const stored = sessionStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return null;
            }
            
            const poemData = JSON.parse(stored);
            
            // Validate retrieved data
            if (!this.validatePoemData(poemData)) {

                this.clearPoemData();
                return null;
            }

            return poemData;
        } catch (error) {

            this.clearPoemData(); // Clear corrupted data
            return null;
        }
    }
    
    /**
     * Clear poem data from storage
     */
    static clearPoemData() {
        try {
            sessionStorage.removeItem(this.STORAGE_KEY);

        } catch (error) {

        }
    }   
 
    /**
     * Standardize poem data format
     * @param {Object} poemData - Raw poem data
     * @returns {Object} Standardized poem data
     */
    static standardizePoemData(poemData) {
        if (!poemData) {
            throw new Error('Poem data is required');
        }
        
        // Extract lines from various possible formats
        // Extract lines from various possible formats
        let lines = [];
        if (Array.isArray(poemData.lines)) {
            lines = poemData.lines.filter(line => typeof line === 'string');
        } else if (typeof poemData.text === 'string') {
            lines = poemData.text.split(/\r\n|\r|\n|<br\s*\/?>/i).filter(line => line.trim() !== '');
        } else if (typeof poemData.content === 'string') {
            lines = poemData.content.split(/\r\n|\r|\n|<br\s*\/?>/i).filter(line => line.trim() !== '');
        } else if (typeof poemData.body === 'string') {
            lines = poemData.body.split(/\r\n|\r|\n|<br\s*\/?>/i).filter(line => line.trim() !== '');
        }
        
        // Ensure we have at least some content
        if (lines.length === 0) {
            lines = ['No poem content available'];
        }
        
        const standardized = {
            id: poemData.id || this.generateId(poemData.title || 'untitled'),
            title: this.sanitizeText(poemData.title) || 'Untitled Poem',
            author: this.sanitizeText(poemData.author) || 'Unknown Author',
            lines: lines.map(line => this.sanitizeText(line)),
            source: 'search',
            timestamp: Date.now(),
            metadata: {
                originalUrl: poemData.url || poemData.originalUrl || null,
                wordCount: this.calculateWordCount(lines),
                lineCount: lines.length,
                originalFormat: this.detectOriginalFormat(poemData)
            }
        };
        
        return standardized;
    }
    
    /**
     * Validate poem data structure
     * @param {Object} poemData - Poem data to validate
     * @returns {boolean} True if valid
     */
    static validatePoemData(poemData) {
        if (!poemData || typeof poemData !== 'object') {
            return false;
        }
        
        // Required fields
        const requiredFields = ['id', 'title', 'author', 'lines'];
        for (const field of requiredFields) {
            if (!poemData[field]) {
                return false;
            }
        }
        
        // Validate lines array
        if (!Array.isArray(poemData.lines) || poemData.lines.length === 0) {
            return false;
        }
        
        // Validate all lines are strings
        if (!poemData.lines.every(line => typeof line === 'string')) {
            return false;
        }
        
        return true;
    }  
  
    /**
     * Generate unique ID for poem
     * @param {string} title - Poem title
     * @returns {string} Generated ID
     */
    static generateId(title) {
        const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .substring(0, 50); // Limit length
        
        const timestamp = Date.now().toString(36); // Base36 timestamp
        const random = Math.random().toString(36).substring(2, 8); // Random suffix
        
        return `${cleanTitle}-${timestamp}-${random}`;
    }
    
    /**
     * Decode HTML entities to normal characters
     * @param {string} text - Text that may contain HTML entities
     * @returns {string} Decoded text
     */
    static decodeHtmlEntities(text) {
        if (typeof text !== 'string') {
            return '';
        }
        
        return text
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&#x2F;/g, '/')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&'); // Must be last to avoid double-decoding
    }

    /**
     * Sanitize text content for canvas rendering
     * For PIXI.js text rendering, we don't need HTML entity encoding
     * Just basic cleanup and normalization
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeText(text) {
        if (typeof text !== 'string') {
            return '';
        }
        
        // First decode any existing HTML entities
        const decoded = this.decodeHtmlEntities(text);
        
        return decoded
            .trim()
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            // Remove any null bytes or control characters (except newlines and tabs)
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
    
    /**
     * Calculate word count for poem lines
     * @param {Array<string>} lines - Poem lines
     * @returns {number} Total word count
     */
    static calculateWordCount(lines) {
        return lines.reduce((count, line) => {
            const words = line.trim().split(/\s+/).filter(word => word.length > 0);
            return count + words.length;
        }, 0);
    }
    
    /**
     * Detect original data format for metadata
     * @param {Object} poemData - Original poem data
     * @returns {string} Detected format
     */
    static detectOriginalFormat(poemData) {
        if (Array.isArray(poemData.lines)) return 'lines-array';
        if (poemData.text) return 'text-string';
        if (poemData.content) return 'content-string';
        if (poemData.body) return 'body-string';
        return 'unknown';
    }
    
    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    static getStorageInfo() {
        try {
            const data = sessionStorage.getItem(this.STORAGE_KEY);
            return {
                hasData: !!data,
                size: data ? data.length : 0,
                maxSize: this.MAX_STORAGE_SIZE,
                percentUsed: data ? Math.round((data.length / this.MAX_STORAGE_SIZE) * 100) : 0
            };
        } catch (error) {
            return {
                hasData: false,
                size: 0,
                maxSize: this.MAX_STORAGE_SIZE,
                percentUsed: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Check if sessionStorage is available
     * @returns {boolean} True if available
     */
    static isStorageAvailable() {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (error) {

            return false;
        }
    }
}