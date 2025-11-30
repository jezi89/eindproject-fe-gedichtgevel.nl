/**
 * Roman Numerals Utility Functions
 *
 * Comprehensive system for converting numbers to Roman numerals
 * and handling Roman numeral display logic for carousel indicators
 */

/**
 * Roman numeral conversion table
 * Ordered from largest to smallest for conversion algorithm
 */
const ROMAN_NUMERALS = [
    {value: 1000, numeral: 'M'},
    {value: 900, numeral: 'CM'},
    {value: 500, numeral: 'D'},
    {value: 400, numeral: 'CD'},
    {value: 100, numeral: 'C'},
    {value: 90, numeral: 'XC'},
    {value: 50, numeral: 'L'},
    {value: 40, numeral: 'XL'},
    {value: 10, numeral: 'X'},
    {value: 9, numeral: 'IX'},
    {value: 5, numeral: 'V'},
    {value: 4, numeral: 'IV'},
    {value: 1, numeral: 'I'}
];

/**
 * Convert a number to Roman numerals
 * @param {number} num - The number to convert (1-3999)
 * @returns {string} Roman numeral representation
 */
export const toRoman = (num) => {
    if (num === 0) return '';
    if (num < 1 || num > 3999) {
        throw new Error('Roman numerals only support numbers between 1 and 3999');
    }

    let result = '';
    let remaining = num;

    for (const {value, numeral} of ROMAN_NUMERALS) {
        while (remaining >= value) {
            result += numeral;
            remaining -= value;
        }
    }

    return result;
};

/**
 * Convert Roman numerals back to a number
 * @param {string} roman - Roman numeral string
 * @returns {number} The numeric value
 */
//     const cleanRoman = roman.toUpperCase().trim();
//     let result = 0;
//     let i = 0;

//     for (const {value, numeral} of ROMAN_NUMERALS) {
//         while (cleanRoman.substring(i, i + numeral.length) === numeral) {
//             result += value;
//             i += numeral.length;
//         }
//     }

//     return result;
// };

/**
 * Get the Roman numeral for a decade (multiple of 10)
 * Used for carousel decade indicators
 * @param {number} decadeNumber - The decade number (0, 1, 2, etc.)
 * @returns {string} Roman numeral for the decade
 */
export const getDecadeRoman = (decadeNumber) => {
    if (decadeNumber === 0) return '';
    return toRoman(decadeNumber * 10);
};

/**
 * Get Roman numeral for dropdown decades
 * Special formatting: X, XX, XXX for first 3 decades, then proper Roman numerals
 * @param {number} decadeNumber - The decade number (0, 1, 2, etc.)
 * @returns {string} Roman numeral for dropdown display
 */
const getDropdownDecadeRoman = (decadeNumber) => {
    if (decadeNumber === 0) return 'X'; // 1-10
    if (decadeNumber === 1) return 'XX'; // 11-20
    if (decadeNumber === 2) return 'XXX'; // 21-30

    // For decade 3 and higher, use proper Roman numerals
    // Decade 3 = 31-40 = XL, Decade 4 = 41-50 = L, etc.
    const decadeStart = (decadeNumber + 1) * 10; // +1 because we want the start of next decade range
    return toRoman(decadeStart);
};

/**
 * Format a range display with Roman numerals for decades
 * @param {number} startIndex - Start index (0-based)
 * @param {number} endIndex - End index (0-based)
 * @param {number} totalCount - Total number of items
 * @param {boolean} useDropdownFormat - Whether to use simplified dropdown format (X, XX, XXX)
 * @returns {Object} Formatted range information
 */

const formatDecadeRange = (startIndex, endIndex, totalCount, useDropdownFormat = false) => {
    const startDecade = Math.floor(startIndex / 10);
    // const endDecade = Math.floor(endIndex / 10);

    // Choose Roman numeral format based on usage
    const romanNumeral = useDropdownFormat
        ? getDropdownDecadeRoman(startDecade)
        : (startDecade === 0 ? 'I-X' : getDecadeRoman(startDecade));

    const displayStart = startIndex + 1; // Convert to 1-based
    const displayEnd = endIndex + 1; // Convert to 1-based

    return {
        romanNumeral,
        displayName: `${displayStart}-${displayEnd}`,
        startIndex,
        endIndex,
        isFirstDecade: startDecade === 0
    };
};

/**
 * Generate all available decades for a given total count
 * Used for dropdown navigation
 * @param {number} totalCount - Total number of items
 * @returns {Array} Array of decade objects
 */
export const generateDecades = (totalCount) => {
    if (totalCount <= 10) return [];

    const decades = [];
    const totalDecades = Math.ceil(totalCount / 10);

    for (let i = 0; i < totalDecades; i++) {
        const startIndex = i * 10;
        const endIndex = Math.min((i + 1) * 10 - 1, totalCount - 1);
        const rangeInfo = formatDecadeRange(startIndex, endIndex, totalCount);

        decades.push({
            decade: i,
            romanNumeral: rangeInfo.romanNumeral,
            displayName: rangeInfo.displayName,
            startIndex: startIndex,
            endIndex: endIndex,
            poemCount: endIndex - startIndex + 1,
            isFirstDecade: rangeInfo.isFirstDecade
        });
    }

    return decades;
};

/**
 * Generate decades specifically formatted for dropdown display
 * Uses simplified Roman numerals: X, XX, XXX, etc.
 * @param {number} totalCount - Total number of items
 * @returns {Array} Array of decade objects formatted for dropdown
 */
export const generateDropdownDecades = (totalCount) => {
    if (totalCount <= 10) return [];

    const decades = [];
    const totalDecades = Math.ceil(totalCount / 10);

    for (let i = 0; i < totalDecades; i++) {
        const startIndex = i * 10;
        const endIndex = Math.min((i + 1) * 10 - 1, totalCount - 1);
        const rangeInfo = formatDecadeRange(startIndex, endIndex, totalCount, true); // Use dropdown format

        const displayStart = startIndex + 1;
        const displayEnd = endIndex + 1;

        decades.push({
            decade: i,
            romanNumeral: rangeInfo.romanNumeral,
            displayName: `Gedicht ${displayStart} tot ${displayEnd}`,
            startIndex: startIndex,
            endIndex: endIndex,
            poemCount: endIndex - startIndex + 1,
            isFirstDecade: rangeInfo.isFirstDecade
        });
    }

    return decades;
};

/**
 * Get the appropriate Roman numeral for display in carousel indicators
 * @param {number} currentIndex - Current carousel position (0-based)
 * @param {number} totalCount - Total number of items
 * @returns {Object} Roman numeral display information
 */
//     if (currentDecade === 0) {
//         return {
//             showRoman: false,
//             romanNumeral: '',
//             decadeStart: 0,
//             decadeEnd: Math.min(9, totalCount - 1)
//         };
//     }

//     const romanNumeral = getDecadeRoman(currentDecade);
//     const decadeStart = currentDecade * 10;
//     const decadeEnd = Math.min((currentDecade + 1) * 10 - 1, totalCount - 1);

//     return {
//         showRoman: true,
//         romanNumeral,
//         decadeStart,
//         decadeEnd,
//         currentDecade
//     };
// };

/**
 * Validate Roman numeral string
 * @param {string} roman - Roman numeral to validate
 * @returns {boolean} True if valid Roman numeral
 */
//     const cleanRoman = roman.toUpperCase().trim();
//     const validPattern = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

//     return validPattern.test(cleanRoman);
// };

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 * Useful for alternative display formats
 * @param {number} num - The number
 * @returns {string} Number with ordinal suffix
 */
//     if (j === 1 && k !== 11) return num + 'st';
//     if (j === 2 && k !== 12) return num + 'nd';
//     if (j === 3 && k !== 13) return num + 'rd';

//     return num + 'th';
// };

// Export constants for external use