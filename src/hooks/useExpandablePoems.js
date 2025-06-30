// TODO Werking useExpandablePoems.js testen en controleren of alles nog werkt na refactor

/**
 * useExpandablePoem Hook
 * Expand/collapse animation logic from PoemResultItem
 * Manages poem expansion state and animations
 */

import {useCallback, useEffect, useRef} from 'react';
import {
    calculateOptimalScroll,
    calculateCollapseScroll,
    isSmallPoem
} from '@/utils/poemHeightCalculator';

const useExpandablePoem = (
    poem,
    index,
    poemState,
    onPoemStateChange,
    finalHeightInfo,
    expandablePreview,
    allPoems,
    styles,
    onCollapseEvent
) => {
    const cardRef = useRef(null);

    // Extract state from poemState
    const animationPhase = poemState?.phase || 'idle';
    const isExpanded = poemState?.expanded || false;

    // Update poem state helper
    const updatePoemState = useCallback((updates) => {
        // Poem state update
        onPoemStateChange(index, updates);
    }, [index, onPoemStateChange]);

    // Expand function for poems > 4 lines
    const expandPoem = useCallback(async () => {
        if (animationPhase !== 'idle' || !expandablePreview.isExpandable) {
            return;
        }

        if (!finalHeightInfo || !finalHeightInfo.totalHeight) {
            return;
        }

        // Determine if this is a small poem using utility function
        const isSmallPoemValue = isSmallPoem(poem);

        if (isSmallPoemValue) {
            // Small poems: Immediate expansion with fade-in
            updatePoemState({phase: 'revealing', expanded: true});

            // Wait brief moment for DOM update, then complete
            await new Promise(resolve => setTimeout(resolve, 100));
            updatePoemState({phase: 'complete'});
        } else {
            // Large poems: Smooth expansion with staggered text reveal
            updatePoemState({phase: 'expanding', expanded: true});

            // Wait for container expansion (slower for larger poems)
            await new Promise(resolve => setTimeout(resolve, 600));

            // Start revealing content
            updatePoemState({phase: 'revealing'});

            // Wait for staggered text reveal
            await new Promise(resolve => setTimeout(resolve, 800));

            updatePoemState({phase: 'complete'});
        }

        // Scroll optimization after expansion
        const scrollInfo = calculateOptimalScroll(cardRef.current, finalHeightInfo, 80);
        if (scrollInfo.shouldScroll) {
            window.scrollTo({
                top: scrollInfo.targetPosition,
                behavior: 'smooth'
            });
        }

    }, [finalHeightInfo, animationPhase, updatePoemState, index, expandablePreview.isExpandable, poem.lines]);

    const collapsePoem = useCallback(async (skipScroll = false) => {
        if (animationPhase !== 'complete' && animationPhase !== 'revealing') {
            return;
        }

        // Determine if this is a small poem for different collapse behavior
        const isSmallPoemValue = isSmallPoem(poem);

        if (isSmallPoemValue) {
            // Small poems: Quick fade out and collapse
            updatePoemState({phase: 'collapsing'});
            await new Promise(resolve => setTimeout(resolve, 150));
            updatePoemState({phase: 'idle', expanded: false});
        } else {
            // Large poems: Slower, more graceful collapse
            updatePoemState({phase: 'collapsing'});
            await new Promise(resolve => setTimeout(resolve, 300));
            updatePoemState({phase: 'idle', expanded: false});
        }

        // Trigger collapse event for arrow positioning
        let skipDefaultScroll = false;
        if (onCollapseEvent) {
            // Als onCollapseEvent true returnt, skip default search scroll
            skipDefaultScroll = onCollapseEvent() === true;
        }

        // Optional scroll after collapse (alleen als niet overridden door custom handler)
        if (!skipScroll && !skipDefaultScroll) {
            const targetSelector = allPoems && allPoems.length > 1
                ? `.${styles.globalToggleContainer}`
                : `.${styles.resultsOverview}`;

            const scrollInfo = calculateCollapseScroll(targetSelector, 100);
            if (scrollInfo.shouldScroll) {
                window.scrollTo({
                    top: scrollInfo.targetPosition,
                    behavior: 'smooth'
                });
            }
        }

    }, [animationPhase, updatePoemState, allPoems, styles, onCollapseEvent, poem]);

    // Individual toggle function
    const handleIndividualToggle = useCallback(async () => {
        if (isExpanded || animationPhase === 'complete' || animationPhase === 'revealing') {
            await collapsePoem();
        } else if (animationPhase === 'idle') {
            await expandPoem();
        }
    }, [isExpanded, animationPhase, expandPoem, collapsePoem]);

    // Effect voor externe state changes (zoals global triggers)
    useEffect(() => {
        if (!poemState?.globalTrigger) return;

        const trigger = poemState.globalTrigger;

        // Voor expand: alleen idle state
        const canExpand = animationPhase === 'idle' && !isExpanded;
        // Voor collapse: idle OF complete state
        const canCollapse = (animationPhase === 'idle' || animationPhase === 'complete') && isExpanded;

        if (trigger.action === 'expand' && canExpand) {
            expandPoem();
            updatePoemState({globalTrigger: null});
        } else if (trigger.action === 'collapse' && canCollapse) {
            // Voor global collapse: skip individual scroll, we doen één keer global scroll
            collapsePoem(true); // skipScroll = true
            updatePoemState({globalTrigger: null});
        } else {
            // Clear trigger anyway om infinite loops te voorkomen
            updatePoemState({globalTrigger: null});
        }
    }, [poemState?.globalTrigger, animationPhase, isExpanded, expandPoem, collapsePoem, updatePoemState]);

    // Navigation effect - reset naar juiste state bij carousel navigatie
    useEffect(() => {
        // Bij carousel navigatie: alleen phase aanpassen als het gedicht echt expanded is EN in een actieve animatie fase zat
        const navigationDirection = poemState?.navigationDirection;
        if (navigationDirection && navigationDirection !== 'initial' && isExpanded &&
            (animationPhase === 'revealing' || animationPhase === 'expanding')) {
            updatePoemState({phase: 'complete'});
        }
    }, [poemState?.navigationDirection, isExpanded, animationPhase, updatePoemState]);

    return {
        animationPhase,
        isExpanded,
        cardRef,
        expandPoem,
        collapsePoem,
        handleIndividualToggle,
        updatePoemState
    };
};

export default useExpandablePoem;