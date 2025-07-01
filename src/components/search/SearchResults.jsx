/**
 * SearchResults Component
 *
 * Displays search results for poems with expandable/collapsible details.
 *
 * @module components/search/SearchResults
 */

import {memo, useRef, useCallback, useState} from 'react';
import {motion, LayoutGroup} from 'framer-motion';
import styles from './SearchResults.module.scss';
import CarrouselDots from './CarrouselDots.jsx';
import CarrouselArrows from './CarrouselArrows';
import PoemResultItem from '../poem/PoemResultItem.jsx';
import ResultsOverview from './ResultsOverview';
import {useSearchLayout, useSearchOrchestration} from '@/hooks/search';

/**
 * SearchResults component for displaying poem search results
 *
 * @component
 * @param {Object} props
 * @param {Array} props.results - Array of poem objects
 * @returns {JSX.Element|null} Search results container or null if no results
 */
const SearchResults = memo(({
                                results,
                                onOpenFocusStudio,
                                searchTerm,
                                focusMode = false,
                                canvasMode = false,
                                onPoemSelect,
                                onLoadInCanvas,
                                hideSeriesNavigation = false,
                                hideRangeIndicator = false,
                                initialIndex = 0,
                                ResultsOverviewComponent = ResultsOverview,
                                resultsOverviewProps = {}
                            }) => {
    // Hooks before early return
    // Refs and state for dynamic positioning
    const searchResultsRef = useRef(null);
    const [collapseEventCounter, setCollapseEventCounter] = useState(0);

    // custom hooks for layout and orchestration
    const layout = useSearchLayout(results || [], initialIndex); // Start with saved index
    const orchestration = useSearchOrchestration(results || [], layout);

    // Update layout hook with current index from orchestration
    const updatedLayout = useSearchLayout(results || [], orchestration.currentIndex);

    // Collapse event handler (currently unused but kept for future use)
    const handleCollapseEvent = useCallback(() => {
        setCollapseEventCounter(prev => prev + 1);
    }, []);

    // Early return for empty results AFTER all hooks
    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div
            ref={searchResultsRef}
            className={`${styles.searchResultsSection} ${canvasMode ? styles.canvasMode : ''}`}
        >
            {/* Results overview - hidden in canvas mode and focus mode */}
            {!canvasMode && !focusMode && ResultsOverviewComponent && (
                <div>
                    <ResultsOverviewComponent
                        resultCount={updatedLayout.resultCount}
                        variant="circle"
                        {...resultsOverviewProps}
                    />
                </div>
            )}

            {/* Focus Studio Button - should only show when not in Focus Studio, currently also checking if we are using CanvasMode */}
            {/*// TODO Checken of check of we in CanvasMode zijn overbodig is*/}
            {!focusMode && onOpenFocusStudio && searchTerm && !canvasMode && (

                <div
                    className={styles.globalToggleContainer}
                >
                    <button
                        className={`${styles.globalToggleButton} ${styles.focusStudioButton}`}
                        onClick={() => onOpenFocusStudio(searchTerm)}
                        aria-label="Open Focus Studio voor geconcentreerd zoeken"
                    >
                        <span className={styles.toggleIcon}>🎯</span>
                        Open Focus Studio
                    </button>
                </div>
            )}
            {/* Global Expand/Collapse Toggle - only for expandable poems and NOT in canvas/focus mode */}
            {/*// TODO Checken of CanvasMode Check nodig is en hoe de orchestration hier precies werkt*/}
            {updatedLayout.hasMultiple && !canvasMode && !focusMode && orchestration.getGlobalToggleState().totalCount > 0 && (
                <div
                    className={styles.globalToggleContainer}
                >
                    <button
                        className={styles.globalToggleButton}
                        onClick={orchestration.handleGlobalExpandToggle}
                        aria-label={(() => {
                            const toggleState = orchestration.getGlobalToggleState();
                            return toggleState.allExpanded ? "Klap alle lange gedichten in" : "Klap alle lange gedichten uit";
                        })()}
                        aria-expanded={(() => {
                            const toggleState = orchestration.getGlobalToggleState();
                            return toggleState.allExpanded ? "true" : toggleState.hasAnyExpanded ? "partial" : "false";
                        })()}
                    >
                            <span className={styles.toggleIcon}>
                                {(() => {
                                    const toggleState = orchestration.getGlobalToggleState();
                                    return toggleState.allExpanded ? "✓" : toggleState.hasAnyExpanded ? "▣" : "☐";
                                })()}
                            </span>
                        {(() => {
                            const toggleState = orchestration.getGlobalToggleState();
                            if (toggleState.totalCount === 0) return "Geen lange gedichten";
                            return toggleState.allExpanded
                                ? "Alle lange gedichten inklappen"
                                : toggleState.hasAnyExpanded
                                    ? `${toggleState.expandedCount}/${toggleState.totalCount} lange gedichten uitgeklapt - Klap rest uit`
                                    : "Alle lange gedichten uitklappen";
                        })()}
                    </button>
                </div>
            )}

            {/* TODO Test if visible and hidden dots indicator works correctly */}
            {/* carrousel dots indicator for  4+ poems  - only on homepage (not in focus mode) */}

            {updatedLayout.isDesktop && !canvasMode && !focusMode && (
                <CarrouselDots
                    totalCount={updatedLayout.resultCount}
                    currentIndex={orchestration.currentIndex}
                    onNavigate={orchestration.handleNavigateToIndex}
                    hideSeriesNavigation={hideSeriesNavigation}
                    hideRangeIndicator={hideRangeIndicator}
                />
            )}

            <div className={`${styles.resultsContainer} ${styles[updatedLayout.layoutClass]}`}>
                <LayoutGroup>
                    <motion.div
                        className={`${styles.resultsList}`}
                        initial={{opacity: 1}}
                        animate={{opacity: 1}}
                        transition={{
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{position: 'relative'}} // Ensure relative positioning for arrows
                    >
                        {/* carrousel Navigation Arrows - static positioning only */}
                        {updatedLayout.iscarrousel && updatedLayout.isDesktop && (
                            <CarrouselArrows
                                onPrevious={orchestration.handlePrevious}
                                onNext={orchestration.handleNext}
                                hasMultiple={updatedLayout.hasMultiple}
                                allowDynamicPositioning={false}
                                canvasMode={canvasMode}
                            />
                        )}

                        {/* TODO Checken of dit allemaal nodig is */}
                        {updatedLayout.visibleResults.map((poem, displayIndex) => {
                            const actualIndex = updatedLayout.getActualIndexFromDisplay(displayIndex);

                            // CRITICAL: Validate actualIndex to prevent NaN keys
                            const safeActualIndex = isNaN(actualIndex) ? displayIndex : actualIndex;
                            const keyPrefix = updatedLayout.iscarrousel ? 'carrousel' : 'static';
                            const safeKey = `${keyPrefix}-${safeActualIndex}`;

                            // Additional validation for poem existence
                            if (!poem) {
                                // Missing poem at displayIndex
                                return null;
                            }

                            return (
                                <motion.div
                                    key={safeKey}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                        delay: displayIndex * 0.1
                                    }}
                                >
                                    <PoemResultItem
                                        poem={poem}
                                        index={safeActualIndex}
                                        allPoems={results}
                                        navigationDirection={orchestration.navigationDirection}
                                        poemState={orchestration.poemStates[safeActualIndex]}
                                        onPoemStateChange={orchestration.updatePoemState}
                                        preCalculatedHeight={orchestration.preCalculatedHeights[safeActualIndex]}
                                        canvasMode={canvasMode}
                                        onPoemSelect={onPoemSelect}
                                        onLoadInCanvas={onLoadInCanvas}
                                        onCollapseEvent={handleCollapseEvent}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </LayoutGroup>
            </div>
        </div>
    );
});

// Add display names for debugging
SearchResults.displayName = 'SearchResults';

export default SearchResults;