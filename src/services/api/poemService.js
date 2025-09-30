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

/**
 * Haalt gedichten op van PoetryDB op basis van een veld en zoekterm.
 *
 * @param {string} query - De zoekterm.
 * @param {string} field - Het veld waarop gezocht moet worden ('title', 'author', etc.).
 * @returns {Promise<Array<object>>} - Array van gevonden gedichten.
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
 * Haalt overeenkomstige titel/auteur combinaties op uit Supabase.
 *
 * @param {string} query - De zoekterm.
 * @param {string} field - Het veld waarop gezocht moet worden ('title' of 'author').
 * @returns {Promise<Array<{title: string, author: string}>>} - Array van titel/auteur combinaties.
 */
// TODO nog implementeren

// TEMP

/**
 * Haalt overeenkomstige titel/auteur combinaties op uit Supabase.
 *
 * @param {string} query - De zoekterm.
 * @param {string} field - Het veld waarop gezocht moet worden ('title' of 'author').
 * @returns {Promise<Array<{title: string, author: string}>>} - Array van titel/auteur combinaties.
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
 * Haalt één specifiek gedicht op basis van exacte titel en auteur.
 *
 * @param {string} title - De exacte titel van het gedicht.
 * @param {string} author - De exacte auteur van het gedicht.
 * @returns {Promise<object|null>} - Het gevonden gedicht of null bij niet gevonden.
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
 * Zoekt gedichten op basis van titel, met gecombineerde resultaten uit Supabase en PoetryDB.
 *
 * @param {string} title - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten met bronvermelding.
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

    // Stap 3: Zoek direct in PoetryDB
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

    // Stap 4: Zorg voor unieke resultaten
    return removeDuplicatePoems(poemsForDisplay);
}

/**
 * Zoekt gedichten op basis van auteur, met gecombineerde resultaten uit Supabase en PoetryDB.
 *
 * @param {string} author - De auteur om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten met bronvermelding.
 */
export async function searchPoemsByAuthor(author) {
    let supabaseMatches = [];
    let poemsForDisplay = [];

    // Stap 1: Zoek eerst in Supabase
    try {
        supabaseMatches = await fetchTitleAuthorMatchesFromSupabase(author, 'author');
    } catch (error) {
        console.warn(`Kon geen auteur matches ophalen van Supabase voor "${author}":`, error.message);
    }

    // Stap 2: Voor elke Supabase match, haal details op uit PoetryDB
    if (supabaseMatches.length > 0) {
        for (const match of supabaseMatches) {
            try {
                const specificPoem = await fetchPoem(match.title, match.author);

                if (specificPoem) {
                    poemsForDisplay.push({...specificPoem, source: 'supabase_author_match_exact'});
                } else {
                    // Fallback: zoek alle gedichten van auteur en filter op titel
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

    // Stap 3: Zoek direct in PoetryDB
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
 * Zoekt gedichten op basis van zowel auteur als titel.
 * Combineert resultaten uit Supabase en PoetryDB.
 *
 * @param {string} author - De auteur om op te zoeken.
 * @param {string} title - De titel om op te zoeken.
 * @returns {Promise<Array<object>>} - Een array van unieke gedichten die aan beide criteria voldoen.
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

// TEMP

/**
 * Verwijdert duplicaten uit een array van gedichten op basis van titel+auteur combinatie.
 *
 * @param {Array<object>} poems - Array van gedichten mogelijk met duplicaten.
 * @returns {Array<object>} - Array van unieke gedichten.
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
// SECTIE 4: EXPORT VOOR PUBLIEKE API
// ==========================================================================


export {
    fetchPoemsFromPoetryDBByTitle,
    fetchPoemsFromPoetryDBByAuthor,
    fetchPoemsFromPoetryDBByAuthorAndTitle
};


// TODO: Toekomstige functionaliteit
// - Implementatie van full-text zoeken in gedichtenregels
// - Paginering voor zoekresultaten
// - Geavanceerd filteren op basis van taal, periode, etc.
// - Ondersteuning voor gebruikersspecifieke gedichtencollecties