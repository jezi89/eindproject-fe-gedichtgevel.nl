/**
 * Poem Height Calculation Utilities
 * Nauwkeurige berekening van gedicht uitklap hoogtes voor Framer Motion animaties
 * Houdt rekening met responsive design en performance optimalisatie
 */

// Constanten voor verschillende breakpoints (moet overeenkomen met CSS)
const BREAKPOINTS = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    large: 1400
};

/**
 * Base configuratie voor verschillende schermgroottes - gebaseerd op werkelijke CSS
 * @param {number} screenWidth - Huidige scherm breedte
 * @returns {Object} Configuratie object met font/spacing waarden
 */
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
 * Berekent de exacte hoogte die een uitgeklapt gedicht zal innemen
 * KRITIEK: Framer Motion vereist een exacte target hoogte voor smooth animaties
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
    expandedLines.forEach((line, index) => {
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