// src/hooks/canvas/useKeyboardShortcuts.js

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for managing keyboard shortcuts including mode cycling with SPACEBAR
 * and selection management with ESCAPE.
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.moveMode - Current move mode ('edit', 'line', 'poem')
 * @param {Function} options.setMoveMode - Function to set the move mode
 * @param {Set} options.selectedLines - Set of currently selected line indices
 * @param {Function} options.clearSelection - Function to clear all selections
 * @param {Function} options.selectAll - Function to select all lines
 * @param {Object} options.currentPoem - Current poem data with lines array
 */
export function useKeyboardShortcuts({
  moveMode,
  setMoveMode,
  selectedLines,
  clearSelection,
  selectAll,
  selectAllIncludingTitleAuthor,
  currentPoem,
  xySlidersVisible,
  setXySlidersVisible,
  highlightVisible,
  setHighlightVisible,
  onXyFocusRequest, // Callback om focus handler van XYMoveSliders te ontvangen
  setHoverFreezeActive, // NEW: Callback to activate hover freeze
  setActiveShortcut, // NEW: Callback to show shortcut visualization
  onToggleLayoutPosition, // NEW: Alt+S
  onToggleUIVisibility, // NEW: Alt+.
  onToggleNav, // NEW: Alt+N
  onCycleQuality, // NEW: Alt+Q
}) {
  // Keep track of previous selection to restore when returning to edit/line mode
  const previousSelectionRef = useRef(new Set());
  
  // Store previous selection when switching to poem mode
  useEffect(() => {
    if (moveMode !== 'poem' && selectedLines.size > 0) {
      previousSelectionRef.current = new Set(selectedLines);
    }
  }, [moveMode, selectedLines]);

  // Helper function to show shortcut feedback
  const showShortcutFeedback = useCallback((shortcutId, description) => {
    if (setActiveShortcut) {
      setActiveShortcut(description);
      // Auto-clear after 6 seconds (3x longer than before)
      setTimeout(() => {
        setActiveShortcut(null);
      }, 6000);
    }
  }, [setActiveShortcut]);

  // Cycle through modes: edit -> line (if selection exists) -> poem -> edit
  const cycleModes = useCallback(() => {
    setMoveMode(prevMode => {
      const hasSelection = selectedLines.size > 0;
      const hasPreviousSelection = previousSelectionRef.current.size > 0;

      switch (prevMode) {
        case 'edit':
          setXySlidersVisible(true); // Sliders should become visible for line/poem mode
          if (hasSelection) {
            return 'line';
          } else if (hasPreviousSelection) {
            return 'line';
          } else {
            return 'poem';
          }
        
        case 'line':
          setXySlidersVisible(true); // Sliders remain visible for poem mode
          return 'poem';
          
        case 'poem':
          setXySlidersVisible(false); // Sliders hide when returning to edit mode
          return 'edit';
          
        default:
          setXySlidersVisible(false);
          return 'edit';
      }
    });
  }, [setMoveMode, setXySlidersVisible, selectedLines.size]);

  // Reset to edit mode and clear selection
  const resetToEditMode = useCallback(() => {
    clearSelection();
    previousSelectionRef.current = new Set();
    setMoveMode('edit');
  }, [clearSelection, setMoveMode]);

  // Helper functie om muiscursor te simuleren naar container centrum
  const moveMouseToContainer = useCallback((container) => {
    if (!container) {

      return false;
    }

    try {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      console.log(`🖱️ moveMouseToContainer: Moving to center (${centerX.toFixed(0)}, ${centerY.toFixed(0)}) of container`, {
        width: rect.width,
        height: rect.height,
        position: rect
      });

      // Simuleer mouse move event naar het centrum van de container
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: centerX,
        clientY: centerY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Dispatch het event op de container zelf (voor hover effects)
      container.dispatchEvent(mouseMoveEvent);

      // Optioneel: Dispatch ook op document.body voor globale mouse tracking
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: centerX,
        clientY: centerY,
        bubbles: true,
        cancelable: true
      }));

      return true;
    } catch (error) {

      return false;
    }
  }, []);

  // Verbeterde focus functie met ref callback, retry logic en muis verplaatsing
  const focusXyMoveSliders = useCallback(() => {
    console.log('🎛️ Alt+J: Focus+Mouse sequence initiated', {
      currentMode: moveMode,
      currentlyVisible: xySlidersVisible
    });

    // Switch to poem mode if not already active
    if (moveMode !== 'poem') {

      setMoveMode('poem');
    }
    
    // Show XY sliders if not visible
    if (!xySlidersVisible) {

      setXySlidersVisible(true);
    }

    // Wacht tot rendering voltooid is (250ms totaal voor state + render + focus)
    setTimeout(() => {

      // Probeer eerst ref callback (primair pad)
      if (onXyFocusRequest) {

        const focusSuccess = onXyFocusRequest();
        
        if (focusSuccess) {

          // Wacht kort voor focus settling, dan mouse move
          setTimeout(() => {
            const container = document.querySelector('[data-testid="xy-move-container"]') ||
                            document.querySelector('[class*="xyMoveContainer"]');
            if (container) {
              moveMouseToContainer(container);
            } else {

            }
          }, 50);
          return;
        } else {

        }
      } else {

      }

      // Fallback: Direct querySelector met retry en mouse move
      const maxRetries = 3;
      let retryCount = 0;
      
      const attemptFocusAndMouse = () => {
        retryCount++;

        const selectors = [
          '[data-testid="xy-move-container"]',
          '[class*="xyMoveContainer"]'
        ];
        
        let xyContainer = null;
        for (const selector of selectors) {
          xyContainer = document.querySelector(selector);
          if (xyContainer) {

            break;
          }
        }
        
        if (xyContainer) {
          try {
            // Eerst focus
            xyContainer.focus({ preventScroll: true });

            // Dan mouse move naar centrum
            setTimeout(() => {
              moveMouseToContainer(xyContainer);
            }, 50); // Korte delay voor focus settling

            return true;
          } catch (error) {

          }
        } else {

        }
        
        if (retryCount < maxRetries) {
          const delay = 150 * retryCount; // 150ms, 300ms, 450ms
          setTimeout(attemptFocusAndMouse, delay);
        } else {






        }
      };

      attemptFocusAndMouse();
    }, 250); // Langere totale delay voor volledige render cycle
  }, [moveMode, setMoveMode, xySlidersVisible, setXySlidersVisible, onXyFocusRequest, moveMouseToContainer]);



  useEffect(() => {
    const handleKeyDown = (event) => {

			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA"
			) {
				return;
			}

			// SPACEBAR: Mode cycling
			if (
				event.key === " " &&
				!event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				event.preventDefault();

				showShortcutFeedback("space", "Space: Cycle modes");
				cycleModes();
				return;
			}

			// ESCAPE: Reset to edit mode
			if (event.key === "Escape") {
				event.preventDefault();

				showShortcutFeedback(
					"escape",
					"Esc: Clear selection and return to Edit mode"
				);
				resetToEditMode();
				return;
			}

			// ALT+A: Select all poem lines only (edit mode only)
			if (
				event.key.toLowerCase() === "a" &&
				event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				if (
					moveMode === "edit" &&
					selectAll &&
					currentPoem?.lines?.length > 0
				) {
					event.preventDefault();

					showShortcutFeedback("alta", "Alt+A: Select all poem lines");
					selectAll(currentPoem.lines.length);
				}
				return;
			}

			// ALT+SHIFT+A: Select all including title and author (edit mode only)
			if (
				event.key.toLowerCase() === "a" &&
				event.altKey &&
				!event.ctrlKey &&
				event.shiftKey
			) {
				if (
					moveMode === "edit" &&
					selectAllIncludingTitleAuthor &&
					currentPoem?.lines?.length > 0
				) {
					event.preventDefault();

					showShortcutFeedback(
						"altshifta",
						"Alt+Shift+A: Select all + title + author"
					);
					selectAllIncludingTitleAuthor(currentPoem.lines.length);
				}
				return;
			}

			// ALT+H: Toggle XY sliders visibility
			if (
				event.key.toLowerCase() === "h" &&
				event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				if (moveMode === "line" || moveMode === "poem") {
					event.preventDefault();

					showShortcutFeedback("alth", "Alt+H: Toggle XY sliders visibility");
					setXySlidersVisible(!xySlidersVisible);
				}
				return;
			}

			// ALT+J: Focus XY sliders
			if (
				event.key.toLowerCase() === "j" &&
				event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				event.preventDefault();

				showShortcutFeedback(
					"altj",
					"Alt+J: Focus XY sliders + 5s hover freeze"
				);

				// Activate 5-second hover freeze
				if (setHoverFreezeActive) {
					setHoverFreezeActive(true);

				}

				// Switch to poem mode if not already active
				if (moveMode !== "poem") {

					setMoveMode("poem");
				}

				// Show XY sliders if not visible
				if (!xySlidersVisible) {

					setXySlidersVisible(true);
				}

				// Focus XY sliders container
				setTimeout(() => {
					const container =
						document.querySelector('[data-testid="xy-move-container"]') ||
						document.querySelector('[class*="xyMoveContainer"]');
					if (container) {
						container.focus();
						container.scrollIntoView({ behavior: "smooth", block: "center" });

					} else {

					}
				}, 200);
				return;
			}

			// R: Reset camera to center
			if (
				event.key.toLowerCase() === "r" &&
				!event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				event.preventDefault();

				showShortcutFeedback("r", "R: Reset camera to center");

				if (window.debugCanvas?.resetViewport) {
					window.debugCanvas.resetViewport();
				} else {

				}
				return;
			}

			// ALT+Y: Toggle highlight visibility
			if (
				event.key.toLowerCase() === "y" &&
				event.altKey &&
				!event.ctrlKey &&
				!event.shiftKey
			) {
				event.preventDefault();

				showShortcutFeedback("alty", "Alt+Y: Toggle highlight visibility");
				setHighlightVisible(!highlightVisible);
				return;
			}

            // ALT+S: Swap Layout Position
            if (
                event.key.toLowerCase() === "s" &&
                event.altKey &&
                !event.ctrlKey &&
                !event.shiftKey
            ) {
                event.preventDefault();
                showShortcutFeedback("swap-layout", "Alt+S: Swap panel position");
                if (onToggleLayoutPosition) onToggleLayoutPosition();
                return;
            }

            // ALT+. (Dot): Toggle UI Visibility (Controls + Nav)
            if (
                event.key === "." &&
                event.altKey &&
                !event.ctrlKey &&
                !event.shiftKey
            ) {
                event.preventDefault();
                showShortcutFeedback("toggle-ui", "Alt+.: Toggle UI visibility");
                if (onToggleUIVisibility) onToggleUIVisibility();
                return;
            }

            // ALT+N: Toggle Navigation
            if (
                event.key.toLowerCase() === "n" &&
                event.altKey &&
                !event.ctrlKey &&
                !event.shiftKey
            ) {
                event.preventDefault();
                showShortcutFeedback("toggle-nav", "Alt+N: Toggle Navigation");
                if (onToggleNav) onToggleNav();
                return;
            }

            // ALT+Q: Cycle Quality
            if (
                event.key.toLowerCase() === "q" &&
                event.altKey &&
                !event.ctrlKey &&
                !event.shiftKey
            ) {
                event.preventDefault();
                showShortcutFeedback("cycle-quality", "Alt+Q: Cycle image quality");
                if (onCycleQuality) onCycleQuality();
                return;
            }
		};

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    moveMode, 
    setMoveMode, 
    xySlidersVisible, 
    setXySlidersVisible, 
    highlightVisible, 
    setHighlightVisible, 
    setHoverFreezeActive, 
    setActiveShortcut, 
    cycleModes, 
    resetToEditMode, 
    selectAll, 
    selectAllIncludingTitleAuthor, 
    currentPoem, 
    showShortcutFeedback,
    onToggleLayoutPosition,
    onToggleUIVisibility,
    onToggleNav,
    onCycleQuality
  ]);

  // Return function to restore previous selection (to be used by parent component)
  const restorePreviousSelection = () => {
    if (previousSelectionRef.current.size > 0) {
      // The parent component should handle the actual selection restoration
      return previousSelectionRef.current;
    }
    return new Set();
  };

  return {
    restorePreviousSelection,
    cycleModes,
    resetToEditMode
  };
}
