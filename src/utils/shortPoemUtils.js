/**
 * Utility functions for handling short poems (≤4 lines)
 *
 * For short poems:
 * - Hide only the last line in preview
 * - Maintain min-height for consistent alignment
 * - Keep global toggle functionality in sync
 */

// TODO Understand util implementation and see if it can be less verbose

/**
 * Calculates how many lines are hidden in preview mode
 * SIMPLE LOGIC: Only line-level counting
 * @param {Object} poem - Gedicht object met lines array
 * @param {Object} expandablePreview - Resultaat van createExpandablePreview
 * @returns {Object} { hiddenLineCount, hiddenWordCount, displayText }
 */
export const calculateHiddenContent = (poem, expandablePreview) => {
  if (!poem || !poem.lines || !expandablePreview) {
    return { hiddenLineCount: 0, hiddenWordCount: 0, displayText: "" };
  }

  // Simple calculation: number of hidden lines
  const hiddenLineCount = expandablePreview.hiddenContent.length;

  return {
    hiddenLineCount,
    hiddenWordCount: 0,
    displayText:
      hiddenLineCount > 0
        ? `${hiddenLineCount} ${
            hiddenLineCount === 1 ? "regel" : "regels"
          } verborgen`
        : "",
  };
};

/**
 * SIMPLE PREVIEW LOGIC: Back to original, working implementation
 * Only poems > 4 lines are expandable
 * Preview = first 4 lines, Hidden = lines from line 5
 * @param {Object} poem - Gedicht object met lines array
 * @returns {Object} { previewLines, hiddenContent, isExpandable }
 */
export const createExpandablePreview = (poem) => {
  if (!poem || !poem.lines || poem.lines.length === 0) {
    return { previewLines: [], hiddenContent: [], isExpandable: false };
  }

  // Simple logic: only poems > 4 lines are expandable
  if (poem.lines.length > 4) {
    return {
      previewLines: poem.lines.slice(0, 4),
      hiddenContent: poem.lines.slice(4),
      isExpandable: true,
      truncationType: "line-level",
    };
  }

  // Poems <= 4 lines: show all, not expandable
  return {
    previewLines: poem.lines,
    hiddenContent: [],
    isExpandable: false,
  };
};

/**
 * Calculates which poems can actually expand with global toggle
 * SIMPLE LOGIC: Only poems > 4 lines are expandable
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

      // Simple check: only poems > 4 lines are expandable
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
