// ==========================================================================
// poemService.js
// Service voor interactie met PoetryDB API en lokale poëziedatabase via Supabase
// ==========================================================================

/**
 * PoetryDB API Service Module
 *
 *Responsibilities:
 * - API interactions with PoetryDB (external poetry database)
 * - Integration with Supabase for user poems
 * - Combined searches across both data sources
 * - Error handling and transformation of results
 */

import {poetryDbApi} from './axios'; // Import voor de geconfigureerde axios instantie
import {apiCacheService} from '../cache/apiCacheService'; // Import enhanced cache service

// ==========================================================================
// SECTION 1: BASIC API FUNCTIONS (INTERNAL HELPERS)
// ==========================================================================

/**
 * Retrieves poems from PoetryDB based on a field and search term.
 *
 * @param {string} query – The search term.
 * @param {string} field - The field to search for ('title', 'author', etc.).
 * @returns {Promise<Array<object>>} - Array of poems found.
 */
async function fetchPoemsFromPoetryDBByField(query, field = 'title') {
    // Check L1/L2 cache hierarchy first
    const cacheKey = `poetrydb:${field}:${query.toLowerCase()}`;
    const cachedData = await apiCacheService.get(cacheKey);
    if (cachedData !== null) {
        return cachedData;
    }
    try {
        const endpoint = `/${field}/${encodeURIComponent(query)}`;
        const response = await poetryDbApi.get(endpoint);

        // poetrydb gives 200 OK with status: 404 in response body for no results
        if (response.data && response.data.status === 404) {
            return [];
        }

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        // handle http 404 (can occur with some API versions)
        if (error.response && error.response.status === 404) {
            return [];
        }
        console.error(`Fout bij ophalen gedichten (veld: ${field}, query: "${query}") uit PoetryDB:`, error);
        throw new Error(`Kon geen gedichten ophalen van PoetryDB voor ${field} "${query}": ${error.message}`);
    }
}

/**
 * Retrieves poems from PoetryDB based on title.
 *
 * @param {string} titleQuery – The title to look up.
 * @returns {Promise<Array<object>>} - Array of poems found.
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
 * Retrieves poems from PoetryDB that match both author and title.
 * Uses the AND operator of PoetryDB API.
 *
 * @param {string} authorTerm – The author to look up.
 * @param {string} titleTerm - The title to look up.
 * @returns {Promise<Array<object>>} - Array of poems found.
 */
async function fetchPoemsFromPoetryDBByAuthorAndTitle(authorTerm, titleTerm) {
    // Check L1/L2 cache hierarchy first
    const cacheKey = `poetrydb:author-title:${authorTerm.toLowerCase()};${titleTerm.toLowerCase()}`;
    const cachedData = await apiCacheService.get(cacheKey);
    if (cachedData !== null) {
        return cachedData;
    }

    try {
        // Juiste format voor AND-zoekopdracht met PoetryDB API
        const endpoint = `/author,title/${encodeURIComponent(authorTerm)};${encodeURIComponent(titleTerm)}`;
        const response = await poetryDbApi.get(endpoint);

        if (response.data && response.data.status === 404) {
            await apiCacheService.set(cacheKey, [], 'failed'); // Cache empty results with shorter TTL
            return [];
        }

        const results = Array.isArray(response.data) ? response.data : [];
        await apiCacheService.set(cacheKey, results, 'normal');
        return results;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await apiCacheService.set(cacheKey, [], 'failed'); // Cache 404s with shorter TTL
            return [];
        }
        console.error(`Fout bij ophalen gedichten (auteur: "${authorTerm}", titel: "${titleTerm}") uit PoetryDB:`, error);
        throw new Error(`Kon geen gedichten ophalen van PoetryDB voor auteur "${authorTerm}" en titel "${titleTerm}": ${error.message}`);
    }
}


/**
 * Retrieves corresponding title/author combinations from Supabase.
 *
 * @param {string} query – The search term.
 * @param {string} field - The field to be searched for ('title' or 'author').
 * @returns {Promise<Array<{title: string, author: string}>>} - Array of title/author combinations.
 */
// TODO nog implementeren

// TEMP

/**
 * Retrieves corresponding title/author combinations from Supabase.
 *
 * @param {string} query – The search term.
 * @param {string} field - The field to be searched for ('title' or 'author').
 * @returns {Promise<Array<{title: string, author: string}>>} - Array of title/author combinations.
 */
async function fetchTitleAuthorMatchesFromSupabase(query, field = 'title') {
    // TODO: Implementeer echte Supabase interactie wanneer beschikbaar
    // Voor nu return empty array om onnodige complexiteit te vermijden
    return Promise.resolve([]);

    /* Voorbeeld van echte implementatie met Supabase client:

    if (!supabase) {
        console.warn('Supabase client is niet geïnitialiseerd.');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('poems')
            .select('title, author')
            .ilike(field, `%${query}%`);

        if (error) {
            console.error(`Supabase fout bij zoeken op ${field} met query "${query}":`, error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error(`Fout bij ophalen van Supabase (veld: ${field}, query: "${query}"):`, error);
        throw new Error(`Kon geen matches ophalen van Supabase: ${error.message}`);
    }
    */
}


// ==========================================================================
// SECTIE 2: EXPORTEERBARE API-FUNCTIES (PUBLIEKE INTERFACE)
// ==========================================================================

// TEMP

/**
 * Retrieves one specific poem based on exact title and author.
 *
 * @param {string} title - The exact title of the poem.
 * @param {string} author - The exact author of the poem.
 * @returns {Promise<object|null>} - The poem found or null if not found.
 */
async function fetchPoem(title, author) {
    if (!title || !author) {
        console.warn("fetchPoem vereist zowel titel als auteur.");
        return null;
    }

    try {
        const results = await fetchPoemsFromPoetryDBByAuthorAndTitle(author, title);

        if (results && results.length > 0) {
            // Return het eerste resultaat als er meerdere zijn
            return results[0];
        }

        return null; // Niet gevonden
    } catch (error) {
        console.error(`Fout bij ophalen specifiek gedicht (titel: "${title}", auteur: "${author}"):`, error);
        return null; // Retourneer null bij een fout
    }
}

/**
 * Searches for poems based on title, with combined results from Supabase and PoetryDB.
 *
 * @param {string} title - The title to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems with citations.
 */
export async function searchPoemsByTitle(title) {
    let supabaseMatches = [];
    let poemsForDisplay = [];

    // Stap 1: Zoek eerst in Supabase
    try {
        supabaseMatches = await fetchTitleAuthorMatchesFromSupabase(title, 'title');
    } catch (error) {
        console.warn(`Kon geen titel matches ophalen van Supabase voor "${title}":`, error.message);
    }

    // Stap 2: Voor elke Supabase match, haal details op uit PoetryDB
    // Helpful for quick favorites and future user-added poems.
    if (supabaseMatches.length > 0) {
        for (const match of supabaseMatches) {
            try {
                // Probeer het specifieke gedicht te vinden
                const specificPoem = await fetchPoem(match.title, match.author);

                if (specificPoem) {
                    poemsForDisplay.push({...specificPoem, source: 'supabase_title_match_exact'});
                } else {
                    // Fallback naar algemene zoektocht op titel als exacte match faalt
                    const poetryDbDetailsArray = await fetchPoemsFromPoetryDBByTitle(match.title);
                    const firstMatchByAuthor = poetryDbDetailsArray.find(p => p.author === match.author);

                    if (firstMatchByAuthor) {
                        poemsForDisplay.push({...firstMatchByAuthor, source: 'supabase_title_match_author_verified'});
                    } else if (poetryDbDetailsArray.length > 0) {
                        poemsForDisplay.push({
                            ...poetryDbDetailsArray[0],
                            source: 'supabase_title_match_generic_author'
                        });
                    }
                }
            } catch (error) {
                console.warn(`Fout bij ophalen details van PoetryDB voor titel "${match.title}" (auteur "${match.author}"):`, error.message);
            }
        }
    }

    // Zoek direct in PoetryDB
    try {
        const poetryDbResults = await fetchPoemsFromPoetryDBByTitle(title);

        // Voeg alleen gedichten toe die nog niet eerder zijn toegevoegd
        poetryDbResults.forEach(pdbPoem => {
            const key = `${pdbPoem.title}-${pdbPoem.author}`.toLowerCase();
            const alreadyAdded = poemsForDisplay.some(p =>
                `${p.title}-${p.author}`.toLowerCase() === key
            );

            if (!alreadyAdded) {
                poemsForDisplay.push({...pdbPoem, source: 'poetrydb_direct_title'});
            }
        });
    } catch (error) {
        console.error(`Fout bij direct ophalen van PoetryDB op titel "${title}":`, error.message);
        // Alleen werpen als er nog geen resultaten zijn
        if (poemsForDisplay.length === 0) throw error;
    }

    // Zorg voor unieke resultaten
    return removeDuplicatePoems(poemsForDisplay);
}

/**
 * Searches for poems based on author, with combined results from Supabase and PoetryDB.
 *
 * @param {string} author – The author to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems with citations.
 */
export async function searchPoemsByAuthor(author) {
    let supabaseMatches = [];
    let poemsForDisplay = [];

    // Search Supabase First
    try {
        supabaseMatches = await fetchTitleAuthorMatchesFromSupabase(author, 'author');
    } catch (error) {
        console.warn(`Kon geen auteur matches ophalen van Supabase voor "${author}":`, error.message);
    }

    // Before each Supabase match, retrieve details from PoetryDB
    if (supabaseMatches.length > 0) {
        for (const match of supabaseMatches) {
            try {
                const specificPoem = await fetchPoem(match.title, match.author);

                if (specificPoem) {
                    poemsForDisplay.push({...specificPoem, source: 'supabase_author_match_exact'});
                } else {
                    // Fallback: Find all poems of author and filter by title
                    const authorPoemsPoetryDb = await fetchPoemsFromPoetryDBByAuthor(match.author);
                    const poemByAuthorAndTitle = authorPoemsPoetryDb.find(p => p.title === match.title);

                    if (poemByAuthorAndTitle) {
                        poemsForDisplay.push({
                            ...poemByAuthorAndTitle,
                            source: 'supabase_author_match_found_via_pdb_author_search'
                        });
                    }
                }
            } catch (error) {
                console.warn(`Fout bij ophalen details van PoetryDB voor gedicht van auteur "${match.author}" (titel "${match.title}"):`, error.message);
            }
        }
    }

    // Search directly in Poetrydb
    try {
        const poetryDbResults = await fetchPoemsFromPoetryDBByAuthor(author);

        // Voeg alleen gedichten toe die nog niet eerder zijn toegevoegd
        poetryDbResults.forEach(pdbPoem => {
            const key = `${pdbPoem.title}-${pdbPoem.author}`.toLowerCase();
            const alreadyAdded = poemsForDisplay.some(p =>
                `${p.title}-${p.author}`.toLowerCase() === key
            );

            if (!alreadyAdded) {
                poemsForDisplay.push({...pdbPoem, source: 'poetrydb_direct_author'});
            }
        });
    } catch (error) {
        console.error(`Fout bij direct ophalen van PoetryDB op auteur "${author}":`, error.message);
        // Alleen werpen als er nog geen resultaten zijn
        if (poemsForDisplay.length === 0) throw error;
    }

    // Stap 4: Zorg voor unieke resultaten
    return removeDuplicatePoems(poemsForDisplay);
}

/**
 * Searches for poems based on both author and title.
 * Combines results from Supabase and PoetryDB.
 *
 * @param {string} author – The author to look up.
 * @param {string} title - The title to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems that meet both criteria.
 */
// UNUSED: export async function searchPoemsByAuthorAndTitle(author, title) {
//     if (!author || !title) {
//         throw new Error("Zowel auteur als titel zijn vereist voor deze zoekopdracht.");
//     }
//
//     let poemsForDisplay = [];
//
//     // Stap 1: Directe zoekopdracht met AND operator in PoetryDB
//     try {
//         const poetryDbResults = await fetchPoemsFromPoetryDBByAuthorAndTitle(author, title);
//         poetryDbResults.forEach(poem => {
//             poemsForDisplay.push({...poem, source: 'poetrydb_direct_author_and_title'});
//         });
//     } catch (error) {
//         console.error(`Fout bij gecombineerde zoekopdracht (auteur: "${author}", titel: "${title}"):`, error.message);
//     }
//
//     // Stap 2: Aanvullende geavanceerde implementatie...
//     // TODO: Implementeer eventueel aanvullende logica met Supabase, fuzzy matching, etc.
//
//     return removeDuplicatePoems(poemsForDisplay);
// }

/**
 * Retrieves one specific poem based on exact title and author.
 *
 * @param {string} title - The exact title of the poem.
 * @param {string} author - The exact author of the poem.
 * @returns {Promise<object|null>} - The poem found or null if not found.
 */

// TODO nog implementeren

/**
 * Searches for poems based on title, with combined results from Supabase and PoetryDB.
 *
 * @param {string} title - The title to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems with citations.
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
 * Searches for poems based on author, with combined results from Supabase and PoetryDB.
 *
 * @param {string} author – The author to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems with citations.
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
 * Searches for poems based on both author and title.
 * Combines results from Supabase and PoetryDB.
 *
 * @param {string} author – The author to look up.
 * @param {string} title - The title to look up.
 * @returns {Promise<Array<object>>} - An array of unique poems that meet both criteria.
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
// SECTION 3: HELPER FUNCTIONS
// ==========================================================================

// TODO Implementeren en checken of deze niet in de utlility map moeten komen.

// TEMP

/**
 * Removes duplicates from an array of poems based on title+author combination.
 *
 * @param {Array<object>} poems - Array of poems possible with duplicates.
 * @returns {Array<object>} - Array of unique poems.
 */
function removeDuplicatePoems(poems) {
    const uniqueResults = [];
    const seenKeys = new Set();

    for (const poem of poems) {
        const key = `${poem.title}-${poem.author}`.toLowerCase();

        if (!seenKeys.has(key)) {
            uniqueResults.push(poem);
            seenKeys.add(key);
        }
    }

    return uniqueResults;
}


// ==========================================================================
// SECTION 4: EXPORT FOR PUBLIC API
// ==========================================================================


export {

    fetchPoemsFromPoetryDBByAuthorAndTitle
};


// TODO: Toekomstige functionaliteit
// - Implementatie van full-text zoeken in gedichtenregels
// - Paginering voor zoekresultaten
// - Geavanceerd filteren op basis van taal, periode, etc.
// - Ondersteuning voor gebruikersspecifieke gedichtencollecties