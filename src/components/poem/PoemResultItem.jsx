/**
 * PoemResultItem Component (Refactored)
 * Individual poem display with expand/collapse functionality
 * Refactored to use smaller components and custom hooks
 */

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "../search/SearchResults.module.scss";
// Custom hooks
import { useExpandablePoem } from "@/hooks/useExpandablePoem.js";
import { useHeightCalculation } from "@/hooks/poem/useHeightCalculation.js";
import {
  AddressDisplay,
  ExpandedContent,
  PoemActionButtons,
  PoemCard,
  PoemExpansionControls,
  PoemHeader,
  PoemPreview,
} from "@/components/poem";

// Utilities
import { getPoemDisplayProps } from "@/utils/poem/textFormatting.js";
import {
  calculateHiddenContent,
  createExpandablePreview,
} from "@/utils/shortPoemUtils.js";
import {
  calculateMinimumExpandedHeight,
  calculateStaggeredDelays,
  isSmallPoem,
} from "@/utils/poemHeightCalculator.js";
import {
  nonExpandableVariants,
  SPRING_CONFIG,
} from "@/utils/animationVariants.js";

export const PoemResultItem = memo(
  ({
    poem,
    index,
    allPoems,
    navigationDirection,
    poemState,
    onPoemStateChange,
    preCalculatedHeight,
    canvasMode = false,
    displayMode = "search",
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
        return { isExpandable: false, previewLines: [], hiddenContent: [] };
      }
      return createExpandablePreview(poem);
    }, [poem]);

    // Use height calculation hook
    const { screenLayout, finalHeightInfo, isLoadingHeight } =
      useHeightCalculation(
        poem,
        index,
        allPoems,
        navigationDirection,
        expandablePreview,
        preCalculatedHeight
      );

    // Determine if poem can expand
    const canExpand = useMemo(() => {
      // In canvas mode, never allow expansion
      if (canvasMode) return false;
      // Only poems > 4 lines can expand
      return expandablePreview.isExpandable;
    }, [expandablePreview.isExpandable, canvasMode]);

    // Use expandable poem hook
    const { animationPhase, isExpanded, cardRef, handleIndividualToggle } =
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
      if (!finalHeightInfo || !expandablePreview.hiddenContent.length)
        return [];
      return calculateStaggeredDelays(
        expandablePreview.hiddenContent.length,
        200,
        60
      );
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
        styles={styles}
        // Monthly sizing via CSS in plaats van displayMode prop
      >
        <PoemHeader
          title={poemDisplayProps.title}
          author={poemDisplayProps.author}
          styles={styles}
        />

        <AddressDisplay
          address={poem.address}
          lat={poem.location_lat}
          lon={poem.location_lon}
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
              initial={{ height: 0 }}
              animate={{
                height: isExpanded
                  ? Math.max(
                      finalHeightInfo?.totalHeight || minExpandedHeight,
                      minExpandedHeight
                    )
                  : 0,
              }}
              transition={SPRING_CONFIG[isExpanded ? "expand" : "collapse"]}
              onAnimationStart={() => {
                console.log("Expansion animation started:", {
                  isExpanded,
                  animationPhase,
                  targetHeight: finalHeightInfo?.totalHeight,
                  isSmallPoem: isSmallPoemValue,
                });
              }}
              onAnimationComplete={() => {
                console.log("Expansion animation completed:", {
                  isExpanded,
                  animationPhase,
                });
              }}
              style={{
                overflow: "visible",
                backgroundColor: "transparent",
                transformOrigin: "top center",
                flex: 1,
                willChange: "height", // GPU acceleration hint
              }}
            >
              {(animationPhase === "revealing" ||
                animationPhase === "complete") && (
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
      </PoemCard>
    );
  }
);
