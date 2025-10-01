/**
 * SearchResultItem Component
 * Individual poem display with expand/collapse functionality
 * Extracted from SearchResults for better separation of concerns
 */

import {useState, useMemo, memo, useRef, useEffect, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useNavigate} from 'react-router';
import searchContextService from '@/services/context/SearchContextService.js';
import styles from './searchResults.module.scss';

// Modular components and hooks
import useExpandablePoem from '@/hooks/useExpandablePoem';
import useTooltipHint from '@/hooks/useTooltipHint';
import PoemActionButtons from './PoemActionButtons';
import PoemPreview from './PoemPreview';
import {
    poemLineVariants,
    ellipsisVariants,
    expandedContentVariants,
    toastVariants,
    nonExpandableVariants
} from '@/utils/animationVariants';

import {
    calculateExpandedHeight,
    calculateStaggeredDelays,
    getResponsiveLayout,
    createResizeHandler,
    getCarouselPoemHeight,
    clearCarouselCache
} from '@/utils/poemHeightCalculator';
import {
    createExpandablePreview,
    calculateHiddenContent
} from '@/utils/shortPoemUtils';

const SearchResultItem = memo(({
                                   poem,
                                   index,
                                   allPoems,
                                   navigationDirection,
                                   poemState,
                                   onPoemStateChange,
                                   preCalculatedHeight,
                                   canvasMode = false,
                                   onPoemSelect,
                                   onLoadInCanvas,
                                   onCollapseEvent
                               }) => {
    // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
    const navigate = useNavigate();

    // Toast functionality using custom hook
    const {showToast, handleMouseEnter, handleMouseLeave} = useTooltipHint(canvasMode);

    // Memoize screen layout voor minder re-renders
    const [screenLayout, setScreenLayout] = useState(() => getResponsiveLayout());
    const contentContainerRef = useRef(null);

    // Synchronized height state - prevents race conditions
    const [, setSynchronizedHeight] = useState(null);

    // Responsive layout updates
    useEffect(() => {
        const handleResize = createResizeHandler(() => {
            setScreenLayout(getResponsiveLayout());
            clearCarouselCache(); // Clear cache bij resize
        });

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Height calculation only for expandable poems (> 4 lines)
    const heightCalculations = useMemo(() => {
        if (!poem || !poem.lines || poem.lines.length <= 4) return null;

        const cardWidth = screenLayout.cardWidth || 570;

        // Voor single resultaat: directe berekening
        if (!allPoems || allPoems.length <= 1) {
            return calculateExpandedHeight(poem, window.innerWidth, cardWidth, true);
        }

        // Voor carousel (2+ gedichten): gebruik cache strategie
        return null; // Zal asynchroon worden opgehaald
    }, [poem, screenLayout, allPoems]);

    // Async height loading voor carousel
    const [carouselHeightInfo, setCarouselHeightInfo] = useState(null);

    useEffect(() => {
        // Only load heights for expandable poems (> 4 lines) in carousel mode
        if (!poem || !poem.lines || poem.lines.length <= 4) return;
        if (!allPoems || allPoems.length <= 1) return; // Single result handled by heightCalculations

        const loadCarouselHeight = async () => {
            try {
                const heightInfo = await getCarouselPoemHeight(
                    poem,
                    index,
                    allPoems,
                    navigationDirection || 'initial',
                    window.innerWidth,
                    screenLayout.cardWidth || 570
                );
                setCarouselHeightInfo(heightInfo);
            } catch {
                // Error loading carousel height - fallback used
                // Fallback to direct calculation
                const fallback = calculateExpandedHeight(poem, window.innerWidth, screenLayout.cardWidth || 570, false);
                setCarouselHeightInfo(fallback);
            }
        };

        loadCarouselHeight();
    }, [poem, index, allPoems, navigationDirection, screenLayout]);

    // NIEUWE EXPANDABLE PREVIEW LOGICA - Zorgt dat alle gedichten expandable zijn
    const expandablePreview = useMemo(() => {
        if (!poem) return {isExpandable: false, previewLines: [], hiddenContent: []};
        return createExpandablePreview(poem);
    }, [poem]);

    const previewLines = useMemo(() => {
        return expandablePreview.previewLines;
    }, [expandablePreview.previewLines]);

    const hiddenLines = useMemo(() => {
        return expandablePreview.hiddenContent;
    }, [expandablePreview.hiddenContent]);

    const canExpand = useMemo(() => {
        // In canvas mode, never allow expansion (always collapsed)
        if (canvasMode) return false;

        // Simple logic: only poems > 4 lines can expand
        return expandablePreview.isExpandable;
    }, [expandablePreview.isExpandable, canvasMode]);

    // Height calculation - only for expandable poems (> 4 lines)
    const finalHeightInfo = useMemo(() => {
        if (!expandablePreview.isExpandable) {
            return null;
        }

        const heightInfo = preCalculatedHeight || carouselHeightInfo || heightCalculations;
        return heightInfo ? {...heightInfo, canExpand: true} : null;
    }, [preCalculatedHeight, carouselHeightInfo, heightCalculations, expandablePreview.isExpandable]);

    // Use expandable poem hook for expand/collapse logic
    const {
        animationPhase,
        isExpanded,
        expandControls,
        cardRef,
        handleIndividualToggle
    } = useExpandablePoem(
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

    // Bereken hidden content voor preview indicator
    const hiddenContentInfo = useMemo(() => {
        if (!poem) return {};
        return calculateHiddenContent(poem, expandablePreview);
    }, [poem, expandablePreview]);

    // Synchronize height before any animation starts
    useEffect(() => {
        if (finalHeightInfo?.canExpand && finalHeightInfo.totalHeight) {
            setSynchronizedHeight(finalHeightInfo.totalHeight);
        }
    }, [finalHeightInfo]);

    // Staggered delays for text reveal - now works for all expandable content
    const staggeredDelays = useMemo(() => {
        if (!finalHeightInfo || !hiddenLines.length) return [];
        return calculateStaggeredDelays(hiddenLines.length, 200, 60);
    }, [finalHeightInfo, hiddenLines.length]);

    // Helper functie voor tooltip bij lange content
    const getTitleWithTooltip = useCallback((text, maxLength = 50) => {
        if (text && text.length > maxLength) {
            return {
                display: text.substring(0, maxLength) + '...',
                title: text
            };
        }
        return {display: text};
    }, []);

    // Helper to navigate to canvas with complete poem data
    const navigateToCanvas = useCallback(async () => {
        if (!poem) return;
        try {
            // Save complete poem data to context for retrieval on design page
            await searchContextService.saveSelectedPoem(poem);

            // Navigating to design page

            // Use short URL with only essential data
            navigate(`/design?title=${encodeURIComponent(poem.title)}&author=${encodeURIComponent(poem.author)}`);
        } catch {
            // Failed to save poem to context - using fallback
            // Fallback: navigate anyway with basic params
            navigate(`/design?title=${encodeURIComponent(poem.title)}&author=${encodeURIComponent(poem.author)}`);
        }
    }, [poem, navigate]);

    // Handler to load poem in canvas preview (only for canvas mode)
    const handleLoadInCanvas = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click from triggering navigation

        if (canvasMode && onLoadInCanvas && poem) {
            // Loading poem in canvas preview
            onLoadInCanvas(poem);
        }
    }, [poem, canvasMode, onLoadInCanvas]);

    // Handler for double-click to open in full canvas (canvas mode only)
    const handleDoubleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (canvasMode && onPoemSelect && poem) {
            // Double-click: Opening poem in full canvas
            onPoemSelect(poem);
        }
    }, [poem, canvasMode, onPoemSelect]);

    // Handle canvas mode click
    const handleCardClick = useCallback(() => {
        if (canvasMode && onPoemSelect && poem) {
            onPoemSelect(poem);
        }
    }, [canvasMode, onPoemSelect, poem]);

    // VALIDATION AFTER ALL HOOKS
    // CRITICAL: Validate poem exists to prevent "Cannot read properties of undefined" errors
    if (!poem || typeof poem !== 'object') {
        // Invalid poem object
        return null;
    }

    // Additional validation for required poem properties
    if (!poem.title || !poem.author) {
        // Missing required poem properties
        return null;
    }

    const titleProps = getTitleWithTooltip(poem.title, 60);
    const authorProps = getTitleWithTooltip(poem.author, 30);

    return (
        <motion.div
            ref={cardRef}
            className={`${styles.resultCard} ${canvasMode ? styles.canvasCard : ''}`}
            data-expanded={isExpanded}
            layout // Enable layout animations for smooth card resizing
            initial={false}
            onClick={handleCardClick}
            onDoubleClick={canvasMode ? handleDoubleClick : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                cursor: canvasMode ? 'pointer' : 'default',
                position: 'relative',
                transformOrigin: 'top' // Ensure expansion happens downward
            }}
            transition={{
                layout: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94] // Smooth bezier curve
                }
            }}
        >
            <div
                className={styles.cardHeader}
            >
                <h3
                    className={styles.poemTitle}
                    title={titleProps.title}
                >
                    {titleProps.display || poem.title}
                </h3>
                <p
                    className={styles.poemAuthor}
                    title={authorProps.title}
                >
                    By {authorProps.display || poem.author}
                </p>
            </div>

            <div
                className={styles.poemContent}
            >
                {/* STABLE PREVIEW SECTION - Never moves, always visible */}
                <PoemPreview
                    previewLines={previewLines}
                    hiddenContentInfo={hiddenContentInfo}
                    isExpandable={expandablePreview.isExpandable}
                    isExpanded={isExpanded}
                    styles={styles}
                />

                {/* ELLIPSIS AND EXPAND BUTTON - Now works for ALL expandable poems */}
                {canExpand && (
                    <AnimatePresence mode="wait">
                        {!isExpanded && animationPhase === 'idle' && (
                            <motion.div
                                key="ellipsis-and-button"
                                {...ellipsisVariants}
                            >
                                <div className={styles.ellipsisSection}>
                                    <p className={styles.previewEllipsis}>...</p>
                                </div>

                                <PoemActionButtons
                                    canvasMode={canvasMode}
                                    isExpanded={false}
                                    canExpand={canExpand}
                                    animationPhase={animationPhase}
                                    onLoadInCanvas={handleLoadInCanvas}
                                    onNavigateToCanvas={navigateToCanvas}
                                    onToggle={handleIndividualToggle}
                                    styles={styles}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* EXPANSION PLACEHOLDER - Empty container that expands first, then shows content */}
                {canExpand && (
                    <motion.div
                        ref={contentContainerRef}
                        className={styles.expansionPlaceholder}
                        layout // Enable layout animations for smooth expansion
                        initial={{height: 0}}
                        animate={expandControls}
                        style={{
                            overflow: 'visible !important', // Critical override
                            backgroundColor: 'transparent',
                            transformOrigin: 'top', // Force expansion downward only
                            flex: 1 // Ensure proper flex behavior
                        }}
                        transition={{
                            layout: {
                                duration: 0.6,
                                ease: [0.25, 0.46, 0.45, 0.94] // Smooth bezier curve
                            }
                        }}
                    >
                        {/* CONTENT ONLY SHOWS DURING REVEAL PHASE - Prevents trampoline effect */}
                        <AnimatePresence>
                            {(animationPhase === 'revealing' || animationPhase === 'complete') ? (
                                <motion.div
                                    key="expanded-content"
                                    className={styles.expandedContent}
                                    {...expandedContentVariants}
                                >
                                    {/* CINEMATOGRAPHIC STAGGERED HIDDEN CONTENT */}
                                    {hiddenLines.map((line, i) => (
                                        <motion.p
                                            key={`hidden-${i}`}
                                            className={styles.poemLine}
                                            initial={poemLineVariants.hidden.initial}
                                            animate={poemLineVariants.hidden.animate}
                                            transition={poemLineVariants.hidden.transition(
                                                staggeredDelays[i] ? staggeredDelays[i] : 200 + (i * 60)
                                            )}
                                        >
                                            {line || '\u00A0'}
                                        </motion.p>
                                    ))}

                                    <PoemActionButtons
                                        canvasMode={canvasMode}
                                        isExpanded={true}
                                        canExpand={canExpand}
                                        animationPhase={animationPhase}
                                        hiddenLinesLength={hiddenLines.length}
                                        onLoadInCanvas={handleLoadInCanvas}
                                        onNavigateToCanvas={navigateToCanvas}
                                        onToggle={handleIndividualToggle}
                                        styles={styles}
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* CANVAS BUTTON FOR NON-EXPANDABLE POEMS */}
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
                            onLoadInCanvas={handleLoadInCanvas}
                            onNavigateToCanvas={navigateToCanvas}
                            onToggle={handleIndividualToggle}
                            styles={styles}
                            className={styles.nonExpandableActions}
                        />
                    </motion.div>
                )}

            </div>

            {/* TOAST HINT FOR CANVAS MODE - OUTSIDE content flow to avoid taking layout space */}
            {canvasMode && (
                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            className={styles.doubleClickToastInline}
                            {...toastVariants}
                            style={{
                                // Ensure proper centering - override any conflicts
                                left: '50%',
                                transform: 'translateX(-50%)'
                            }}
                        >
                            💡 Dubbelklik om te openen in volledige canvas
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    );
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;