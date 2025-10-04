/**
 * Era Mapping Utility
 * Maps authors to literary eras based on their birth year
 */

import authorLifespans from '@/data/canvas/author_lifespans.json';

/**
 * Literary era definitions with year ranges
 */
export const ERAS = {
    ALL: { id: 'all', label: 'Alle Tijdperken', minYear: null, maxYear: null },
    RENAISSANCE: { id: 'renaissance', label: 'Renaissance (<1800)', minYear: 0, maxYear: 1799 },
    ROMANTIC: { id: 'romantic', label: 'Romantiek (1800-1870)', minYear: 1800, maxYear: 1870 },
    VICTORIAN: { id: 'victorian', label: 'Victoriaans (1830-1900)', minYear: 1830, maxYear: 1900 },
    MODERNIST: { id: 'modernist', label: 'Modernisme (1890-1945)', minYear: 1890, maxYear: 1945 },
    CONTEMPORARY: { id: 'contemporary', label: 'Hedendaags (>1945)', minYear: 1945, maxYear: 9999 },
    UNKNOWN: { id: 'unknown', label: 'Onbekend', minYear: null, maxYear: null }
};

/**
 * Create a Map for fast author birth year lookups
 * Key: author name (normalized)
 * Value: birth year (number or null)
 */
export const authorBirthYearMap = new Map(
    authorLifespans.map(entry => [
        normalizeAuthorName(entry.author),
        entry.birth_year
    ])
);

/**
 * Normalize author name for consistent lookups
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove special characters in parentheses for better matching
 *
 * @param {string} authorName - Raw author name
 * @returns {string} Normalized author name
 */
export function normalizeAuthorName(authorName) {
    if (!authorName) return '';

    return authorName
        .trim()
        .toLowerCase()
        // Remove content in parentheses (e.g., "Samuel Johnson (schrijver)" -> "samuel johnson")
        .replace(/\s*\([^)]*\)/g, '')
        .trim();
}

/**
 * Get birth year for an author
 *
 * @param {string} authorName - Author name to lookup
 * @returns {number|null} Birth year or null if not found
 */
export function getAuthorBirthYear(authorName) {
    if (!authorName) return null;

    const normalized = normalizeAuthorName(authorName);
    return authorBirthYearMap.get(normalized) || null;
}

/**
 * Map a birth year to a literary era
 *
 * @param {number|null} birthYear - Author's birth year
 * @returns {string} Era ID (e.g., 'romantic', 'unknown')
 */
export function mapBirthYearToEra(birthYear) {
    if (birthYear === null || birthYear === undefined) {
        return ERAS.UNKNOWN.id;
    }

    // Check each era (order matters for overlapping ranges)
    if (birthYear < ERAS.RENAISSANCE.maxYear) return ERAS.RENAISSANCE.id;
    if (birthYear >= ERAS.ROMANTIC.minYear && birthYear <= ERAS.ROMANTIC.maxYear) return ERAS.ROMANTIC.id;
    if (birthYear >= ERAS.VICTORIAN.minYear && birthYear <= ERAS.VICTORIAN.maxYear) return ERAS.VICTORIAN.id;
    if (birthYear >= ERAS.MODERNIST.minYear && birthYear <= ERAS.MODERNIST.maxYear) return ERAS.MODERNIST.id;
    if (birthYear >= ERAS.CONTEMPORARY.minYear) return ERAS.CONTEMPORARY.id;

    return ERAS.UNKNOWN.id;
}

/**
 * Get the era for an author by name
 *
 * @param {string} authorName - Author name
 * @returns {string} Era ID
 */
export function getAuthorEra(authorName) {
    const birthYear = getAuthorBirthYear(authorName);
    return mapBirthYearToEra(birthYear);
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
 * Get era label by ID
 *
 * @param {string} eraId - Era ID
 * @returns {string} Era label
 */
export function getEraLabel(eraId) {
    const era = Object.values(ERAS).find(e => e.id === eraId);
    return era ? era.label : ERAS.ALL.label;
}
