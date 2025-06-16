/**
 * Utility functies voor het hanteren van korte gedichten (≤4 regels)
 *
 * Voor korte gedichten:
 * - Verberg alleen de laatste regel in preview
 * - Min-height behouden voor consistente uitlijning
 * - Global toggle functionaliteit in sync houden
 */

// TODO Util implementatie begrijpen en kijken of het minder verbose kan

/**
 * Berekent hoeveel regels verborgen zijn in preview mode
 * EENVOUDIGE LOGICA: Alleen line-level counting
 * @param {Object} poem - Gedicht object met lines array
 * @param {Object} expandablePreview - Resultaat van createExpandablePreview
 * @returns {Object} { hiddenLineCount, hiddenWordCount, displayText }
 */
export const calculateHiddenContent = (poem, expandablePreview) => {
    if (!poem || !poem.lines || !expandablePreview) {
        return {hiddenLineCount: 0, hiddenWordCount: 0, displayText: ''};
    }

    // Eenvoudige berekening: aantal hidden regels
    const hiddenLineCount = expandablePreview.hiddenContent.length;

    return {
        hiddenLineCount,
        hiddenWordCount: 0,
        displayText: hiddenLineCount > 0
            ? `${hiddenLineCount} ${hiddenLineCount === 1 ? 'regel' : 'regels'} verborgen`
            : ''
    };
};

/**
 * Bepaalt of een gedicht als "kort" wordt beschouwd
 * @param {Object} poem - Gedicht object met lines array
 * @returns {boolean} True als gedicht 4 of minder regels heeft
 */
export const isShortPoem = (poem) => {
    return poem && poem.lines && poem.lines.length <= 4;
};

/**
 * Bepaalt of een kort gedicht expandable is (meer dan 1 regel)
 * @param {Object} poem - Gedicht object met lines array
 * @returns {boolean} True als kort gedicht expandable is
 */
export const isShortPoemExpandable = (poem) => {
    return isShortPoem(poem) && poem.lines && poem.lines.length > 1;
};

/**
 * Helper functie om lege of insignificante regels te filteren
 * @param {string} line - Regel tekst
 * @returns {boolean} True als regel significante content heeft
 */
const hasSignificantContent = (line) => {
    return line && typeof line === 'string' && line.trim().length > 0;
};

/**
 * Valideert dat preview minimaal 75% van content toont
 * @param {Array} previewLines - Preview regels
 * @param {Array} allLines - Alle regels
 * @returns {boolean} True als preview voldoende toont
 */
const validateMinimumPreview = (previewLines, allLines) => {
    const significantPreview = previewLines.filter(hasSignificantContent).length;
    const significantTotal = allLines.filter(hasSignificantContent).length;

    if (significantTotal === 0) return false;

    const previewRatio = significantPreview / significantTotal;
    return previewRatio >= 0.75; // Minimaal 75% zichtbaar
};

/**
 * EENVOUDIGE PREVIEW LOGICA: Terug naar originele, werkende implementatie
 * Alleen gedichten > 4 regels zijn expandable
 * Preview = eerste 4 regels, Hidden = regels vanaf regel 5
 * @param {Object} poem - Gedicht object met lines array
 * @returns {Object} { previewLines, hiddenContent, isExpandable }
 */
export const createExpandablePreview = (poem) => {
    if (!poem || !poem.lines || poem.lines.length === 0) {
        return {previewLines: [], hiddenContent: [], isExpandable: false};
    }

    // Eenvoudige logica: alleen gedichten > 4 regels zijn expandable
    if (poem.lines.length > 4) {
        return {
            previewLines: poem.lines.slice(0, 4),
            hiddenContent: poem.lines.slice(4),
            isExpandable: true,
            truncationType: 'line-level'
        };
    }

    // Gedichten <= 4 regels: toon alles, niet expandable
    return {
        previewLines: poem.lines,
        hiddenContent: [],
        isExpandable: false
    };
};

/**
 * Intelligente preview logica: eerste frase (max 5 regels) of vul aan tot 6 line-heights
 * @param {Object} poem - Gedicht object met lines array
 * @returns {Array} Array van preview regels
 */
export const getIntelligentPreviewLines = (poem) => {
    if (!poem || !poem.lines || poem.lines.length <= 1) {
        return poem?.lines || [];
    }

    const lines = poem.lines;
    const maxPreviewLineHeights = 6;
    const maxFirstPhraseLines = 5;

    // Zoek einde van eerste frase (tot punt, uitroepteken, vraagteken, of dubbele punt)
    let firstPhraseEnd = -1;
    const phraseEndPattern = /[.!?:]\s*$/;

    for (let i = 0; i < Math.min(lines.length, maxFirstPhraseLines); i++) {
        if (lines[i] && phraseEndPattern.test(lines[i].trim())) {
            firstPhraseEnd = i;
            break;
        }
    }

    // Als we een frase einde hebben gevonden binnen max eerste frase regels
    if (firstPhraseEnd >= 0) {
        const phraseLines = firstPhraseEnd + 1;

        // Als eerste frase minder dan 6 line-heights gebruikt, vul aan
        if (phraseLines < maxPreviewLineHeights && phraseLines < lines.length) {
            const remainingLineHeights = maxPreviewLineHeights - phraseLines;
            const additionalLines = Math.min(remainingLineHeights, lines.length - phraseLines);
            return lines.slice(0, phraseLines + additionalLines);
        }

        return lines.slice(0, phraseLines);
    }

    // Geen frase einde gevonden, gebruik max 6 line-heights of alle regels
    return lines.slice(0, Math.min(maxPreviewLineHeights, lines.length));
};

/**
 * Haalt preview regels op voor korte gedichten (legacy functie)
 * Voor korte gedichten: toon alle behalve de laatste regel
 * @param {Object} poem - Gedicht object met lines array
 * @returns {Array} Array van preview regels
 */
export const getShortPoemPreviewLines = (poem) => {
    if (!poem || !poem.lines || poem.lines.length <= 1) {
        return poem?.lines || [];
    }

    if (isShortPoem(poem)) {
        // Voor korte gedichten: toon alle behalve laatste regel
        return poem.lines.slice(0, -1);
    }

    // Voor normale gedichten: gebruik intelligente preview
    return getIntelligentPreviewLines(poem);
};

/**
 * Haalt verborgen regels op - werkt samen met intelligente preview
 * @param {Object} poem - Gedicht object met lines array
 * @returns {Array} Array van verborgen regels
 */
export const getShortPoemHiddenLines = (poem) => {
    if (!poem || !poem.lines || poem.lines.length <= 1) {
        return [];
    }

    if (isShortPoem(poem)) {
        // Voor korte gedichten: alleen laatste regel
        return poem.lines.slice(-1);
    }

    // Voor normale gedichten: alles na intelligente preview
    const previewLines = getIntelligentPreviewLines(poem);
    const previewLength = previewLines.length;

    if (previewLength >= poem.lines.length) {
        return []; // Geen verborgen regels
    }

    return poem.lines.slice(previewLength);
};

/**
 * Berekent vaste preview container hoogte gebaseerd op max preview content (6 line-heights)
 * @param {number} lineHeight - Hoogte per regel in pixels (default: 29.25px uit CSS line-height 1.625 * 18px)
 * @param {number} extraPadding - Extra ruimte voor ellipsis en button spacing
 * @returns {number} Vaste hoogte in pixels
 */
export const calculateFixedPreviewHeight = (lineHeight = 29.25, extraPadding = 60) => {
    // 6 line-heights voor max preview content + ruimte voor ellipsis en button spacing
    return Math.ceil(lineHeight * 6) + extraPadding;
};

/**
 * Berekent minimum container hoogte voor korte gedichten (legacy)
 * Zorgt dat korte gedichten consistent uitlijnen met langere gedichten
 * @param {number} lineHeight - Hoogte per regel in pixels
 * @param {number} baseHeight - Basis container hoogte
 * @returns {number} Minimum hoogte in pixels
 */
export const calculateShortPoemMinHeight = (lineHeight = 30, baseHeight = 120) => {
    // Gebruik nieuwe vaste preview hoogte
    return Math.max(baseHeight, calculateFixedPreviewHeight());
};

/**
 * Bepaalt of kort gedicht moet kunnen expanderen in global toggle
 * @param {Object} poem - Gedicht object
 * @returns {boolean} True als gedicht mee moet doen met global toggle
 */
export const shouldShortPoemParticipateInGlobalToggle = (poem) => {
    return isShortPoemExpandable(poem);
};

/**
 * Formatteert button tekst voor korte gedichten
 * @param {boolean} isExpanded - Of kort gedicht is uitgeklapt
 * @param {number} hiddenLineCount - Aantal verborgen regels
 * @returns {string} Button tekst
 */
export const getShortPoemButtonText = (isExpanded, hiddenLineCount = 1) => {
    if (isExpanded) {
        return 'Verberg laatste regel';
    }

    if (hiddenLineCount === 1) {
        return 'Toon laatste regel';
    }

    return `Toon laatste ${hiddenLineCount} regels`;
};

/**
 * Helper functie om te bepalen welke gedichten mee moeten doen met global expand
 * Filtert alleen gedichten die daadwerkelijk kunnen expanderen
 * @param {Array} poems - Array van gedichten
 * @returns {Array} Array van gedichten die kunnen expanderen
 */
export const getExpandablePoems = (poems) => {
    if (!poems || !Array.isArray(poems)) return [];

    return poems.filter(poem => {
        // Normale lange gedichten (>4 regels)
        if (!isShortPoem(poem)) {
            return poem.lines && poem.lines.length > 4;
        }

        // Korte gedichten die expandable zijn (>1 regel)
        return isShortPoemExpandable(poem);
    });
};

/**
 * Berekent welke gedichten daadwerkelijk kunnen expanderen bij global toggle
 * EENVOUDIGE LOGICA: Alleen gedichten > 4 regels zijn expandable
 * @param {Array} poems - Array van alle gedichten
 * @param {Array} visibleIndices - Indices van zichtbare gedichten
 * @returns {Object} Object met expandable info
 */
export const analyzeExpandablePoems = (poems, visibleIndices) => {
    if (!poems || !visibleIndices) {
        return {
            totalExpandable: 0,
            visibleExpandable: 0,
            expandableIndices: [],
            nonExpandableIndices: [],
            hasExpandablePoems: false
        };
    }

    const expandableIndices = [];
    const nonExpandableIndices = [];

    visibleIndices.forEach(index => {
        const poem = poems[index];
        if (!poem) return;

        // Eenvoudige check: alleen gedichten > 4 regels zijn expandable
        if (poem.lines && poem.lines.length > 4) {
            expandableIndices.push(index);
        } else {
            nonExpandableIndices.push(index);
        }
    });

    // Count total expandable poems
    let totalExpandable = 0;
    if (poems) {
        totalExpandable = poems.filter(poem =>
            poem && poem.lines && poem.lines.length > 4
        ).length;
    }

    return {
        totalExpandable,
        visibleExpandable: expandableIndices.length,
        expandableIndices,
        nonExpandableIndices,
        hasExpandablePoems: expandableIndices.length > 0
    };
};