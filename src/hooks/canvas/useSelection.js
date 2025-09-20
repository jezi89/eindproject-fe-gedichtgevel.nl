// src/hooks/canvas/useSelection.js

import { useState, useCallback } from "react";

/**
 * Custom hook for managing multi-selection state for poem lines.
 * Handles single click, Ctrl/Cmd-click for toggling, Shift-click for range selection,
 * and Alt+Shift-click for non-adjacent individual line selection.
 */
export function useSelection() {
  const [selectedLines, setSelectedLines] = useState(new Set());
  const [lastSelectedLine, setLastSelectedLine] = useState(null);
  
  // Function to restore a specific selection set
  const restoreSelection = useCallback((selectionSet) => {
    if (selectionSet && selectionSet.size > 0) {
      setSelectedLines(new Set(selectionSet));
      // Set lastSelectedLine to the highest index for range selection continuity
      const maxIndex = Math.max(...Array.from(selectionSet));
      setLastSelectedLine(maxIndex);
    }
  }, []);

  const handleSelect = useCallback(
    (index, event) => {
      const newSelection = new Set(selectedLines);

      if (event?.altKey && event?.shiftKey) {
        // Alt+Shift: Add individual line to existing selection (non-adjacent)
        newSelection.add(index);
        setLastSelectedLine(index);
      } else if (event?.shiftKey && lastSelectedLine !== null) {
        // Range selection
        const start = Math.min(lastSelectedLine, index);
        const end = Math.max(lastSelectedLine, index);
        newSelection.clear(); // Start with a clean slate for the new range
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
      } else if (event?.ctrlKey || event?.metaKey) {
        // Toggle selection (add or remove)
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        setLastSelectedLine(index);
      } else {
        // Single selection
        if (newSelection.has(index) && newSelection.size === 1) {
          newSelection.clear();
          setLastSelectedLine(null);
        } else {
          newSelection.clear();
          newSelection.add(index);
          setLastSelectedLine(index);
        }
      }

      setSelectedLines(newSelection);
    },
    [selectedLines, lastSelectedLine]
  );

  const clearSelection = useCallback(() => {
    setSelectedLines(new Set());
    setLastSelectedLine(null);
  }, []);

  const isSelected = useCallback(
    (index) => {
      return selectedLines.has(index);
    },
    [selectedLines]
  );

  // NEW: Select all lines functionality for Alt-A (poem lines only)
  const selectAll = useCallback((totalLines) => {
    const allLines = new Set();
    for (let i = 0; i < totalLines; i++) {
      allLines.add(i);
    }
    setSelectedLines(allLines);
    setLastSelectedLine(totalLines > 0 ? totalLines - 1 : null); // Set last selected to final line
  }, []);

  // NEW: Select all including title and author (Alt+Shift+A)
  const selectAllIncludingTitleAuthor = useCallback((totalLines) => {
    const allLines = new Set();
    // Add title (-2) and author (-1)
    allLines.add(-2); // Title
    allLines.add(-1); // Author
    // Add all poem lines (0 to totalLines-1)
    for (let i = 0; i < totalLines; i++) {
      allLines.add(i);
    }
    setSelectedLines(allLines);
    setLastSelectedLine(totalLines > 0 ? totalLines - 1 : null);
  }, []);

  return {
    selectedLines,
    handleSelect,
    clearSelection,
    selectAll, // NEW: Add selectAll to the hook interface (poem lines only)
    selectAllIncludingTitleAuthor, // NEW: Add selectAllIncludingTitleAuthor to the hook interface
    restoreSelection, // NEW: Add restoreSelection to the hook interface
    isSelected,
  };
}
