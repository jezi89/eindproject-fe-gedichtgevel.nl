/**
 * useSearchOrchestration Hook
 * Unified search state management combining layout, navigation, and poem state
 * Controls carousel navigation, poem expand/collapse, and global operations
 * Extracted from SearchResults for better separation of concerns
 */

import {useCallback, useDeferredValue, useEffect, useState, useTransition} from 'react';
import {calculateCollapseScroll, getCarouselPoemHeight} from '@/utils/poemHeightCalculator';
import {analyzeExpandablePoems} from '@/utils/shortPoemUtils.js';

// LocalStorage key for carousel position
const CAROUSEL_POSITION_KEY = 'gedichtgevel_carousel_position';

export const useSearchOrchestration = (results, layout) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [navigationDirection, setNavigationDirection] = useState('initial');
    const [hasLoadedPosition, setHasLoadedPosition] = useState(false);

    // UNIFIED STATE MANAGEMENT - each poem has its own complete state
    const [poemStates, setPoemStates] = useState({}); // { [index]: { expanded: false, phase: 'idle', height: null, globalTrigger: null } }
    const [preCalculatedHeights, setPreCalculatedHeights] = useState({}); // Cache for all heights
    const [isPending, startTransition] = useTransition(); // For smooth state updates

    // Deferred values for smooth animations
    const deferredPoemStates = useDeferredValue(poemStates);
    const deferredCurrentIndex = useDeferredValue(currentIndex);

    // Helper function to update poem state
    const updatePoemState = useCallback((index, updates) => {
        setPoemStates(prev => ({
            ...prev,
            [index]: {
                expanded: false,
                phase: 'idle',
                height: null,
                globalTrigger: null,
                ...prev[index],
                ...updates
            }
        }));
    }, []);

    // Load carousel position from localStorage on mount
    useEffect(() => {
        if (!hasLoadedPosition && results && results.length > 0) {
            try {
                const savedPosition = localStorage.getItem(CAROUSEL_POSITION_KEY);
                if (savedPosition !== null) {
                    const position = parseInt(savedPosition, 10);
                    if (!isNaN(position)) {
                        // Validate position is within bounds
                        const validPosition = Math.max(0, Math.min(position, results.length - 1));
                        setCurrentIndex(validPosition);

                    } else {

                        setCurrentIndex(0);
                        localStorage.setItem(CAROUSEL_POSITION_KEY, '0');
                    }
                } else {
                    // No saved position, default to 0
                    setCurrentIndex(0);
                }
            } catch (error) {

                setCurrentIndex(0);
            }
            setHasLoadedPosition(true);
        }
    }, [results, hasLoadedPosition]);

    // Initialize poem states for all results
    useEffect(() => {
        if (!results || results.length === 0) return;

        const newStates = {};
        results.forEach((poem, index) => {
            if (!poemStates[index]) {
                newStates[index] = {
                    expanded: false,
                    phase: 'idle',
                    height: null,
                    globalTrigger: null
                };
            }
        });

        if (Object.keys(newStates).length > 0) {
            setPoemStates(prev => ({...prev, ...newStates}));
        }
    }, [results, poemStates]);

    // Pre-calculate heights for all visible + carousel poems
    useEffect(() => {
        const preCalculateHeights = async () => {
            if (!results || results.length === 0 || !layout.indicesToCalculate) return;

            const cardWidth = layout.isDesktop ? 570 : 350;
            const newHeights = {};

            const heightPromises = Array.from(layout.indicesToCalculate).map(async (index) => {
                const poem = results[index];
                if (!poem || !poem.lines || poem.lines.length <= 4) return null;

                try {
                    const heightInfo = await getCarouselPoemHeight(
                        poem,
                        index,
                        results,
                        'initial',
                        window.innerWidth,
                        cardWidth
                    );
                    return {index, heightInfo};
                } catch (error) {

                    return null;
                }
            });

            const heightResults = await Promise.all(heightPromises);
            heightResults.forEach(result => {
                if (result && result.heightInfo) {
                    newHeights[result.index] = result.heightInfo;
                }
            });

            setPreCalculatedHeights(newHeights);
        };

        preCalculateHeights();
    }, [results, currentIndex, layout.isCarousel, layout.resultCount, layout.isDesktop, layout.indicesToCalculate]);

    const handlePrevious = useCallback(() => {
        if (!layout.isCarousel) return;

        const newIndex = (currentIndex - 1 + layout.resultCount) % layout.resultCount;

        setNavigationDirection('prev');
        setCurrentIndex(newIndex);

        // Save carousel position to localStorage
        localStorage.setItem(CAROUSEL_POSITION_KEY, String(newIndex));

        // Reset navigation direction after short delay
        setTimeout(() => {
            setNavigationDirection('initial');
        }, 500);
    }, [layout.isCarousel, layout.resultCount, currentIndex]);

    const handleNext = useCallback(() => {
        if (!layout.isCarousel) return;

        const newIndex = (currentIndex + 1) % layout.resultCount;

        setNavigationDirection('next');
        setCurrentIndex(newIndex);

        // Save carousel position to localStorage
        localStorage.setItem(CAROUSEL_POSITION_KEY, String(newIndex));

        // Reset navigation direction after short delay
        setTimeout(() => {
            setNavigationDirection('initial');
        }, 500);
    }, [layout.isCarousel, layout.resultCount, currentIndex]);

    // GLOBAL TOGGLE - works with unified poem states
    const handleGlobalExpandToggle = useCallback(() => {
        // Determine which poems are relevant - FOR DECISION: use visible poems
        const visibleIndices = layout.visibleIndices.map(item => item.actualIndex);

        const expandableAnalysis = analyzeExpandablePoems(results, visibleIndices);

        if (!expandableAnalysis.hasExpandablePoems) {

            return;
        }

        // Check visible expandable poems for expand/collapse decision
        const visibleStates = expandableAnalysis.expandableIndices.map(index => {
            const state = poemStates[index];
            return {
                index,
                expanded: state?.expanded || false,
                phase: state?.phase || 'idle'
            };
        });

        const visibleExpandedCount = visibleStates.filter(s => s.expanded).length;
        const allVisibleExpanded = visibleExpandedCount === visibleStates.length && visibleExpandedCount > 0;

        // For ACTION: use same scope as for DECISION - only visible expandable poems
        const actionIndices = new Set();
        expandableAnalysis.expandableIndices.forEach(index => actionIndices.add(index));

        // DECISION based on VISIBLE poems
        const shouldExpandAll = !allVisibleExpanded;
        const action = shouldExpandAll ? 'expand' : 'collapse';

        const trigger = {
            action,
            timestamp: Date.now(),
            source: 'global'
        };

        startTransition(() => {
            const updates = {};

            actionIndices.forEach(index => {
                const currentState = poemStates[index];
                const currentPhase = currentState?.phase || 'idle';

                // For expand: only idle state, for collapse: idle OR complete state
                const canExpand = currentPhase === 'idle' && !currentState?.expanded;
                const canCollapse = (currentPhase === 'idle' || currentPhase === 'complete') && currentState?.expanded;

                if (shouldExpandAll && canExpand) {
                    updates[index] = {globalTrigger: trigger};

                } else if (!shouldExpandAll && canCollapse) {
                    updates[index] = {globalTrigger: trigger};

                } else {

                }
            });

            if (Object.keys(updates).length > 0) {
                setPoemStates(prev => {
                    const newStates = {...prev};
                    Object.entries(updates).forEach(([index, update]) => {
                        newStates[index] = {
                            expanded: false,
                            phase: 'idle',
                            height: null,
                            globalTrigger: null,
                            ...prev[index],
                            ...update
                        };
                    });
                    return newStates;
                });

                // For global collapse: scroll to resultsOverview after short delay
                if (!shouldExpandAll) {
                    setTimeout(() => {
                        const scrollInfo = calculateCollapseScroll('.resultsOverview', 100);

                        if (scrollInfo.shouldScroll) {
                            const startPosition = window.scrollY;
                            const targetPosition = scrollInfo.targetPosition;
                            const duration = scrollInfo.estimatedDuration;
                            let startTime = null;

                            const animation = (currentTime) => {
                                if (startTime === null) startTime = currentTime;
                                const timeElapsed = currentTime - startTime;
                                const progress = Math.min(timeElapsed / duration, 1);

                                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                                window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeOutCubic);

                                if (progress < 1) {
                                    requestAnimationFrame(animation);
                                }
                            };

                            requestAnimationFrame(animation);
                        }
                    }, 600); // Wait for collapse animations to start
                }
            }
        });
    }, [poemStates, layout.isCarousel, layout.resultCount, layout.visibleIndices, results]);

    // Helper function to determine expanded status for UI
    const getExpandedState = useCallback((index) => {
        return poemStates[index]?.expanded || false;
    }, [poemStates]);

    // Helper function for VISUAL button text - only count visible expandable poems
    const getGlobalToggleState = useCallback(() => {
        // For button text: ALWAYS only count visible poems (max 3)
        const visibleIndices = layout.visibleIndices.map(item => item.actualIndex);

        const expandableAnalysis = analyzeExpandablePoems(results, visibleIndices);

        if (!expandableAnalysis.hasExpandablePoems) {
            return {
                allExpanded: false,
                expandedCount: 0,
                totalCount: 0,
                hasAnyExpanded: false
            };
        }

        const expandedStates = expandableAnalysis.expandableIndices.map(index => ({
            index,
            expanded: poemStates[index]?.expanded || false,
            phase: poemStates[index]?.phase || 'idle'
        }));

        const expandedCount = expandedStates.filter(state => state.expanded).length;
        const allExpanded = expandedCount === expandableAnalysis.expandableIndices.length && expandedCount > 0;

        return {
            allExpanded,
            expandedCount,
            totalCount: expandableAnalysis.expandableIndices.length, // Only expandable poems
            hasAnyExpanded: expandedCount > 0
        };
    }, [poemStates, layout.visibleIndices, results]);

    const handleNavigateToIndex = useCallback((targetIndex, options = {}) => {
        // Validate targetIndex is a valid number
        const validIndex = typeof targetIndex === 'number' ? targetIndex : parseInt(targetIndex, 10);
        if (isNaN(validIndex) || validIndex < 0) {
            return;
        }
        targetIndex = validIndex;

        // FEATURE: Auto-collapse all poems when navigating to new series
        if (options.seriesChange) {
            const collapseUpdates = {};
            Object.keys(poemStates).forEach(index => {
                const state = poemStates[index];
                if (state?.expanded && (state.phase === 'complete' || state.phase === 'revealing')) {
                    collapseUpdates[index] = {
                        globalTrigger: {
                            action: 'collapse',
                            timestamp: Date.now(),
                            source: 'series-change'
                        }
                    };
                }
            });

            if (Object.keys(collapseUpdates).length > 0) {
                setPoemStates(prev => {
                    const newStates = {...prev};
                    Object.entries(collapseUpdates).forEach(([index, update]) => {
                        newStates[index] = {
                            expanded: false,
                            phase: 'idle',
                            height: null,
                            globalTrigger: null,
                            ...prev[index],
                            ...update
                        };
                    });
                    return newStates;
                });
            }

            // Wait for collapse animations before navigating
            setTimeout(() => {
                setCurrentIndex(targetIndex);
                setNavigationDirection('series-change');

                // Save carousel position after series change
                localStorage.setItem(CAROUSEL_POSITION_KEY, String(targetIndex));

                setTimeout(() => setNavigationDirection('initial'), 800);
            }, 200);

            return;
        }

        const direction = targetIndex > currentIndex ? 'next' : 'prev';
        setNavigationDirection(direction);
        setCurrentIndex(targetIndex);

        // Save carousel position to localStorage
        localStorage.setItem(CAROUSEL_POSITION_KEY, String(targetIndex));

        setTimeout(() => {
            setNavigationDirection('initial');
        }, 100);
    }, [currentIndex, poemStates]);

    return {
        // State
        currentIndex,
        navigationDirection,
        poemStates,
        preCalculatedHeights,
        isPending,
        deferredPoemStates,
        deferredCurrentIndex,

        // Actions
        updatePoemState,
        handlePrevious,
        handleNext,
        handleGlobalExpandToggle,
        handleNavigateToIndex,

        // Helpers
        getExpandedState,
        getGlobalToggleState
    };
};

