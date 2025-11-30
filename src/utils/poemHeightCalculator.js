/**
 * Utility functions for accurate poem expansion height calculation
 * Considers responsive design and different screen sizes
 */



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

// Constants for different breakpoints (must match CSS)
const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1400
};

// Base configuration for different screen sizes - based on actual CSS
const getBaseConfig = (screenWidth) => {
    if (screenWidth <= BREAKPOINTS.mobile) {
        return {
            fontSize: 16, // var(--font-size-xl) equivalent
            lineHeight: 1.5, // CSS: line-height: 1.5
            padding: 16, // var(--spacing-md)
            buttonHeight: 44,
            buttonMargin: 8 // Less margin
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

    // Desktop and larger - based on .poemLine CSS
    return {
        fontSize: 18, // CSS: font-size: 18px
        lineHeight: 1.625, // CSS: line-height: 1.625
        padding: 32, // CSS: padding: var(--spacing-xl)
        buttonHeight: 52, // Button + padding
        buttonMargin: 8 // CSS: margin: var(--spacing-sm)
    };
};

/**
 * Calculates the exact height an expanded poem will occupy
 * Considering whitespace between lines and performance optimization
 * @param {Object} poem - The poem object with lines array
 * @param {number} screenWidth - Current screen width
 * @param {number} cardWidth - Width of the poem card
 * @param {boolean} forceCalculation - Force calculation (used for max 3 poems)
 * @returns {Object} Height information for animation
 */
export const calculateExpandedHeight = (poem, screenWidth = window.innerWidth, cardWidth = 570, forceCalculation = false) => {
    if (!poem || !poem.lines || poem.lines.length <= 4) {
        return {totalHeight: 0, contentHeight: 0, buttonHeight: 0};
    }

    // Performance check - only calculate for first 3 poems unless forced
    if (!forceCalculation && poem.index && poem.index >= 3) {
        return getFallbackHeight(poem, screenWidth);
    }

    const config = getBaseConfig(screenWidth);
    const expandedLines = poem.lines.slice(4); // Lines after preview

    // Realistic text wrapping calculation - based on actual CSS
    const averageCharWidth = config.fontSize * 0.5; // Conservative estimate for Bitter font
    const textAreaWidth = cardWidth - (config.padding * 2);
    const maxCharsPerLine = Math.floor(textAreaWidth / averageCharWidth);

    let totalVisualLines = 0;

    // Simpler, more accurate line analysis
    expandedLines.forEach((line) => {
        if (!line || line.trim() === '') {
            // Empty line - just 1 line spacing
            totalVisualLines += 0.8; // CSS margin between lines
        } else {
            // Text line - usually just 1 line per line
            const cleanLine = line.trim();
            if (cleanLine.length > maxCharsPerLine) {
                // Only wrapping for very long lines
                const wrappedLines = Math.ceil(cleanLine.length / maxCharsPerLine);
                totalVisualLines += Math.min(wrappedLines, 3); // Max 3 lines per line
            } else {
                totalVisualLines += 1;
            }
        }
    });

    // Realistic height calculation - based on CSS
    const baseLineHeight = config.fontSize * config.lineHeight; // 18px * 1.625 = 29.25px
    const marginBottom = config.fontSize * 0.3; // CSS margin between lines (var(--spacing-sm))
    const lineWithMargin = baseLineHeight + marginBottom;

    const contentHeight = totalVisualLines * lineWithMargin;

    // Button section - realistic
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
 * Fallback height calculation for performance (used for poems index > 2)
 * @param {Object} poem - The poem object
 * @param {number} screenWidth - Screen width
 * @returns {Object} Estimated height information
 */
const getFallbackHeight = (poem, screenWidth) => {
    const config = getBaseConfig(screenWidth);
    const expandedLines = poem.lines.slice(4);

    // Simple estimation: 1 line per text line + margin
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
 * Calculates staggered animation delays for poem lines
 * @param {number} totalLines - Total number of lines to expand
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerIncrement - Increment per line in ms
 * @returns {Array} Array of delays for each line
 */
export const calculateStaggeredDelays = (totalLines, baseDelay = 300, staggerIncrement = 80) => {
    return Array.from({length: totalLines}, (_, index) => baseDelay + (index * staggerIncrement));
};

/**
 * Intelligent carousel height cache manager
 * Manages pre-loading and caching of height calculations for carousel navigation
 */
class CarouselHeightCache {
    constructor() {
        this.cache = new Map();
        this.preloadQueue = new Set();
        this.isCalculating = new Set();
    }

    /**
     * Get height from cache or calculate if needed
     */
    async getHeight(poem, index, screenWidth, cardWidth) {
        const cacheKey = `${index}-${screenWidth}-${cardWidth}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.isCalculating.has(cacheKey)) {
            // Wait until calculation is finished
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
     * Pre-load heights for carousel navigation
     * On navigation right: cache current + next
     * On navigation left: cache current + previous
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

        // Process preload queue asynchronously
        this._processPreloadQueue();
    }

    /**
     * Determine which indices should be preloaded
     */
    _getPreloadIndices(totalPoems, currentIndex, direction) {
        const indices = [currentIndex]; // Always current index

        if (direction === 'next' || direction === 'right') {
            // Navigate right: preload next 1-2 items
            for (let i = 1; i <= 2; i++) {
                const nextIndex = (currentIndex + i) % totalPoems;
                indices.push(nextIndex);
            }
        } else if (direction === 'prev' || direction === 'left') {
            // Navigate left: preload previous 1-2 items
            for (let i = 1; i <= 2; i++) {
                const prevIndex = (currentIndex - i + totalPoems) % totalPoems;
                indices.push(prevIndex);
            }
        } else {
            // Initial load: preload current + next + previous
            const nextIndex = (currentIndex + 1) % totalPoems;
            const prevIndex = (currentIndex - 1 + totalPoems) % totalPoems;
            indices.push(nextIndex, prevIndex);
        }

        return [...new Set(indices)]; // Remove duplicates
    }

    /**
     * Calculate and cache height
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
     * Process preload queue asynchronously
     */
    async _processPreloadQueue() {
        if (this.preloadQueue.size === 0) return;

        const items = [...this.preloadQueue];
        this.preloadQueue.clear();

        // Process in small batches to avoid blocking
        for (const item of items) {
            await this._calculateAndCache(item.poem, item.index, item.screenWidth, item.cardWidth);

            // Small pause between calculations
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    /**
     * Clear cache on resize or other changes
     */
    clearCache() {
        this.cache.clear();
        this.preloadQueue.clear();
        this.isCalculating.clear();
    }

    /**
     * Get cache statistics for debugging
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
 * Carousel-specific height calculation with intelligent caching
 * @param {Object} poem - Poem object
 * @param {number} currentIndex - Current carousel index
 * @param {Array} allPoems - All poems in carousel
 * @param {string} navigationDirection - 'next', 'prev', 'initial'
 * @param {number} screenWidth - Screen width
 * @param {number} cardWidth - Card width
 * @returns {Promise<Object>} Height information
 */
export const getCarouselPoemHeight = async (poem, currentIndex, allPoems, navigationDirection = 'initial', screenWidth, cardWidth) => {
    // Pre-load for future navigation
    globalCarouselCache.preloadForNavigation(allPoems, currentIndex, navigationDirection, screenWidth, cardWidth);

    // Get height (from cache or calculate)
    return await globalCarouselCache.getHeight(poem, currentIndex, screenWidth, cardWidth);
};

/**
 * Clear carousel cache on resize events
 */
export const clearCarouselCache = () => {
    globalCarouselCache.clearCache();
};

/**
 * Get carousel cache stats voor debugging
 */
/**
 * Responsive utility to detect when layout adjustments are needed
 * @param {number} width - Screen width
 * @returns {Object} Layout information
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
 * Scroll to search results after a search action
 * ALWAYS scroll to top of searchbar container
 * @param {string} searchResultsSelector - CSS selector for search results container
 * @param {string} searchBarSelector - CSS selector for search bar container
 * @param {number} offset - Extra offset from searchbar (default 20px)
 */

/**
 * Calculates optimal scroll position after collapsing a poem
 * @param {string} targetSelector - CSS selector for target element (globalToggleContainer or resultsOverview)
 * @param {number} offset - Extra offset from target (default 100px)
 * @returns {Object} Scroll information with shouldScroll, targetPosition, estimatedDuration
 */
export const calculateCollapseScroll = (targetSelector, offset = 100) => {
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
        return {shouldScroll: false, targetPosition: 0};
    }

    const targetRect = targetElement.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    // const viewportHeight = window.innerHeight;

    // Calculate target position - top of element minus offset
    const targetTop = targetRect.top + currentScrollY;
    const targetScrollY = Math.max(0, targetTop - offset);

    // Check if we are already at the right position
    const scrollDistance = Math.abs(targetScrollY - currentScrollY);
    const shouldScroll = scrollDistance > 50; // Only scroll if significant difference

    // Calculate scroll duration based on distance
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
 * Debounced resize handler for performance
 * @param {Function} callback - Function to call after resize
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced function
 */
export const createResizeHandler = (callback, delay = 150) => {
    let timeoutId;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, delay);
    };
};