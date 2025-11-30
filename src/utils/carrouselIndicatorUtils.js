/**
 * Utility functies voor intelligente carousel indicatoren
 *
 * Systeem:
 * - Tot 10 gedichten: toon alle dots, actieve zijn doorgestreept
 * - 11+ gedichten: maximaal 10 dots die doorschuiven
 * - Romeinse notatie toont het "tiental" waarin we zitten (X = 10-19, XX = 20-29, etc.)
 */

import {toRoman, getDecadeRoman, generateDecades, generateDropdownDecades} from './romanNumerals.js';

/**
 * Bereken indicator configuratie voor carousel
 * @param {number} totalCount - Totaal aantal gedichten
 * @param {number} currentIndex - Huidige carousel index (0-based)
 * @returns {Object} Configuratie voor dots en Romeinse cijfers
 */
export const calculateIndicatorConfig = (totalCount, currentIndex) => {
    // Voor 1-3 gedichten: geen carousel
    if (totalCount <= 3) {
        return {
            showIndicator: false
        };
    }

    // Voor 4-10 gedichten: toon alle dots
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

    // Voor 11+ gedichten: sliding dots (max 10) + romeinse tiental indicator
    const MAX_DOTS = 10;

    // Bereken welke gedichten zichtbaar zijn (3 tegelijk)
    const visibleIndices = [];
    const rawIndices = []; // Voor debugging
    for (let i = 0; i < 3; i++) {
        const rawIndex = currentIndex + i;
        rawIndices.push(rawIndex);
        visibleIndices.push(rawIndex % totalCount);
    }

    // Check voor wrap-around situatie (bijv. 69, 70, 0)
    const isWrapping = visibleIndices[2] < visibleIndices[0];

    // Bepaal het "tiental" waarin we zitten
    const currentDecade = Math.floor(currentIndex / 10);
    const lastDecade = Math.floor((totalCount - 1) / 10);
    const romanDecade = currentDecade > 0 ? getDecadeRoman(currentDecade) : '';

    // Check of we over een tiental grens heen gaan
    let isSpanningDecades = false;
    let nextDecade = -1;

    if (isWrapping) {
        // Bij wrap-around: we gaan van laatste tiental naar eerste
        isSpanningDecades = true;
        nextDecade = 0;
    } else {
        // Normale situatie: check of alle indices in zelfde decade zijn
        const decades = visibleIndices.map(idx => Math.floor(idx / 10));
        isSpanningDecades = !decades.every(d => d === currentDecade);
        if (isSpanningDecades) {
            nextDecade = currentDecade + 1;
        }
    }

    // Bereken de dot window (welke 10 dots we tonen)
    let dotWindowStart = currentDecade * 10;
    let dotsInWindow = Math.min(MAX_DOTS, totalCount - dotWindowStart);

    // Map zichtbare gedichten naar dot posities
    const activeDots = new Set();
    const activeDotsNextDecade = new Set();
    const activeDotsFirstDecade = new Set(); // Voor wrap-around

    visibleIndices.forEach(idx => {
        const decade = Math.floor(idx / 10);
        const dotPosition = idx % 10;

        if (decade === currentDecade) {
            activeDots.add(dotPosition);
        } else if (isWrapping && decade === 0) {
            // Wrap-around naar eerste tiental
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
 * Format de indicator elementen voor rendering
 * @param {Object} config - Indicator configuratie
 * @returns {Array} Array van elementen om te renderen
 */
export const formatIndicatorElements = (config) => {
    if (!config.showIndicator) return [];

    const elements = [];

    // Als we een romeins tiental hebben, voeg het toe aan het begin
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

    // Voeg alle dots toe voor huidige tiental
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

    // Als we over tientallen heen gaan, voeg extra dots toe
    if (config.isSpanningDecades) {
        elements.push({
            type: 'separator',
            content: '—',  // Em dash voor tiental overgang
            key: 'sep-next-decade',
            isDecadeSeparator: true
        });

        // Speciale behandeling voor wrap-around (bijv. 69, 70, 0)
        if (config.isWrapping && config.activeDotsFirstDecade) {
            // Geen romeins cijfer bij wrap naar begin
            // Direct de dots van het eerste tiental
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
        // Normale tiental overgang
        else if (config.activeDotsNextDecade) {
            // Voeg het volgende tiental romeins cijfer toe indien nodig
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

            // Voeg de actieve dots van het volgende tiental toe
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
 * Helper functie voor dot click navigatie
 * @param {number} dotIndex - Geklikte dot index
 * @param {Object} config - Huidige configuratie
 * @returns {number|null} Nieuwe carousel index of null als niet mogelijk
 */
export const calculateDotNavigation = (dotIndex, config) => {
    if (config.mode === 'dots-only' || config.mode === 'static-dots') {
        // Voor 4-10 gedichten: directe mapping met bounds checking
        const targetIndex = dotIndex;
        return Math.min(Math.max(targetIndex, 0), config.totalCount - 1);
    }

    if (config.mode === 'sliding-dots') {
        // Voor 11+ gedichten: map dot index naar gedicht index binnen huidige decade
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
 * Bereken alle beschikbare decades voor navigatie dropdown
 * @param {number} totalCount - Totaal aantal gedichten
 * @returns {Array} Array van decade objecten voor navigatie
 */
export const getAvailableDecades = (totalCount) => {
    return generateDropdownDecades(totalCount);
};