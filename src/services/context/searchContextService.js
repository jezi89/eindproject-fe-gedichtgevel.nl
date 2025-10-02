import {searchCacheService} from '../cache/searchCacheService.js';

// TODO Checken of dit allemaal nodig is

/**
 * SearchContextService
 * Manages search state preservation across navigation
 * Works with searchCacheService for persistent storage
 */
class SearchContextService {
    constructor() {
        // In-memory state for current session
        this.currentContext = {
            searchTerm: '',
            results: [],
            carouselPosition: 0,
            selectedPoem: null,
            expandedStates: {},
            searchHistory: []
        };
    }

    /**
     * Save complete search context
     * @param {Object} context - Context to save
     */
    async saveContext(context) {
        try {
            this.currentContext = {
                ...this.currentContext,
                ...context,
                lastUpdated: Date.now(),
                source: context.source || 'unknown' // Track where the search came from
            };

            // Persist to Dexie
            await searchCacheService.setContext(this.currentContext);

            console.log('Search context saved:', {
                searchTerm: this.currentContext.searchTerm,
                resultCount: this.currentContext.results?.length || 0,
                source: this.currentContext.source
            });
        } catch (error) {
            console.error('Failed to save search context:', error);
        }
    }

    /**
     * Save only search term (lightweight update)
     * @param {string} searchTerm - Search term to save
     * @param {string} source - Source of the search ('homepage', 'canvas', 'focus')
     */
    async saveSearchTerm(searchTerm, source = 'unknown') {
        try {
            this.currentContext = {
                ...this.currentContext,
                searchTerm,
                lastSearched: Date.now(),
                lastSearchSource: source
            };

            // Only update search term in persistent storage
            await searchCacheService.setSearchTerm(searchTerm, source);

            console.log(`Search term saved from ${source}:`, searchTerm);
        } catch (error) {
            console.error('Failed to save search term:', error);
        }
    }

    /**
     * Get the most recent search term
     * @returns {Promise<string>} Most recent search term
     */
    async getLatestSearchTerm() {
        try {
            const context = await this.loadContext();
            return context?.searchTerm || '';
        } catch (error) {
            console.error('Failed to get latest search term:', error);
            return '';
        }
    }

    /**
     * Load search context
     * @returns {Promise<Object>} Saved context
     */
    async loadContext() {
        try {
            const persistedContext = await searchCacheService.getContext();

            if (persistedContext) {
                this.currentContext = persistedContext;
                console.log('Search context loaded:', {
                    searchTerm: this.currentContext.searchTerm,
                    resultCount: this.currentContext.results?.length || 0
                });
            }

            return this.currentContext;
        } catch (error) {
            console.error('Failed to load search context:', error);
            return this.currentContext;
        }
    }

    /**
     * Update specific context fields
     * @param {Object} updates - Fields to update
     */
    async updateContext(updates) {
        await this.saveContext(updates);
    }

    /**
     * Save carousel position
     * @param {number} position - Current carousel index
     */
    async saveCarouselPosition(position) {
        // Ensure position is a valid number
        const validPosition = typeof position === 'number' ? position : parseInt(position, 10);
        if (!isNaN(validPosition) && validPosition >= 0) {
            await this.updateContext({carouselPosition: validPosition});
        } else {
            console.warn('Invalid carousel position provided:', position);
        }
    }

    /**
     * Save expanded poem states
     * @param {Object} expandedStates - Map of poem indices to expanded state
     */
    async saveExpandedStates(expandedStates) {
        await this.updateContext({expandedStates});
    }

    /**
     * Save selected poem for canvas
     * @param {Object} poem - Selected poem data
     */
    async saveSelectedPoem(poem) {
        await this.updateContext({selectedPoem: poem});
    }

    /**
     * Get selected poem
     * @returns {Promise<Object|null>} Selected poem or null
     */
    async getSelectedPoem() {
        try {
            const context = await this.loadContext();
            return context?.selectedPoem || null;
        } catch (error) {
            console.error('Failed to get selected poem:', error);
            return null;
        }
    }

    /**
     * Get context for canvas navigation
     * @returns {Object} Context optimized for canvas
     */
    getCanvasContext() {
        return {
            searchTerm: this.currentContext.searchTerm,
            results: this.currentContext.results,
            selectedPoem: this.currentContext.selectedPoem,
            // Canvas always shows collapsed cards
            expandedStates: {}
        };
    }

    /**
     * Clear all context
     */
    async clearContext() {
        this.currentContext = {
            searchTerm: '',
            results: [],
            carouselPosition: 0,
            selectedPoem: null,
            expandedStates: {},
            searchHistory: []
        };

        // Clear from persistent storage
        await searchCacheService.setContext(null);
    }

    /**
     * Get current search term
     * @returns {string} Current search term
     */
    getCurrentSearchTerm() {
        return this.currentContext.searchTerm || '';
    }

    /**
     * Get current results
     * @returns {Array} Current search results
     */
    getCurrentResults() {
        return this.currentContext.results || [];
    }

    /**
     * Check if context is available
     * @returns {boolean} True if context has data
     */
    hasContext() {
        return !!(this.currentContext.searchTerm && this.currentContext.results?.length > 0);
    }
}

export const searchContextService = new SearchContextService();