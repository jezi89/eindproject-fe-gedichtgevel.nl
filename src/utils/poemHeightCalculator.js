// TODO Checken of deze poemHeighCalculator.js versimpelt kan worden, aangezien we 500 regels code hebben.. Zie ook ref.poemHeighCalculator.js

/**
 * Utility functies voor nauwkeurige berekening van gedicht uitklap hoogtes
 * Houdt rekening met responsive design en verschillende schermgroottes
 */

// TODO Checken hoe deze functie werkt en linting errors oplossen

/**
 * Calculate minimum expanded height to ensure it's never smaller than preview
 * @param {Object} poem - The poem object
 * @param {number} screenWidth - Current screen width
 * @returns {number} Minimum height for expanded container
 */
export const calculateMinimumExpandedHeight = (poem, screenWidth = window.innerWidth) => {
    if (!poem?.lines) return 120;

    const config = getBaseConfig(screenWidth);

    // Calculate actual preview container height:
    // - 4 preview lines
    // - ellipsis/hidden indicator
    // - expand button
    // - padding and margins
    const baseLineHeight = config.fontSize * config.lineHeight;
    const previewLinesHeight = 4 * baseLineHeight;
    const ellipsisHeight = 30;
    const expandButtonHeight = config.buttonHeight + config.buttonMargin;
    const containerPadding = config.padding * 2;

    const previewContainerHeight = previewLinesHeight + ellipsisHeight + expandButtonHeight + containerPadding;

    // Calculate expanded content height for hidden lines only
    const hiddenLinesCount = Math.max(0, poem.lines.length - 4);
    const hiddenLinesHeight = hiddenLinesCount * baseLineHeight;
    const actionButtonsHeight = 50;
    const separatorHeight = 40; // Space for the visual separator
    const extraPadding = 30;

    const expandedContentHeight = hiddenLinesHeight + actionButtonsHeight + separatorHeight + extraPadding;

    // Always ensure expanded is at least as tall as preview + buffer
    // Extra buffer now includes separator space
    const minimumHeight = previewContainerHeight + 60; // 60px buffer (includes separator)

    return Math.max(minimumHeight, expandedContentHeight);
};

/**
 * Determine if a poem should use small poem animation (≤10 lines)
 * @param {Object} poem - The poem object
 * @returns {boolean} True if poem should use small poem animations
 */
export const isSmallPoem = (poem) => {
    return poem?.lines && poem.lines.length <= 10;
};

// Constanten voor verschillende breakpoints (moet overeenkomen met CSS)
const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1400
};

// Base configuratie voor verschillende schermgroottes - gebaseerd op werkelijke CSS
const getBaseConfig = (screenWidth) => {
    if (screenWidth <= BREAKPOINTS.mobile) {
        return {
            fontSize: 16, // var(--font-size-xl) equivalent
            lineHeight: 1.5, // CSS: line-height: 1.5
            padding: 16, // var(--spacing-md)
            buttonHeight: 44,
            buttonMargin: 8 // Minder margin
        };
    }

    if (screenWidth <= BREAKPOINTS.tablet) {
        return {
            fontSize: 20, // var(--font-size-2xl) equivalent
            lineHeight: 1.5, // CSS: line-height: 1.5
            padding: 24, // var(--spacing-lg)
            buttonHeight: 48,
            buttonMargin: 8
        };
    }

    if (screenWidth <= BREAKPOINTS.desktop) {
        return {
            fontSize: 20, // var(--font-size-2xl) equivalent
            lineHeight: 1.5, // CSS: line-height: 1.5
            padding: 32, // var(--spacing-xl)
            buttonHeight: 48,
            buttonMargin: 8
        };
    }

    // Desktop en groter - gebaseerd op .poemLine CSS
    return {
        fontSize: 18, // CSS: font-size: 18px
        lineHeight: 1.625, // CSS: line-height: 1.625
        padding: 32, // CSS: padding: var(--spacing-xl)
        buttonHeight: 52, // Button + padding
        buttonMargin: 8 // CSS: margin: var(--spacing-sm)
    };
};

/**
 * Berekent de exacte hoogte die een uitgeklapt gedicht zal innemen
 * Rekening houdend met witruimte tussen regels en performance optimalisatie
 * @param {Object} poem - Het gedicht object met lines array
 * @param {number} screenWidth - Huidige scherm breedte
 * @param {number} cardWidth - Breedte van de gedicht card
 * @param {boolean} forceCalculation - Forceer berekening (gebruikt voor max 3 gedichten)
 * @returns {Object} Hoogte informatie voor animatie
 */
export const calculateExpandedHeight = (poem, screenWidth = window.innerWidth, cardWidth = 570, forceCalculation = false) => {
    if (!poem || !poem.lines || poem.lines.length <= 4) {
        return {totalHeight: 0, contentHeight: 0, buttonHeight: 0};
    }

    // Performance check - alleen berekenen voor eerste 3 gedichten tenzij geforceerd
    if (!forceCalculation && poem.index && poem.index >= 3) {
        return getFallbackHeight(poem, screenWidth);
    }

    const config = getBaseConfig(screenWidth);
    const expandedLines = poem.lines.slice(4); // Regels na de preview

    // Realistische text wrapping berekening - gebaseerd op werkelijke CSS
    const averageCharWidth = config.fontSize * 0.5; // Conservatieve schatting voor Bitter font
    const textAreaWidth = cardWidth - (config.padding * 2);
    const maxCharsPerLine = Math.floor(textAreaWidth / averageCharWidth);

    let totalVisualLines = 0;

    // Eenvoudigere, nauwkeurigere regel analyse
    expandedLines.forEach((line) => {
        if (!line || line.trim() === '') {
            // Lege regel - gewoon 1 regel spacing
            totalVisualLines += 0.8; // CSS margin tussen regels
        } else {
            // Tekst regel - meestal gewoon 1 regel per line
            const cleanLine = line.trim();
            if (cleanLine.length > maxCharsPerLine) {
                // Alleen wrapping voor zeer lange regels
                const wrappedLines = Math.ceil(cleanLine.length / maxCharsPerLine);
                totalVisualLines += Math.min(wrappedLines, 3); // Max 3 regels per line
            } else {
                totalVisualLines += 1;
            }
        }
    });

    // Realistische hoogte berekening - gebaseerd op CSS
    const baseLineHeight = config.fontSize * config.lineHeight; // 18px * 1.625 = 29.25px
    const marginBottom = config.fontSize * 0.3; // CSS margin tussen regels (var(--spacing-sm))
    const lineWithMargin = baseLineHeight + marginBottom;

    const contentHeight = totalVisualLines * lineWithMargin;

    // Button sectie - realistisch
    const buttonHeight = config.buttonHeight + config.buttonMargin;
    const topPadding = config.buttonMargin; // CSS padding-top

    const totalHeight = contentHeight + buttonHeight + topPadding;

    return {
        totalHeight: Math.ceil(totalHeight),
        contentHeight: Math.ceil(contentHeight),
        buttonHeight,
        lineHeight: baseLineHeight,
        estimatedLines: totalVisualLines,
        config,
        calculationType: 'precise'
    };
};

/**
 * Fallback hoogte berekening voor performance (gebruikt voor gedichten index > 2)
 * @param {Object} poem - Het gedicht object
 * @param {number} screenWidth - Scherm breedte
 * @returns {Object} Geschatte hoogte informatie
 */
const getFallbackHeight = (poem, screenWidth) => {
    const config = getBaseConfig(screenWidth);
    const expandedLines = poem.lines.slice(4);

    // Eenvoudige schatting: 1 regel per tekstregel + margin
    const baseLineHeight = config.fontSize * config.lineHeight;
    const marginBottom = config.fontSize * 0.3;
    const lineWithMargin = baseLineHeight + marginBottom;

    const contentHeight = expandedLines.length * lineWithMargin;
    const buttonHeight = config.buttonHeight + config.buttonMargin;
    const totalHeight = contentHeight + buttonHeight + config.buttonMargin;

    return {
        totalHeight: Math.ceil(totalHeight),
        contentHeight: Math.ceil(contentHeight),
        buttonHeight,
        lineHeight: baseLineHeight,
        estimatedLines: expandedLines.length,
        config,
        calculationType: 'fallback'
    };
};

/**
 * Berekent staggered animatie delays voor gedichtregels
 * @param {number} totalLines - Totaal aantal uit te klappen regels
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerIncrement - Increment per regel in ms
 * @returns {Array} Array van delays voor elke regel
 */
export const calculateStaggeredDelays = (totalLines, baseDelay = 300, staggerIncrement = 80) => {
    return Array.from({length: totalLines}, (_, index) => baseDelay + (index * staggerIncrement));
};

/**
 * Intelligente carousel hoogte cache manager
 * Beheert pre-loading en caching van hoogte berekeningen voor carousel navigatie
 */
class CarouselHeightCache {
    constructor() {
        this.cache = new Map();
        this.preloadQueue = new Set();
        this.isCalculating = new Set();
    }

    /**
     * Haal hoogte op uit cache of bereken indien nodig
     */
    async getHeight(poem, index, screenWidth, cardWidth) {
        const cacheKey = `${index}-${screenWidth}-${cardWidth}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.isCalculating.has(cacheKey)) {
            // Wacht tot berekening klaar is
            return new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (this.cache.has(cacheKey)) {
                        clearInterval(checkInterval);
                        resolve(this.cache.get(cacheKey));
                    }
                }, 10);
            });
        }

        return this._calculateAndCache(poem, index, screenWidth, cardWidth);
    }

    /**
     * Pre-load hoogtes voor carousel navigatie
     * Bij navigatie naar rechts: cache huidige + volgende
     * Bij navigatie naar links: cache huidige + vorige
     */
    preloadForNavigation(poems, currentIndex, direction, screenWidth, cardWidth) {
        if (!poems || poems.length <= 1) return;

        const preloadIndices = this._getPreloadIndices(poems.length, currentIndex, direction);

        preloadIndices.forEach(index => {
            if (index >= 0 && index < poems.length) {
                const cacheKey = `${index}-${screenWidth}-${cardWidth}`;

                if (!this.cache.has(cacheKey) && !this.isCalculating.has(cacheKey)) {
                    this.preloadQueue.add({poem: poems[index], index, screenWidth, cardWidth});
                }
            }
        });

        // Process preload queue asynchroon
        this._processPreloadQueue();
    }

    /**
     * Bepaal welke indices vooraf geladen moeten worden
     */
    _getPreloadIndices(totalPoems, currentIndex, direction) {
        const indices = [currentIndex]; // Altijd huidige index

        if (direction === 'next' || direction === 'right') {
            // Navigeer naar rechts: preload volgende 1-2 items
            for (let i = 1; i <= 2; i++) {
                const nextIndex = (currentIndex + i) % totalPoems;
                indices.push(nextIndex);
            }
        } else if (direction === 'prev' || direction === 'left') {
            // Navigeer naar links: preload vorige 1-2 items
            for (let i = 1; i <= 2; i++) {
                const prevIndex = (currentIndex - i + totalPoems) % totalPoems;
                indices.push(prevIndex);
            }
        } else {
            // Initiële load: preload huidige + volgende + vorige
            const nextIndex = (currentIndex + 1) % totalPoems;
            const prevIndex = (currentIndex - 1 + totalPoems) % totalPoems;
            indices.push(nextIndex, prevIndex);
        }

        return [...new Set(indices)]; // Remove duplicates
    }

    /**
     * Bereken en cache hoogte
     */
    async _calculateAndCache(poem, index, screenWidth, cardWidth) {
        const cacheKey = `${index}-${screenWidth}-${cardWidth}`;
        this.isCalculating.add(cacheKey);

        try {
            const heightInfo = calculateExpandedHeight(
                {...poem, index},
                screenWidth,
                cardWidth,
                true // Force calculation
            );

            this.cache.set(cacheKey, heightInfo);
            return heightInfo;
        } finally {
            this.isCalculating.delete(cacheKey);
        }
    }

    /**
     * Process preload queue asynchroon
     */
    async _processPreloadQueue() {
        if (this.preloadQueue.size === 0) return;

        const items = [...this.preloadQueue];
        this.preloadQueue.clear();

        // Process in small batches to avoid blocking
        for (const item of items) {
            await this._calculateAndCache(item.poem, item.index, item.screenWidth, item.cardWidth);

            // Kleine pauze tussen berekeningen
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    /**
     * Clear cache bij resize of andere wijzigingen
     */
    clearCache() {
        this.cache.clear();
        this.preloadQueue.clear();
        this.isCalculating.clear();
    }

    /**
     * Get cache statistieken voor debugging
     */
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            preloadQueueSize: this.preloadQueue.size,
            calculating: this.isCalculating.size
        };
    }
}

// Global cache instance
const globalCarouselCache = new CarouselHeightCache();

/**
 * Carousel-specifieke hoogte berekening met intelligente caching
 * @param {Object} poem - Gedicht object
 * @param {number} currentIndex - Huidige carousel index
 * @param {Array} allPoems - Alle gedichten in carousel
 * @param {string} navigationDirection - 'next', 'prev', 'initial'
 * @param {number} screenWidth - Scherm breedte
 * @param {number} cardWidth - Card breedte
 * @returns {Promise<Object>} Hoogte informatie
 */
export const getCarouselPoemHeight = async (poem, currentIndex, allPoems, navigationDirection = 'initial', screenWidth, cardWidth) => {
    // Pre-load voor toekomstige navigatie
    globalCarouselCache.preloadForNavigation(allPoems, currentIndex, navigationDirection, screenWidth, cardWidth);

    // Haal hoogte op (uit cache of bereken)
    return await globalCarouselCache.getHeight(poem, currentIndex, screenWidth, cardWidth);
};

/**
 * Clear carousel cache bij resize events
 */
export const clearCarouselCache = () => {
    globalCarouselCache.clearCache();
};

/**
 * Get carousel cache stats voor debugging
 */
/**
 * Responsive utility om te detecteren wanneer layout aanpassingen nodig zijn
 * @param {number} width - Scherm breedte
 * @returns {Object} Layout informatie
 */
export const getResponsiveLayout = (width = window.innerWidth) => {
    return {
        isMobile: width <= BREAKPOINTS.mobile,
        isTablet: width <= BREAKPOINTS.tablet && width > BREAKPOINTS.mobile,
        isDesktop: width <= BREAKPOINTS.desktop && width > BREAKPOINTS.tablet,
        isLarge: width > BREAKPOINTS.desktop,
        breakpoint: width <= BREAKPOINTS.mobile ? 'mobile' :
            width <= BREAKPOINTS.tablet ? 'tablet' :
                width <= BREAKPOINTS.desktop ? 'desktop' : 'large',
        cardWidth: width <= BREAKPOINTS.mobile ?
            width - 32 : // Mobile padding
            width <= BREAKPOINTS.tablet ? 480 : 570 // Card widths
    };
};

/**
 * Scroll naar search results na een zoekactie
 * ALTIJD scrollen naar bovenkant van searchbar container
 * @param {string} searchResultsSelector - CSS selector voor search results container
 * @param {string} searchBarSelector - CSS selector voor search bar container
 * @param {number} offset - Extra offset vanaf searchbar (standaard 20px)
 */

/**
 * Berekent de optimale scroll positie na het inklappen van een gedicht
 * @param {string} targetSelector - CSS selector voor het target element (globalToggleContainer of resultsOverview)
 * @param {number} offset - Extra offset vanaf target (standaard 100px)
 * @returns {Object} Scroll informatie met shouldScroll, targetPosition, estimatedDuration
 */
export const calculateCollapseScroll = (targetSelector, offset = 100) => {
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
        return {shouldScroll: false, targetPosition: 0};
    }

    const targetRect = targetElement.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    // const viewportHeight = window.innerHeight;

    // Bereken target positie - bovenkant van element minus offset
    const targetTop = targetRect.top + currentScrollY;
    const targetScrollY = Math.max(0, targetTop - offset);

    // Check of we al op de juiste positie zijn
    const scrollDistance = Math.abs(targetScrollY - currentScrollY);
    const shouldScroll = scrollDistance > 50; // Alleen scrollen bij significant verschil

    // Bereken scroll duratie gebaseerd op afstand
    const estimatedDuration = Math.min(800, Math.max(300, scrollDistance * 0.5));

    return {
        shouldScroll,
        targetPosition: targetScrollY,
        scrollDistance,
        estimatedDuration,
        currentViewportPosition: targetRect.top
    };
};

/**
 * Debounced resize handler voor performance
 * @param {Function} callback - Functie om aan te roepen na resize
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced functie
 */
export const createResizeHandler = (callback, delay = 150) => {
    let timeoutId;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, delay);
    };
};