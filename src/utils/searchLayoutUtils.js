/**
 * Search Layout Utilities
 * Pure functions for search result layout logic
 * Extracted from SearchResults for better separation of concerns
 */

// TODO Util architectuur nakijken en begrijpen om deze utils te kunnen gebruiken in SearchResults
/**
 * Determines layout class based on result count and device
 * @param {number} resultCount - Number of search results
 * @param {boolean} isDesktop - Whether viewport is desktop size
 * @returns {string} CSS class name for layout
 */
export const getLayoutClass = (resultCount, isDesktop) => {
    // Mobile: altijd stacked ongeacht aantal
    if (!isDesktop) return 'mobileStacked';

    // Desktop: dynamische kolommen
    if (resultCount === 1) return 'singleResult';
    if (resultCount === 2) return 'twoColumns';
    if (resultCount === 3) return 'threeColumns';
    return 'threeColumnsCarousel'; // 4+ results -> 3 kolommen met carousel functionaliteit
};

/**
 * Calculates visible results for carousel mode
 * @param {Array} results - All search results
 * @param {number} currentIndex - Current carousel position
 * @param {number} resultCount - Total number of results
 * @param {boolean} isDesktop - Whether viewport is desktop size
 * @param {boolean} isCarousel - Whether in carousel mode (4+ results)
 * @returns {Array} Visible results for current view
 */
export const getVisibleResults = (results, currentIndex, resultCount, isDesktop, isCarousel) => {
    // Mobile: altijd alle resultaten tonen (stacked)
    if (!isDesktop) {
        return results;
    }

    // Desktop:
    if (resultCount <= 3) {
        return results; // Toon alle resultaten in kolommen (1, 2, of 3 kolommen)
    }

    // 4+ resultaten: carousel mode - toon 3 gedichten naast elkaar die rouleren
    if (isCarousel && resultCount > 3) {
        const visibleResults = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % resultCount;
            visibleResults.push(results[index]);
        }
        return visibleResults;
    }

    return results;
};

/**
 * Maps display index to actual result index in carousel mode
 * @param {number} displayIndex - Index in visible results (0-2)
 * @param {number} currentIndex - Current carousel position
 * @param {number} resultCount - Total number of results
 * @param {boolean} isCarousel - Whether in carousel mode
 * @returns {number} Actual index in results array
 */
export const getActualIndex = (displayIndex, currentIndex, resultCount, isCarousel) => {
    if (isCarousel && resultCount > 3) {
        return (currentIndex + displayIndex) % resultCount;
    }
    return displayIndex;
};

/**
 * Determines if layout should use carousel mode
 * @param {number} resultCount - Number of search results
 * @returns {boolean} Whether to use carousel mode
 */
export const isCarouselMode = (resultCount) => {
    return resultCount > 3;
};

/**
 * Creates indices set for height pre-calculation
 * @param {Array} results - All search results
 * @param {number} currentIndex - Current carousel position
 * @param {number} resultCount - Total number of results
 * @param {boolean} isCarousel - Whether in carousel mode
 * @param {boolean} isDesktop - Whether viewport is desktop size
 * @param {Function} getVisibleResults - Function to get visible results
 * @returns {Set} Set of indices that need height calculation
 */
export const getIndicesToCalculate = (results, currentIndex, resultCount, isCarousel, isDesktop, getVisibleResultsFn) => {
    const indicesToCalculate = new Set();

    // Alle zichtbare gedichten
    const visibleResults = getVisibleResultsFn(results, currentIndex, resultCount, isDesktop, isCarousel);
    visibleResults.forEach((poem, displayIndex) => {
        const actualIndex = getActualIndex(displayIndex, currentIndex, resultCount, isCarousel);
        indicesToCalculate.add(actualIndex);
    });

    // Voor carousel: ook volgende/vorige gedichten
    if (isCarousel && resultCount > 3) {
        const prevIndex = (currentIndex - 1 + resultCount) % resultCount;
        const nextIndex = (currentIndex + 1) % resultCount;
        indicesToCalculate.add(prevIndex);
        indicesToCalculate.add(nextIndex);
    }

    return indicesToCalculate;
};

/**
 * Maps visible results to their actual indices for state management
 * @param {Array} visibleResults - Results currently visible
 * @param {number} currentIndex - Current carousel position
 * @param {number} resultCount - Total number of results
 * @param {boolean} isCarousel - Whether in carousel mode
 * @returns {Array} Array of objects with {displayIndex, actualIndex}
 */
export const mapVisibleIndices = (visibleResults, currentIndex, resultCount, isCarousel) => {
    return visibleResults.map((poem, displayIndex) => ({
        displayIndex,
        actualIndex: getActualIndex(displayIndex, currentIndex, resultCount, isCarousel),
        poem
    }));
};

/**
 * Determines if viewport is desktop size
 * @returns {boolean} Whether viewport is desktop size
 */
export const getIsDesktop = () => {
    return window.innerWidth > 768;
};