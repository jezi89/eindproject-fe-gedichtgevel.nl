/**
 * PoemResultItem Component (Refactored)
 * Individual poem display with expand/collapse functionality
 * Refactored to use smaller components and custom hooks
 */

import {useState, useMemo, useRef, useEffect, memo} from 'react';
import {motion} from 'framer-motion';
import styles from '../search/SearchResults.module.scss';

// Custom hooks
import useExpandablePoem from '@/hooks/useExpandablePoem.js';
import useHeightCalculation from '@/hooks/poem/useHeightCalculation.js';
// import useCanvasMode from '@/hooks/poem/useCanvasMode.js';

// Sub-components
import {PoemCard, PoemHeader, PoemExpansionControls, ExpandedContent, CanvasToast, PoemActionButtons} from '@/components/poem';

// Utilities
import {getPoemDisplayProps} from '@/utils/poem/textFormatting.js';
import {createExpandablePreview, calculateHiddenContent} from '@/utils/shortPoemUtils.js';
import {calculateStaggeredDelays, calculateMinimumExpandedHeight, isSmallPoem} from '@/utils/poemHeightCalculator.js';
import {nonExpandableVariants} from '@/utils/animationVariants.js';

const PoemResultItem = memo(
    ({
         poem,
         index,
         allPoems,
         navigationDirection,
         poemState,
         onPoemStateChange,
         preCalculatedHeight,
         canvasMode = false,
         displayMode = "search", // 'search' or 'monthly'
         onPoemSelect,
         onLoadInCanvas,
         onNavigateToCanvas,
         onNavigateToRecording,
         onCollapseEvent,
     }) => {
        // Calling hooks before any other logic
        const contentContainerRef = useRef(null);
        const [, setSynchronizedHeight] = useState(null);

        // Create expandable preview - with fallback for invalid poems
        const expandablePreview = useMemo(() => {
            if (!poem || !poem.lines) {
                return {isExpandable: false, previewLines: [], hiddenContent: []};
            }
            return createExpandablePreview(poem);
        }, [poem]);

        // Use height calculation hook
        const {screenLayout, finalHeightInfo, isLoadingHeight} =
            useHeightCalculation(
                poem,
                index,
                allPoems,
                navigationDirection,
                expandablePreview,
                preCalculatedHeight
            );
        /*
        // Use canvas mode hook
        const {
            navigateToCanvas,
            handleLoadInCanvas,
            handleDoubleClick,
            handleCardClick,
            showToast,
            handleMouseEnter,
            handleMouseLeave
        } = useCanvasMode(poem, canvasMode, onPoemSelect, onLoadInCanvas);*/

        // Determine if poem can expand
        const canExpand = useMemo(() => {
            // In canvas mode, never allow expansion
            if (canvasMode) return false;
            // Only poems > 4 lines can expand
            return expandablePreview.isExpandable;
        }, [expandablePreview.isExpandable, canvasMode]);

        // Use expandable poem hook
        const {animationPhase, isExpanded, cardRef, handleIndividualToggle} =
            useExpandablePoem(
                poem,
                index,
                poemState,
                onPoemStateChange,
                finalHeightInfo,
                expandablePreview,
                allPoems,
                styles,
                onCollapseEvent
            );

        // Calculate hidden content for preview indicator
        const hiddenContentInfo = useMemo(() => {
            if (!poem || !expandablePreview) {
                return {};
            }
            return calculateHiddenContent(poem, expandablePreview);
        }, [poem, expandablePreview]);

        // Calculate minimum height using utility function
        const minExpandedHeight = useMemo(() => {
            return calculateMinimumExpandedHeight(poem, window.innerWidth);
        }, [poem]);

        // Determine if this is a small poem using utility function
        const isSmallPoemValue = useMemo(() => {
            return isSmallPoem(poem);
        }, [poem]);

        // Synchronize height before animation
        useEffect(() => {
            if (finalHeightInfo?.canExpand && finalHeightInfo.totalHeight) {
                setSynchronizedHeight(finalHeightInfo.totalHeight);
            }
        }, [finalHeightInfo]);

        // Staggered delays for text reveal
        const staggeredDelays = useMemo(() => {
            if (!finalHeightInfo || !expandablePreview.hiddenContent.length) return [];
            return calculateStaggeredDelays(expandablePreview.hiddenContent.length, 200, 60);
        }, [finalHeightInfo, expandablePreview.hiddenContent]);

        // Get poem display properties - always returns an object
        const poemDisplayProps = useMemo(() => {
            return getPoemDisplayProps(poem);
        }, [poem]);

        // NOW WE CAN DO VALIDATION AFTER ALL HOOKS
        if (!poemDisplayProps.isValid) {
            return null;
        }

        return (
            <PoemCard
                ref={cardRef}
                isExpanded={isExpanded}
                canvasMode={canvasMode}
                // onClick={handleCardClick}
                // onDoubleClick={canvasMode ? handleDoubleClick : undefined}
                // onMouseEnter={handleMouseEnter}
                // onMouseLeave={handleMouseLeave}
                styles={styles}
                // Monthly sizing via CSS in plaats van displayMode prop
            >
                <PoemHeader
                    title={poemDisplayProps.title}
                    author={poemDisplayProps.author}
                    styles={styles}
                />

                <div className={styles.poemContent}>
                    {/* Stable preview section */}
                    <PoemPreview
                        previewLines={expandablePreview.previewLines}
                        hiddenContentInfo={hiddenContentInfo}
                        isExpandable={expandablePreview.isExpandable}
                        isExpanded={isExpanded}
                        styles={styles}
                    />

                    {/* Expansion controls */}
                    <PoemExpansionControls
                        isExpanded={isExpanded}
                        animationPhase={animationPhase}
                        canvasMode={canvasMode}
                        canExpand={canExpand}
                        displayMode={displayMode}
                        onLoadInCanvas={onLoadInCanvas}
                        onNavigateToCanvas={() => onNavigateToCanvas?.(poem)}
                        onNavigateToRecording={() => onNavigateToRecording?.(poem)}
                        onToggle={handleIndividualToggle}
                        styles={styles}
                    />

                    {/* Expansion container */}
                    {canExpand && (
                        <motion.div
                            ref={contentContainerRef}
                            className={styles.expansionPlaceholder}
                            initial={{height: 0}}
                            animate={{
                                height: isExpanded ?
                                    Math.max(
                                        finalHeightInfo?.totalHeight || minExpandedHeight,
                                        minExpandedHeight
                                    ) : 0
                            }}
                            transition={{
                                type: "spring",
                                // Expand: zachte spring met overshoot
                                // Collapse: snellere spring, minder bounce
                                stiffness: animationPhase === 'expanding'
                                    ? (isSmallPoemValue ? 280 : 220)  // Lagere stiffness voor smooth expand
                                    : (isSmallPoemValue ? 450 : 400), // Hogere stiffness voor snelle collapse
                                damping: animationPhase === 'expanding'
                                    ? (isSmallPoemValue ? 18 : 15)    // Lagere damping voor bounce bij expand
                                    : (isSmallPoemValue ? 30 : 28),   // Hogere damping voor quick collapse
                                mass: animationPhase === 'expanding' ? 0.9 : 0.6,
                                // Extra velocity voor natuurlijker gevoel
                                velocity: animationPhase === 'expanding' ? 0 : -50
                            }}
                            onAnimationStart={() => {
                                console.log('Expansion animation started:', {
                                    isExpanded,
                                    animationPhase,
                                    targetHeight: finalHeightInfo?.totalHeight,
                                    isSmallPoem: isSmallPoemValue
                                });
                            }}
                            onAnimationComplete={() => {
                                console.log('Expansion animation completed:', {isExpanded, animationPhase});
                            }}
                            style={{
                                overflow: animationPhase === 'expanding' ? 'hidden' : 'visible',
                                backgroundColor: 'transparent',
                                transformOrigin: 'top center',
                                flex: 1,
                                willChange: 'height' // GPU acceleration hint
                            }}
                        >
                            {(animationPhase === 'revealing' || animationPhase === 'complete') && (
                                <ExpandedContent
                                    hiddenLines={expandablePreview.hiddenContent}
                                    staggeredDelays={staggeredDelays}
                                    canvasMode={canvasMode}
                                    animationPhase={animationPhase}
                                    isSmallPoem={isSmallPoemValue}
                                    displayMode={displayMode}
                                    onLoadInCanvas={onLoadInCanvas}
                                    onNavigateToCanvas={() => onNavigateToCanvas?.(poem)}
                                    onNavigateToRecording={() => onNavigateToRecording?.(poem)}
                                    onToggle={handleIndividualToggle}
                                    styles={styles}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Non-expandable poems action button */}
                    {!canExpand && (
                        <motion.div
                            className={styles.nonExpandableActions}
                            {...nonExpandableVariants}
                        >
                            <PoemActionButtons
                                canvasMode={canvasMode}
                                isExpanded={false}
                                canExpand={false}
                                animationPhase={animationPhase}
                                displayMode={displayMode}
                                onLoadInCanvas={onLoadInCanvas}
                                onNavigateToCanvas={() => onNavigateToCanvas?.(poem)}
                                onNavigateToRecording={() => onNavigateToRecording?.(poem)}
                                onToggle={handleIndividualToggle}
                                styles={styles}
                                className={styles.nonExpandableActions}
                            />
                        </motion.div>
                    )}
                </div>

                {/* Canvas mode toast */}
                {/* {canvasMode && (
                <CanvasToast show={showToast} styles={styles}/>
            )}*/}
            </PoemCard>
        );
    });

PoemResultItem.displayName = 'PoemResultItem';

export default PoemResultItem;
