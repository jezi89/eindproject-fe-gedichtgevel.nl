/**
 * SearchResults Component
 *
 * Displays search results for poems with expandable/collapsible details.
 *
 * @module components/search/SearchResults
 */

import {memo, useCallback, useRef, useState} from 'react';
import {LayoutGroup, motion} from 'framer-motion';
import styles from './SearchResults.module.scss';
import {ResultsOverview} from './ResultsOverview';
import {useSearchLayout, useSearchOrchestration} from '@/hooks/search';
import {PoemResultItem} from '@/components/poem';
import {CarouselArrows} from './CarrouselArrows';
import {CarouselDots} from './CarrouselDots';

/**
 * SearchResults component for displaying poem search results
 *
 * @component
 * @param {Object} props
 * @param {Array} props.results - Array of poem objects
 * @param {string} props.layoutMode - Layout mode: 'search' or 'daily'
 * @param {string} props.cardSize - Card size: 'normal' or 'compact'
 * @param {boolean} props.showGlobalToggle - Show global expand/collapse toggle
 * @param {string} props.sectionTitle - Optional section title
 * @param {string} props.sectionSubtitle - Optional section subtitle
 * @returns {JSX.Element|null} Search results container or null if no results
 */
export const SearchResults = memo(({
                                       results,
                                       searchTerm,
                                       focusMode = false,
                                       canvasMode = false,
                                       layoutMode = 'search',
                                       cardSize = 'normal',
                                       showGlobalToggle = true,
                                       sectionTitle,
                                       sectionSubtitle,
                                       onPoemSelect,
                                       onLoadInCanvas,
                                       onNavigateToCanvas,
                                       onNavigateToRecording,
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

    const isDailyMode = layoutMode === 'daily';

    return (
        <div
            ref={searchResultsRef}
            className={`${styles.searchResultsSection} ${canvasMode ? styles.canvasMode : ''} ${isDailyMode ? styles.dailyMode : ''}`}
        >
            {/* Section header for daily mode */}
            {isDailyMode && sectionTitle && (
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
                    {sectionSubtitle && (
                        <p className={styles.sectionSubtitle}>{sectionSubtitle}</p>
                    )}
                </div>
            )}

            {/* Results overview - hidden in canvas mode, focus mode, and daily mode */}
            {!canvasMode && !focusMode && !isDailyMode && ResultsOverviewComponent && (
                <div>
                    <ResultsOverviewComponent
                        resultCount={updatedLayout.resultCount}
                        variant="circle"
                        {...resultsOverviewProps}
                    />
                </div>
            )}

            {/* Carousel dots/indicators - show above results container */}
            {!isDailyMode && updatedLayout.isCarousel && (
                <CarouselDots
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
                                        onNavigateToCanvas={onNavigateToCanvas}
                                        onNavigateToRecording={onNavigateToRecording}
                                        onCollapseEvent={handleCollapseEvent}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </LayoutGroup>

                {/* Carousel arrows - only in search mode */}
                {!isDailyMode && updatedLayout.isCarousel && (
                    <CarouselArrows
                        onPrevious={orchestration.handlePrevious}
                        onNext={orchestration.handleNext}
                        hasMultiple={updatedLayout.hasMultiple}
                        searchResultsRef={searchResultsRef}
                        canvasMode={canvasMode}
                    />
                )}
            </div>
        </div>
    );
});
