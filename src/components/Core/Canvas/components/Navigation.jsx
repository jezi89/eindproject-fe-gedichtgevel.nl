import styles from "./Navigation.module.scss";
import MoveControls from "./MoveControls";
import FloatingShortcutPanel from "./FloatingShortcutPanel";
import HintLabel from "./HintLabel";
import SaveDesignButton from "./SaveDesignButton";
import { useRef } from "react";

export default function Navigation({
                                       toggle,
                                       onSyncAllColorsToGlobal,
                                       onSyncAllFontsToGlobal,
                                       moveMode,
                                       setMoveMode,
                                       selectedLines,
                                       clearSelection,
                                       activeShortcut,
                                       xySlidersVisible,
                                       setXySlidersVisible,
                                       navWidth,
                                       highlightVisible,
                                       setHighlightVisible,
                                       onToggleNavbarOverlay,
                                       poemData,
                                       canvasState,
                                       currentDesignId,
                                   }) {
    const navbarToggleRef = useRef(null);

    // The XY sliders are only truly visible when the mode is 'poem' or 'line' AND the visibility flag is set.
    // This ensures the navigation layout syncs perfectly with the actual visibility of the sliders.
    const areSlidersEffectivelyVisible = (moveMode === 'poem' || moveMode === 'line') && xySlidersVisible;

    // Selection analysis for subtle indicators
    const selectionInfo = () => {
        if (!selectedLines || selectedLines.size === 0) {
            return {type: 'none', count: 0, description: 'No selection'};
        }

        const hasTitle = selectedLines.has(-2);
        const hasAuthor = selectedLines.has(-1);
        const poemLineCount = Array.from(selectedLines).filter(idx => idx >= 0).length;

        if (hasTitle && hasAuthor && poemLineCount > 0) {
            return {type: 'all', count: selectedLines.size, description: `All (${poemLineCount} lines + title + author)`};
        } else if (hasTitle && poemLineCount > 0) {
            return {type: 'lines-title', count: selectedLines.size, description: `${poemLineCount} lines + title`};
        } else if (hasAuthor && poemLineCount > 0) {
            return {type: 'lines-author', count: selectedLines.size, description: `${poemLineCount} lines + author`};
        } else if (poemLineCount > 0) {
            return {type: 'lines-only', count: poemLineCount, description: `${poemLineCount} poem lines`};
        } else if (hasTitle && hasAuthor) {
            return {type: 'title-author', count: 2, description: 'Title + author'};
        } else if (hasTitle) {
            return {type: 'title-only', count: 1, description: 'Title only'};
        } else if (hasAuthor) {
            return {type: 'author-only', count: 1, description: 'Author only'};
        }

        return {type: 'other', count: selectedLines.size, description: `${selectedLines.size} items`};
    };

    const selection = selectionInfo();

    // Determine sync section class based on the effective visibility of the XY sliders
    const syncSectionClass = areSlidersEffectivelyVisible
        ? `${styles.syncSection} ${styles.withXySlidersVisible}`
        : `${styles.syncSection} ${styles.withXySlidersHidden}`;

    return (
        <div className={styles.navContainer}>
            <div className={styles.panelHeader}>
                <h3>Navigation</h3>
                <div className={styles.headerButtons}>
                    {/* Toggle Navbar Overlay Button */}
                    {onToggleNavbarOverlay && (
                        <>
                            <button
                                ref={navbarToggleRef}
                                onClick={onToggleNavbarOverlay}
                                className={styles.navbarToggleButton}
                                aria-label="Open navigatie menu"
                                title="Open navigatie menu"
                            >
                                ☰
                            </button>
                            <HintLabel
                                targetRef={navbarToggleRef}
                                text="Open nav-menu hier: →"
                                duration={6000}
                            />
                        </>
                    )}
                    <button
                        onClick={toggle}
                        className={styles.closeButton}
                        aria-label="Collapse Navigation"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Selection Indicator */}
            <div className={styles.selectionIndicator}>
                <div className={styles.selectionLabel}>Selection</div>
                <div
                    className={`${styles.selectionStatus} ${styles[selection.type]}`}
                >
                    {selection.description}
                </div>
            </div>

            {/* Anchor for XY sliders positioning */}
            <div id="xy-sliders-anchor" className={styles.xyAnchor}></div>

            {/* Save Design Button */}
            {poemData && (
                <div className={styles.saveSection}>
                    <SaveDesignButton
                        poemData={poemData}
                        canvasState={canvasState}
                        currentDesignId={currentDesignId}
                    />
                </div>
            )}

            {/* Sync Actions - dynamically positioned based on XY sliders visibility */}
            <div className={syncSectionClass}>
                <MoveControls
                    moveMode={moveMode}
                    setMoveMode={setMoveMode}
                    selectedLines={selectedLines}
                    clearSelection={clearSelection}
                    activeShortcut={activeShortcut}
                    setXySlidersVisible={setXySlidersVisible}
                />
                <div className={styles.buttonGroup}>
                    <div className={styles.syncLabel}>Sync to Global</div>
                    <button
                        type="button"
                        className={styles.syncButton}
                        onClick={onSyncAllColorsToGlobal}
                        title="Reset alle kleuren naar globaal"
                    >
                        🎨
                    </button>
                    <button
                        type="button"
                        className={styles.syncButton}
                        onClick={onSyncAllFontsToGlobal}
                        title="Reset alle fonts naar globaal"
                    >
                        🔤
                    </button>
                </div>
                <div className={styles.buttonGroup}>
                    <div className={styles.syncLabel}>Highlight Ctrl.</div>
                    <button
                        type="button"
                        className={`${styles.syncButton} ${
                            !highlightVisible ? styles.toggledOff : ""
                        }`}
                        onClick={() => setHighlightVisible(!highlightVisible)}
                        title={
                            highlightVisible ? "Turn off highlight" : "Turn on highlight"
                        }
                    >
                        {highlightVisible ? "🟡" : "⚫"}
                    </button>
                </div>
            </div>
            {/* Move Controls */}

            {/* Floating Shortcut Panel */}
            <FloatingShortcutPanel
                moveMode={moveMode}
                selectedLines={selectedLines}
                activeShortcut={activeShortcut}
                xySlidersVisible={xySlidersVisible}
                navWidth={navWidth}
            />
        </div>
    );
}
