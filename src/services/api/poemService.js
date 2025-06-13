// ==========================================================================
// poemService.js
// Service voor interactie met PoetryDB API en lokale poëziedatabase via Supabase
// ==========================================================================

/**
 * PoetryDB API Service Module
 *
 * Verantwoordelijkheden:
 * - API-interacties met PoetryDB (externe gedichtendatabase)
 * - Integratie met Supabase voor gebruikersgedichten
 * - Gecombineerde zoekopdrachten over beide databronnen
 * - Error handling en transformatie van resultaten
 */

import {poetryDbApi} from './axios'; // Import voor de geconfigureerde axios instantie
import apiCacheService from '../cache/apiCacheService'; // Import enhanced cache service

// ==========================================================================
// SECTIE 1: BASIS API-FUNCTIES (INTERNE HELPERS)
// ==========================================================================

async function fetchPoemsFromPoetryDBByField(query, field = 'title') {
    try {
        const endpoint = `/${field}/${encodeURIComponent(query)}`;
        const response = await poetryDbApi.get(endpoint);

        // PoetryDB geeft 200 OK met status: 404 in response body bij geen resultaten
        if (response.data && response.data.status === 404) {
            return [];
        }

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        // Handle HTTP 404 (kan voorkomen bij sommige API versies)
        if (error.response && error.response.status === 404) {
            return [];
        }
        console.error(`Fout bij ophalen gedichten (veld: ${field}, query: "${query}") uit PoetryDB:`, error);
        throw new Error(`Kon geen gedichten ophalen van PoetryDB voor ${field} "${query}": ${error.message}`);
    }
}

/**
 * Haalt gedichten op van PoetryDB op basis van titel.
 *
 * @param {string} titleQuery - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Array van gevonden gedichten.
 */
async function fetchPoemsFromPoetryDBByTitle(titleQuery) {
    return fetchPoemsFromPoetryDBByField(titleQuery, 'title');
}


/**
 * Haalt gedichten op van PoetryDB op basis van auteur.
 *
 * @param {string} authorQuery - De auteur om op te zoeken.
 * @returns {Promise<Array<object>>} - Array van gevonden gedichten.
 */
async function fetchPoemsFromPoetryDBByAuthor(authorQuery) {
    return fetchPoemsFromPoetryDBByField(authorQuery, 'author');
}

/**
 * Haalt gedichten op van PoetryDB die overeenkomen met zowel auteur als titel.
 * Gebruikt de AND operator van PoetryDB API.
 *
 * @param {string} authorTerm - De auteur om op te zoeken.
 * @param {string} titleTerm - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Array van gevonden gedichten.
 */


// TODO Checken of deze caching tijd bepaling  nu door Dexie kan worden gedaan of dat we dit nog zelf moeten implementeren
/**
 * Cache duration in seconds
 */
const CACHE_DURATION = 3600; // 1 hour


/**
 * Haalt overeenkomstige titel/auteur combinaties op uit Supabase.
 *
 * @param {string} query - De zoekterm.
 * @param {string} field - Het veld waarop gezocht moet worden ('title' of 'author').
 * @returns {Promise<Array<{title: string, author: string}>>} - Array van titel/auteur combinaties.
 */
// TODO nog implementeren

// ==========================================================================
// SECTIE 2: EXPORTEERBARE API-FUNCTIES (PUBLIEKE INTERFACE)
// ==========================================================================


/**
 * Haalt één specifiek gedicht op basis van exacte titel en auteur.
 *
 * @param {string} title - De exacte titel van het gedicht.
 * @param {string} author - De exacte auteur van het gedicht.
 * @returns {Promise<object|null>} - Het gevonden gedicht of null bij niet gevonden.
 */

// TODO nog implementeren

/**
 * Zoekt gedichten op basis van titel, met gecombineerde resultaten uit Supabase en PoetryDB.
 *
 * @param {string} title - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten met bronvermelding.
 */

// Implementation
// - Check if title is empty
// - Format title for API
// - Check cache
// - Make API request
// - Handle response
// - Cache results
// - Handle errors

// TODO nog implementeren

/**
 * Zoekt gedichten op basis van auteur, met gecombineerde resultaten uit Supabase en PoetryDB.
 *
 * @param {string} author - De auteur om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten met bronvermelding.
 */

// Implementation
// - Check if author is empty
// - Format author for API
// - Check cache
// - Make API request
// - Handle response
// - Cache results
// - Handle errors

// TODO nog implementeren

/**
 * Zoekt gedichten op basis van zowel auteur als titel.
 * Combineert resultaten uit Supabase en PoetryDB.
 *
 * @param {string} author - De auteur om op te zoeken.
 * @param {string} title - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten die aan beide criteria voldoen.
 */

// Implementation
// - Check if author or title is empty
// - Format author and title for API
// - Create cache key
// - Check cache
// - Make API request
// - Handle response
// - Cache results
// - Handle errors

// TODO nog implementeren

/**
 * Haalt willekeurige gedichten op
 *
 * @description Fetch random poems
 * @param {number} count Number of poems to fetch (default: 5)
 * @returns {Promise<Array<object>>} Array of random poems
 */
/*export async function fetchRandomPoems(count = 5) {
    // Implementation
    // - Create cache key
    // - Use shorter cache duration for random poems
    // - Check cache
    // - Make API request
    // - Handle response
    // - Cache results
    // - Handle errors
}*/

// TODO nog implementeren


// ==========================================================================
// SECTIE 3: HULPFUNCTIES
// ==========================================================================

// TODO Implementeren en checken of deze niet in de utlility map moeten komen.

/**
 * Verwijdert duplicaten uit een array van gedichten op basis van titel+auteur combinatie.
 *
 * @param {Array<object>} poems - Array van gedichten mogelijk met duplicaten.
 * @returns {Array<object>} - Array van unieke gedichten.
 */


// ==========================================================================
// SECTIE 4: EXPORT VOOR PUBLIEKE API
// ==========================================================================


export {
    fetchPoemsFromPoetryDBByTitle,
    fetchPoemsFromPoetryDBByAuthor,

};


// TODO: Toekomstige functionaliteit
// - Implementatie van full-text zoeken in gedichtenregels
// - Paginering voor zoekresultaten
// - Geavanceerd filteren op basis van taal, periode, etc.
// - Ondersteuning voor gebruikersspecifieke gedichtencollecties