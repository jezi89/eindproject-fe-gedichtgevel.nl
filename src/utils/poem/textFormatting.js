// TODO Werking en gebruik van deze utility functie voor text formatting controleren

/**
 * Text formatting utilities for poem display
 * Extracted from PoemResultItem for reusability
 */

/**
 * Get text with tooltip for long content
 * @param {string} text - The text to format
 * @param {number} maxLength - Maximum length before truncation
 * @returns {Object} Object with display text and optional title
 */
export const getTitleWithTooltip = (text, maxLength = 50) => {
    if (!text) {
        return {display: '', title: undefined};
    }

    if (text.length > maxLength) {
        return {
            display: text.substring(0, maxLength) + '...',
            title: text
        };
    }

    return {display: text, title: undefined};
};

/**
 * Format poem title for display
 * @param {string} title - The poem title
 * @param {number} maxLength - Maximum display length
 * @returns {Object} Formatted title object
 */
export const formatPoemTitle = (title, maxLength = 60) => {
    return getTitleWithTooltip(title, maxLength);
};

/**
 * Format author name for display
 * @param {string} author - The author name
 * @param {number} maxLength - Maximum display length
 * @returns {Object} Formatted author object
 */
export const formatAuthorName = (author, maxLength = 30) => {
    const formatted = getTitleWithTooltip(author, maxLength);
    return {
        ...formatted,
        displayWithPrefix: formatted.display ? `By ${formatted.display}` : 'Unknown Author'
    };
};

/**
 * Validate poem object has required properties
 * @param {Object} poem - The poem object to validate
 * @returns {boolean} Whether poem is valid
 */
export const isValidPoem = (poem) => {
    return poem &&
        typeof poem === 'object' &&
        poem.title &&
        poem.author &&
        Array.isArray(poem.lines);
};

/**
 * Get poem display properties with validation
 * Always returns an object to avoid conditional rendering issues
 * @param {Object} poem - The poem object
 * @returns {Object} Display properties (never null)
 */
export const getPoemDisplayProps = (poem) => {
    // Always return an object to prevent conditional hook issues
    if (!poem || typeof poem !== 'object') {
        return {
            title: {display: 'Untitled', title: undefined},
            author: {display: 'Unknown', displayWithPrefix: 'By Unknown', title: undefined},
            lineCount: 0,
            isShort: true,
            isValid: false
        };
    }

    return {
        title: formatPoemTitle(poem.title || 'Untitled'),
        author: formatAuthorName(poem.author || 'Unknown'),
        lineCount: poem.lines?.length || 0,
        isShort: !poem.lines || poem.lines.length <= 4,
        isValid: isValidPoem(poem)
    };
};
