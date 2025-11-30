/**
 * Utility functions for intelligent carousel indicators
 *
 * System:
 * - Up to 10 poems: show all dots, active ones are crossed out
 * - 11+ poems: maximum 10 dots that slide
 * - Roman notation shows the "decade" we are in (X = 10-19, XX = 20-29, etc.)
 */

import {getDecadeRoman, generateDropdownDecades} from './romanNumerals.js';

/**
 * Calculate indicator configuration for carousel
 * @param {number} totalCount - Total number of poems
 * @param {number} currentIndex - Current carousel index (0-based)
 * @returns {Object} Configuration for dots and Roman numerals
 */
export const calculateIndicatorConfig = (totalCount, currentIndex) => {
    // For 1-3 poems: no carousel
    if (totalCount <= 3) {
        return {
            showIndicator: false
        };
    }

    // For 4-10 poems: show all dots
    if (totalCount <= 10) {
        const activeDots = new Set();
        for (let i = 0; i < 3; i++) {
            activeDots.add((currentIndex + i) % totalCount);
        }

        return {
            showIndicator: true,
            mode: 'static-dots',
            totalDots: totalCount,
            activeDots: activeDots,
            showRoman: false,
            currentRange: {
                start: currentIndex + 1,
                end: Math.min(currentIndex + 2, totalCount),
                third: Math.min(currentIndex + 3, totalCount)
            }
        };
    }

    // For 11+ poems: sliding dots (max 10) + Roman decade indicator
    const MAX_DOTS = 10;

    // Calculate which poems are visible (3 at a time)
    const visibleIndices = [];
    const rawIndices = []; // For debugging
    for (let i = 0; i < 3; i++) {
        const rawIndex = currentIndex + i;
        rawIndices.push(rawIndex);
        visibleIndices.push(rawIndex % totalCount);
    }

    // Check for wrap-around situation (e.g. 69, 70, 0)
    const isWrapping = visibleIndices[2] < visibleIndices[0];

    // Determine the "decade" we are in
    const currentDecade = Math.floor(currentIndex / 10);
    // const lastDecade = Math.floor((totalCount - 1) / 10);
    const romanDecade = currentDecade > 0 ? getDecadeRoman(currentDecade) : '';

    // Check if we are spanning across a decade boundary
    let isSpanningDecades = false;
    let nextDecade = -1;

    if (isWrapping) {
        // On wrap-around: we go from last decade to first
        isSpanningDecades = true;
        nextDecade = 0;
    } else {
        // Normal situation: check if all indices are in the same decade
        const decades = visibleIndices.map(idx => Math.floor(idx / 10));
        isSpanningDecades = !decades.every(d => d === currentDecade);
        if (isSpanningDecades) {
            nextDecade = currentDecade + 1;
        }
    }

    // Calculate the dot window (which 10 dots we show)
    let dotWindowStart = currentDecade * 10;
    let dotsInWindow = Math.min(MAX_DOTS, totalCount - dotWindowStart);

    // Map visible poems to dot positions
    const activeDots = new Set();
    const activeDotsNextDecade = new Set();
    const activeDotsFirstDecade = new Set(); // For wrap-around

    visibleIndices.forEach(idx => {
        const decade = Math.floor(idx / 10);
        const dotPosition = idx % 10;

        if (decade === currentDecade) {
            activeDots.add(dotPosition);
        } else if (isWrapping && decade === 0) {
            // Wrap-around to first decade
            activeDotsFirstDecade.add(dotPosition);
        } else if (decade === nextDecade) {
            activeDotsNextDecade.add(dotPosition);
        }
    });

    const currentRange = {
        start: visibleIndices[0] + 1,
        end: Math.min(visibleIndices[1] + 1, totalCount),
        third: Math.min(visibleIndices[2] + 1, totalCount),
        wrappedEnd: isWrapping ? visibleIndices[2] + 1 : null
    };


    return {
        showIndicator: true,
        mode: 'sliding-dots',
        totalCount,
        totalDots: dotsInWindow,
        dotWindowStart,
        activeDots,
        activeDotsNextDecade: isSpanningDecades && !isWrapping ? activeDotsNextDecade : null,
        activeDotsFirstDecade: isWrapping ? activeDotsFirstDecade : null,
        showRoman: currentDecade > 0,
        romanNumeral: romanDecade,
        nextDecadeRoman: isSpanningDecades && !isWrapping ? getDecadeRoman(nextDecade) : null,
        isSpanningDecades,
        isWrapping,
        currentRange
    };
};

/**
 * Format the indicator elements for rendering
 * @param {Object} config - Indicator configuration
 * @returns {Array} Array of elements to render
 */
export const formatIndicatorElements = (config) => {
    if (!config.showIndicator) return [];

    const elements = [];

    // If we have a Roman decade, add it at the beginning
    if (config.showRoman && config.romanNumeral) {
        elements.push({
            type: 'roman',
            numeral: config.romanNumeral,
            key: 'roman-decade',
            isDecadeIndicator: true
        });

        elements.push({
            type: 'separator',
            content: '+',
            key: 'sep-roman'
        });
    }

    // Add all dots for current decade
    for (let i = 0; i < config.totalDots; i++) {
        const poemNumber = config.mode === 'sliding-dots'
            ? config.dotWindowStart + i + 1
            : i + 1;

        elements.push({
            type: 'dot',
            active: config.activeDots.has(i),
            key: `dot-${i}`,
            poemNumber: poemNumber
        });
    }

    // If we span across decades, add extra dots
    if (config.isSpanningDecades) {
        elements.push({
            type: 'separator',
            content: '—',  // Em dash for decade transition
            key: 'sep-next-decade',
            isDecadeSeparator: true
        });

        // Special handling for wrap-around (e.g. 69, 70, 0)
        if (config.isWrapping && config.activeDotsFirstDecade) {
            // No Roman numeral on wrap to beginning
            // Directly show the dots of the first decade
            for (let i = 0; i < 3; i++) {
                if (config.activeDotsFirstDecade.has(i)) {
                    elements.push({
                        type: 'dot',
                        active: true,
                        key: `wrap-dot-${i}`,
                        poemNumber: i + 1
                    });
                } else if (i < Math.min(3, config.totalCount)) {
                    elements.push({
                        type: 'dot',
                        active: false,
                        key: `wrap-dot-${i}`,
                        poemNumber: i + 1,
                        isPlaceholder: true
                    });
                }
            }
        }
        // Normal decade transition
        else if (config.activeDotsNextDecade) {
            // Add the next decade Roman numeral if needed
            if (config.nextDecadeRoman) {
                elements.push({
                    type: 'roman',
                    numeral: config.nextDecadeRoman,
                    key: 'roman-next-decade',
                    isDecadeIndicator: true
                });

                elements.push({
                    type: 'separator',
                    content: '+',
                    key: 'sep-next-roman'
                });
            }

            // Add the active dots of the next decade
            for (let i = 0; i < 3; i++) {
                if (config.activeDotsNextDecade.has(i)) {
                    elements.push({
                        type: 'dot',
                        active: true,
                        key: `next-dot-${i}`,
                        poemNumber: (config.dotWindowStart + 10 + i + 1)
                    });
                } else {
                    elements.push({
                        type: 'dot',
                        active: false,
                        key: `next-dot-${i}`,
                        poemNumber: (config.dotWindowStart + 10 + i + 1),
                        isPlaceholder: true
                    });
                }
            }
        }
    }

    return elements;
};

/**
 * Helper function for dot click navigation
 * @param {number} dotIndex - Clicked dot index
 * @param {Object} config - Current configuration
 * @returns {number|null} New carousel index or null if not possible
 */
export const calculateDotNavigation = (dotIndex, config) => {
    if (config.mode === 'dots-only' || config.mode === 'static-dots') {
        // For 4-10 poems: direct mapping with bounds checking
        const targetIndex = dotIndex;
        return Math.min(Math.max(targetIndex, 0), config.totalCount - 1);
    }

    if (config.mode === 'sliding-dots') {
        // For 11+ poems: map dot index to poem index within current decade
        const targetIndex = config.dotWindowStart + dotIndex;

        // Bounds checking to prevent index >= totalCount
        if (targetIndex >= config.totalCount) {
            return config.totalCount - 1;
        }

        const boundedIndex = Math.max(targetIndex, 0);
        return boundedIndex;
    }

    return null;
};

/**
 * Calculate all available decades for navigation dropdown
 * @param {number} totalCount - Total number of poems
 * @returns {Array} Array of decade objects for navigation
 */
export const getAvailableDecades = (totalCount) => {
    return generateDropdownDecades(totalCount);
};