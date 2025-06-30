/**
 * useSearchOrchestration Hook
 * Manages complex state orchestration for search results
 * Handles poem states, navigation, global toggles, and height calculations
 * Extracted from SearchResults for better separation of concerns
 */

import {useState, useCallback, useEffect, useTransition, useDeferredValue, startTransition} from 'react';
import {getCarouselPoemHeight} from '@/utils/carouselHeightCache';
import {calculateCollapseScroll} from '@/utils/scrollUtils';
import {analyzeExpandablePoems} from '@/utils/shortPoemUtils';
import searchContextService from '@/services/context/searchContextService';

export const useSearchOrchestration = (results, layout) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [navigationDirection, setNavigationDirection] = useState('initial');
    const [hasLoadedPosition, setHasLoadedPosition] = useState(false);

    // UNIFIED STATE MANAGEMENT - elk gedicht heeft zijn eigen complete state
    const [poemStates, setPoemStates] = useState({}); // { [index]: { expanded: false, phase: 'idle', height: null, globalTrigger: null } }
    const [preCalculatedHeights, setPreCalculatedHeights] = useState({}); // Cache voor alle heights
    const [isPending, startTransition] = useTransition(); // Voor smooth state updates

    // Deferred values for smooth animations
    const deferredPoemStates = useDeferredValue(poemStates);
    const deferredCurrentIndex = useDeferredValue(currentIndex);

    // Helper function om poem state te updaten
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

    // Load carousel position from context on mount
    useEffect(() => {
        if (!hasLoadedPosition && results && results.length > 0) {
            const loadPosition = async () => {
                try {
                    const context = await searchContextService.loadContext();
                    if (context && context.carouselPosition !== undefined && context.carouselPosition !== null) {
                        // Ensure carouselPosition is a valid number
                        const position = typeof context.carouselPosition === 'number' ? context.carouselPosition : parseInt(context.carouselPosition, 10);
                        if (!isNaN(position)) {
                            // Validate position is within bounds
                            const savedPosition = Math.max(0, Math.min(position, results.length - 1));
                            setCurrentIndex(savedPosition);
                            console.log('Loaded carousel position from context:', savedPosition);
                        } else {
                            console.warn('Invalid carousel position in context:', context.carouselPosition);
                            setCurrentIndex(0);
                            // Clear invalid position from cache
                            await searchContextService.saveCarouselPosition(0);
                        }
                    } else {
                        // No carousel position in context, default to 0
                        setCurrentIndex(0);
                    }
                    setHasLoadedPosition(true);
                } catch (error) {
                    console.error('Failed to load carousel position:', error);
                    setHasLoadedPosition(true);
                }
            };
            loadPosition();
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

    // Pre-calculate heights voor alle zichtbare + carousel gedichten
    useEffect(() => {
        const preCalculateHeights = async () => {
            if (!results || results.length === 0 || !layout.indicesToCalculate) return;

            const cardWidth = layout.isDesktop ? 570 : 350;
            const newHeights = {};

            // Bereken heights parallel
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
                    console.error(`Error calculating height for poem ${index}:`, error);
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

    // Navigation handlers
    const handlePrevious = useCallback(async () => {
        if (!layout.isCarousel) return;

        const newIndex = (currentIndex - 1 + layout.resultCount) % layout.resultCount;

        console.log('🔍 CAROUSEL NAV PREV - State Analysis:');
        console.log('Current Index:', currentIndex, '→ New Index:', newIndex);

        setNavigationDirection('prev');
        setCurrentIndex(newIndex);

        // Save carousel position to context
        await searchContextService.saveCarouselPosition(newIndex);

        // Cleanup: Reset navigation direction na korte delay
        setTimeout(() => {
            setNavigationDirection('initial');
        }, 500);
    }, [layout.isCarousel, layout.resultCount, currentIndex]);

    const handleNext = useCallback(async () => {
        if (!layout.isCarousel) return;

        const newIndex = (currentIndex + 1) % layout.resultCount;

        console.log('🔍 CAROUSEL NAV NEXT - State Analysis:');
        console.log('Current Index:', currentIndex, '→ New Index:', newIndex);

        setNavigationDirection('next');
        setCurrentIndex(newIndex);

        // Save carousel position to context
        await searchContextService.saveCarouselPosition(newIndex);

        // Cleanup: Reset navigation direction na korte delay
        setTimeout(() => {
            setNavigationDirection('initial');
        }, 500);
    }, [layout.isCarousel, layout.resultCount, currentIndex]);

    // NIEUWE GLOBAL TOGGLE - werkt met unified poem states
    const handleGlobalExpandToggle = useCallback(() => {
        console.log('Global toggle triggered - current poem states:', poemStates);

        // Bepaal welke gedichten relevant zijn - VOOR BESLISSING: gebruik zichtbare gedichten
        const visibleIndices = layout.visibleIndices.map(item => item.actualIndex);

        // Analyseer welke gedichten daadwerkelijk kunnen expanderen
        const expandableAnalysis = analyzeExpandablePoems(results, visibleIndices);

        if (!expandableAnalysis.hasExpandablePoems) {
            console.log('No expandable poems found - skipping global toggle');
            return;
        }

        // Check zichtbare expandable gedichten voor beslissing expand/collapse
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

        // Voor ACTIE: gebruik dezelfde scope als voor BESLISSING - alleen zichtbare expandable gedichten
        const actionIndices = new Set();
        expandableAnalysis.expandableIndices.forEach(index => actionIndices.add(index));

        // BESLISSING gebaseerd op ZICHTBARE gedichten
        const shouldExpandAll = !allVisibleExpanded;
        const action = shouldExpandAll ? 'expand' : 'collapse';

        console.log(`Global toggle action: ${action}`);

        // Trigger voor alle relevante gedichten die in idle state zijn
        const trigger = {
            action,
            timestamp: Date.now(),
            source: 'global'
        };

        startTransition(() => {
            // Update alle relevante poem states met global trigger
            const updates = {};

            actionIndices.forEach(index => {
                const currentState = poemStates[index];
                const currentPhase = currentState?.phase || 'idle';

                // Voor expand: alleen idle state, voor collapse: idle OF complete state
                const canExpand = currentPhase === 'idle' && !currentState?.expanded;
                const canCollapse = (currentPhase === 'idle' || currentPhase === 'complete') && currentState?.expanded;

                if (shouldExpandAll && canExpand) {
                    updates[index] = {globalTrigger: trigger};
                    console.log(`Setting global expand trigger for poem ${index}`);
                } else if (!shouldExpandAll && canCollapse) {
                    updates[index] = {globalTrigger: trigger};
                    console.log(`Setting global collapse trigger for poem ${index}`);
                } else {
                    console.log(`Skipping poem ${index} - phase: ${currentPhase}, expanded: ${currentState?.expanded}, action: ${action}`);
                }
            });

            // Apply alle updates tegelijk
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

                console.log('Applied global triggers to poems:', Object.keys(updates));

                // Voor global collapse: scroll naar resultsOverview na een korte delay
                if (!shouldExpandAll) {
                    setTimeout(() => {
                        const scrollInfo = calculateCollapseScroll('.resultsOverview', 100);

                        if (scrollInfo.shouldScroll) {
                            console.log('Global collapse: scrolling to resultsOverview');

                            // Smooth scroll animatie
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
                    }, 600); // Wacht tot collapse animaties zijn begonnen
                }
            } else {
                console.log('No poems available for global toggle (all busy or no state changes needed)');
            }
        });
    }, [poemStates, layout.isCarousel, layout.resultCount, layout.visibleIndices, results]);

    // Helper function om expanded status te bepalen voor UI
    const getExpandedState = useCallback((index) => {
        return poemStates[index]?.expanded || false;
    }, [poemStates]);

    // Helper function voor VISUAL button text - alleen zichtbare expandable gedichten tellen
    const getGlobalToggleState = useCallback(() => {
        // Voor button text: ALTIJD alleen zichtbare gedichten tellen (max 3)
        const visibleIndices = layout.visibleIndices.map(item => item.actualIndex);

        // Analyseer welke zichtbare gedichten kunnen expanderen
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
            totalCount: expandableAnalysis.expandableIndices.length, // Alleen expandable gedichten
            hasAnyExpanded: expandedCount > 0
        };
    }, [poemStates, layout.visibleIndices, results]);

    // Navigation handler for carousel dots
    const handleNavigateToIndex = useCallback(async (targetIndex, options = {}) => {
        // Validate targetIndex is a valid number
        const validIndex = typeof targetIndex === 'number' ? targetIndex : parseInt(targetIndex, 10);
        if (isNaN(validIndex) || validIndex < 0) {
            console.error('Invalid targetIndex provided to handleNavigateToIndex:', targetIndex);
            return;
        }
        targetIndex = validIndex;
        // FEATURE 1: Auto-collapse all poems when navigating to new series
        if (options.seriesChange) {
            console.log('Series change detected - collapsing all poems');

            // Trigger global collapse for all expanded poems
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
            setTimeout(async () => {
                setCurrentIndex(targetIndex);
                setNavigationDirection('series-change');

                // Save carousel position after series change
                await searchContextService.saveCarouselPosition(targetIndex);

                setTimeout(() => setNavigationDirection('initial'), 800);
            }, 200);

            return;
        }

        // Regular navigation
        const direction = targetIndex > currentIndex ? 'next' : 'prev';
        setNavigationDirection(direction);
        setCurrentIndex(targetIndex);

        // Save carousel position to context
        await searchContextService.saveCarouselPosition(targetIndex);

        // Cleanup
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

export default useSearchOrchestration;