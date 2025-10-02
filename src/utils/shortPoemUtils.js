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

// UNUSED
// /**
//  * Bepaalt of een gedicht als "kort" wordt beschouwd
//  * @param {Object} poem - Gedicht object met lines array
//  * @returns {boolean} True als gedicht 4 of minder regels heeft
//  */
// export const isShortPoem = (poem) => {
//     return poem && poem.lines && poem.lines.length <= 4;
// };

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
