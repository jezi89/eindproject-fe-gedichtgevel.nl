/**
 * poemSearchService.js
 * Geavanceerde zoekfuncties (filters, multi-search, combinaties van velden)
 * Complexere zoekopbouw en combinaties, eventueel op basis van een enkele dataset (nog géén cache/cross-data).
 *
 * @description Advanced search functions (filters, multi-search, field combinations)
 * Complex search construction and combinations, potentially based on a single dataset (not yet cache/cross-data).
 *
 * @module poemSearchService
 */

// src/services/api/poemSearchService.js
import {
    searchPoemsByTitle as searchByTitleInService,
    searchPoemsByAuthor as searchByAuthorInService,
    fetchPoemsFromPoetryDBByAuthorAndTitle

} from './poemService.js';
import {poetrydbAuthors} from '@/constants/poetryDbAuthors_2025-05-16.js';
import searchResults from "@/components/search/searchResults.jsx"; // Deze lijst moet worden gegenereerd door consolidate-authors.js script


/**
 * Analyseert een zoekterm en probeert deze intelligent op te splitsen in auteur en titel.
 * Herkent verschillende patronen in de zoekterm.
 *
 * @param {str
 * ing} searchTerm De complete zoekterm ingevoerd door de gebruiker
 * @returns {Object} Een object met authorTerm en titleTerm
 */

function analyzeSearchTerm(searchTerm) {

    // TODO Checken of hier SearchTerm en andere logging nodig is als dingen verkeerd gaan

    // 1. Check for explicit patterns "author - title" or "title by author"


    // 2. Word count analysis

    // For 3+ words, assume pattern "First Last Title"

    // Ensure poetrydbAuthors is available in this scope

    // Enhanced author detection for queries with 1 or more words

    // Default: first two words = author, rest = title


    // 3. For two words

    // Check for a known author at the END of the search term
    // This is only relevant if numWords > 1 and no prefix match was found.
    // Ensures there's at least one word remaining for the title.

}

// Fallback logic if no specific author was identified by the enhanced checks above

// Fallback for 3+ words (if not caught by enhanced author check)

// Fallback for 2 words (if not caught by enhanced author check)

// Fallback for 1 word (if not an exact author match from enhanced check) or empty search


/**
 * Voert een algemene zoekopdracht uit op gedichten.
 * Probeert de zoekterm intelligent te matchen tegen zowel titels als auteurs.
 *
 * @description Performs a general search on poems.
 * Tries to intelligently match the search term against both titles and authors.
 *
 * @param {string} searchTerm De ingevoerde zoekterm. / The entered search term.
 * @param {Object} filters Optionele filters voor de zoekopdracht (taal, periode, enz.) / Optional filters for the search (language, period, etc.)
 * @returns {Promise<Array<object>>} Een array van gevonden gedichten. / An array of found poems.
 */

// 1. Analysis of the search term

// Preparing the promises


// 2. Add standard search queries
// We always do these, regardless of the analysis

// 2a. Search by title

// 2b. Search by author


// 3. Adding intelligent AND search action based on analysis

// 3a. For ambiguous 2-word combinations, try both word orders

// Option 1: Word 1 as author, word 2 as title

// Option 2: Word 2 as author, word 1 as title

// 3b. Use the analysis to perform a targeted AND search


// 4. Apply filters (if present)


// 5. Execute all search queries and collect results


// 6. Combine all results with metadata

// For 2-word options

// Standard

// TODO: CHcken of dta nodig is, want in PoemService.js staat al een deduplicate functie om gebouwd te worden. Kijken waar het logisch is om dit te doen.
// 7. Deduplicate results

// 8. Sort based on score/relevance
// TODO Checken of we hier niet beter ene library voor kunnen gebruiken zoals lodash of een andere utility library voor sorteren en dedupliceren en of dit geen utility functie moet worden.


/**
 * Zoek gedichten op titel (behoudt de originele specialisatie als nodig).
 *
 * @description Search poems by title (maintains the original specialization if needed).
 * @param {string} title De titel om op te zoeken. / The title to search for.
 * @returns {Promise<Array<object>>} Found poems
 */
export async function searchPoemsByTitle(title) {
    // This function can continue to exist if you want explicit "search by title only"
    // functionality, otherwise it can be removed if searchPoemsGeneral is sufficient.
    return searchByTitleInService(title);
}


/**
 * Zoek gedichten op auteur (behoudt de originele specialisatie als nodig).
 *
 * @description Search poems by author (maintains the original specialization if needed).
 * @param {string} author De auteur om op te zoeken. / The author to search for.
 * @returns {Promise<Array<object>>} Found poems
 */
export async function searchPoemsByAuthor(author) {
    return searchByAuthorInService(author);
}


/**
 * Concept voor een functie die zoeken met filters toepast.
 * Dit is een opzet die verder uitgewerkt kan worden.
 *
 * @description Concept for a function that applies filtered search.
 * This is a setup that can be further developed.
 *
 * @param {string} searchTerm De zoekterm / The search term
 * @param {Object} filters De toegepaste filters / The applied filters
 * @returns {Promise<Array<object>>} Gefilterde resultaten / Filtered results
 */
export async function searchPoemsWithFilters(searchTerm, filters = {}) {
    // 1. Get base search results
    const results = await searchPoemsGeneral(searchTerm);

    // If there are no filters, return immediately
    if (Object.keys(filters).length === 0) {
        return results;
    }

    // 2. Apply filters to the results
    let filteredResults = [...results];

    // Filter by language (if present)
    if (filters.language) {
        console.log(`Filtering by language: ${filters.language}`);
        filteredResults = filteredResults.filter(poem => {
            // Check if poem.language exists and matches
            return poem.language && poem.language.toLowerCase() === filters.language.toLowerCase();
        });
    }

    // Filter by period/year (if present)
    if (filters.yearFrom || filters.yearTo) {
        console.log(`Filtering by years: from ${filters.yearFrom || 'beginning'} to ${filters.yearTo || 'end'}`);
        filteredResults = filteredResults.filter(poem => {
            // If the poem has no year, we keep it
            if (!poem.year) return true;

            const year = parseInt(poem.year);
            if (isNaN(year)) return true; // Keep for invalid years

            // Check minimum year (if present)
            if (filters.yearFrom && parseInt(filters.yearFrom) > year) {
                return false;
            }

            // Check maximum year (if present)
            if (filters.yearTo && parseInt(filters.yearTo) < year) {
                return false;
            }

            return true;
        });
    }

    // Filter by poem length (lines, if present)
    if (filters.minLines || filters.maxLines) {
        console.log(`Filtering by line count: min ${filters.minLines || 'none'}, max ${filters.maxLines || 'none'}`);
        filteredResults = filteredResults.filter(poem => {
            // Check if there are lines
            if (!poem.lines || !Array.isArray(poem.lines)) return true;

            const lineCount = poem.lines.length;

            // Check minimum number of lines
            if (filters.minLines && parseInt(filters.minLines) > lineCount) {
                return false;
            }

            // Check maximum number of lines
            if (filters.maxLines && parseInt(filters.maxLines) < lineCount) {
                return false;
            }

            return true;
        });
    }

    // Filter by theme/keywords (if present)
    if (filters.theme) {
        console.log(`Filtering by theme/keywords: ${filters.theme}`);
        const themeWords = filters.theme.toLowerCase().split(/\s+/);

        filteredResults = filteredResults.filter(poem => {
            // Check if there are lines
            if (!poem.lines || !Array.isArray(poem.lines)) return false;

            // Check if one of the theme words appears in the poem
            return themeWords.some(word => {
                return poem.lines.some(line =>
                    line.toLowerCase().includes(word)
                );
            });
        });
    }

    console.log(`After applying filters: ${filteredResults.length} results remaining from ${results.length}`);
    return filteredResults;
}

