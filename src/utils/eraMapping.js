/**
 * Era Mapping Utility
 * Maps authors to literary eras based on their birth year
 */

import authorLifespans from '@/data/author_lifespans.json';

/**
 * Literary era definitions with year ranges
 */
export const ERAS = {
    ALL: {
        id: 'all',
        label: 'Alle Tijdperken',
        minYear: null,
        maxYear: null,
    },
    MEDIEVAL: {
        id: 'medieval',
        label: 'Middeleeuwen (<1500)',
        minYear: 0,
        maxYear: 1499,
    },
    RENAISSANCE: {
        id: 'renaissance',
        label: 'Renaissance (1500–1600)',
        minYear: 1500,
        maxYear: 1599,
    },
    BAROQUE: {
        id: 'baroque',
        label: 'Barok (1600–1700)',
        minYear: 1600,
        maxYear: 1699,
    },
    CLASSICISM: {
        id: 'classicism',
        label: 'Classicisme (1660–1750)',
        minYear: 1660,
        maxYear: 1750,
    },
    ENLIGHTENMENT: {
        id: 'enlightenment',
        label: 'Verlichting (1700–1800)',
        minYear: 1700,
        maxYear: 1799,
    },
    ROMANTIC: {
        id: '(pre-)romantic',
        label: 'Romantiek (1800–1870)',
        minYear: 1770,
        maxYear: 1870,
    },
    VICTORIAN: {
        id: 'victorian',
        label: 'Victoriaans (1830–1900)',
        minYear: 1830,
        maxYear: 1900,
    },
    MODERNIST: {
        id: 'modernist',
        label: 'Modernisme (1890–1945)',
        minYear: 1890,
        maxYear: 1945,
    },
    CONTEMPORARY: {
        id: 'contemporary',
        label: 'Hedendaags (komt in V2)',
        minYear: 1945,
        maxYear: 9999,
    },
    UNKNOWN: {
        id: 'unknown',
        label: 'Leefperiode Onbekend',
        minYear: null,
        maxYear: null,
    },
};

/**
 * Normalize author name for consistent lookups
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove special characters in parentheses for better matching
 *
 * @param {string} authorName - Raw author name
 * @returns {string} Normalized author name
 * @internal
 */
function normalizeAuthorName(authorName) {
    if (!authorName) return '';

    return authorName
        .trim()
        .toLowerCase()
        // Remove content in parentheses (e.g., "Samuel Johnson (schrijver)" -> "samuel johnson")
        .replace(/\s*\([^)]*\)/g, '')
        .trim();
}

/**
 * Calculate the active middle year of a poet's life
 * Uses average of birth and death year, or estimates based on available data
 *
 * @param {number|null} birthYear - Birth year
 * @param {number|null} deathYear - Death year
 * @returns {number|null} Active middle year or null
 * @internal
 */
function getActiveMiddleYear(birthYear, deathYear) {
    if (birthYear != null && deathYear != null) {
        // Both known: average
        return Math.round((birthYear + deathYear) / 2);
    }
    if (birthYear != null) {
        // Only birth year known: add typical active age
        return birthYear + 35;
    }
    if (deathYear != null) {
        // Only death year known: subtract typical active age
        return deathYear - 35;
    }
    // Both unknown
    return null;
}

/**
 * Map an active middle year to a literary era
 *
 * @param {number|null} activeMiddleYear - Active middle year of the author
 * @returns {string} Era ID (e.g., 'romantic', 'unknown')
 * @internal
 */
function mapActiveMiddleToEra(activeMiddleYear) {
    if (activeMiddleYear === null || activeMiddleYear === undefined) {
        return ERAS.UNKNOWN.id;
    }
    for (const era of Object.values(ERAS)) {
        if (
            era.id === 'all' ||
            era.id === 'unknown' ||
            era.minYear === null ||
            era.maxYear === null
        ) {
            continue;
        }
        if (activeMiddleYear >= era.minYear && activeMiddleYear <= era.maxYear) {
            return era.id;
        }
    }
    return ERAS.UNKNOWN.id;
}

/**
 * Get the era for an author by name
 *
 * @param {string} authorName - Author name
 * @returns {string} Era ID
 * @internal
 */
function getAuthorEra(authorName) {
    const activeMiddle = getAuthorActiveMiddle(authorName);
    return mapActiveMiddleToEra(activeMiddle);
}

/**
 * Get the active middle year for an author
 *
 * @param {string} authorName - Author name
 * @returns {number|null} Active middle year or null
 * @internal
 */
function getAuthorActiveMiddle(authorName) {
    if (!authorName) return null;
    const normalized = normalizeAuthorName(authorName);
    const entry = authorLifespans.find(e => normalizeAuthorName(e.author) === normalized);
    if (!entry) return null;
    return getActiveMiddleYear(entry.birth_year, entry.death_year);
}

/**
 * Filter poems by era
 *
 * @param {Array} poems - Array of poem objects
 * @param {string} selectedEraId - Era ID to filter by (or 'all')
 * @returns {Array} Filtered poems
 */
export function filterPoemsByEra(poems, selectedEraId) {
    if (!selectedEraId || selectedEraId === ERAS.ALL.id) {
        return poems;
    }

    return poems.filter(poem => {
        const authorEra = getAuthorEra(poem.author);
        return authorEra === selectedEraId;
    });
}

/**
 * Count the number of authors per era
 *
 * @param {Object} options - Options
 * @param {boolean} options.excludeContemporary - Exclude contemporary era from count
 * @returns {Object} Object with era IDs as keys and author counts as values
 */
export function countAuthorsPerEra({ excludeContemporary = false } = {}) {
    const counts = {};
    Object.values(ERAS).forEach(era => {
        if (era.id === 'all') return;
        if (excludeContemporary && era.id === 'contemporary') return;
        counts[era.id] = 0;
    });
    authorLifespans.forEach(entry => {
        const activeMiddle = getActiveMiddleYear(entry.birth_year, entry.death_year);
        const eraId = mapActiveMiddleToEra(activeMiddle);
        if (counts.hasOwnProperty(eraId)) {
            counts[eraId]++;
        }
    });
    return counts;
}
