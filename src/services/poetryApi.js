/**
 * Poetry API Facade
 * 
 * Central API facade for accessing all poem and author data.
 * Re-exports specific functions from underlying services.
 * 
 * This module serves as:
 * - A central access point for all poem and author data (local and external)
 * - An interface layer that decides where data should come from
 * - A place for advanced search strategies, caching, and fallback mechanisms
 * - A clean import for UI components and business logic
 * 
 * @module services/poetryApi
 */

// Export poem-related functions from poemService
export {
    searchPoemsByTitle,
    searchPoemsByAuthor,
    fetchPoem
} from './api/poemService.js';

// Export general search function from poemSearchService
export {searchPoemsGeneral} from './api/poemSearchService.js';

/**
 * This module could be extended with orchestration functions that combine data sources,
 * implement caching strategies, and provide a unified interface for poem and author data.
 * 
 * For example:
 * - getPoemWithAuthor: Get poem data along with author information
 * - smartSearch: Detect whether a search term is an author, title, or both
 * - getCachedOrFetch: Check cache before fetching from external API
 */