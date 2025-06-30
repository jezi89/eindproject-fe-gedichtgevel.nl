/**
 * PoemActionButtons Component
 * Extracted button logic from PoemResultItem
 * Handles canvas and expand/collapse buttons
 */

import {memo} from 'react';
import {motion} from 'framer-motion';
import {buttonVariants} from '@/utils/animationVariants.js';

const PoemActionButtons = memo(({
                                    canvasMode = false,
                                    isExpanded = false,
                                    canExpand = false,
                                    animationPhase = 'idle',
                                    hiddenLinesLength = 0,
                                    displayMode = 'search', // 'search' or 'monthly'
                                    onLoadInCanvas,
                                    onNavigateToCanvas,
                                    onToggle,
                                    styles,
                                    className = ''
                                }) => {

    // Animation delay for expanded state buttons
    const expandedButtonDelay = 0.4 + (hiddenLinesLength * 0.06);

    // For monthly display mode, only show canvas and expand/collapse buttons
    const showCanvasButton = displayMode === 'search' || displayMode === 'monthly';

    return (
        <motion.div
            className={`${styles.buttonContainer} ${className}`}
            initial={buttonVariants.container.initial}
            animate={buttonVariants.container.animate}
            exit={buttonVariants.container.exit}
            transition={{
                ...buttonVariants.container.transition,
                // Add delay for expanded state
                delay: isExpanded ? expandedButtonDelay : 0,
                duration: isExpanded ? 0.6 : 0.3,
                ease: isExpanded ? [0.25, 0.46, 0.45, 0.94] : undefined
            }}
        >
            {/* CANVAS BUTTONS - Show for search and monthly modes */}
            {/*// TODO Checken of it goed gaat en we de canvas button bij monthly  ook te zien krijgen*/}

            {showCanvasButton && (
                <>
                    {canvasMode ? (
                        <motion.button
                            className={`${styles.expandButton} ${styles.loadCanvasButton}`}
                            onClick={onLoadInCanvas}
                            aria-label="Laad dit gedicht in de canvas preview"
                            whileHover={buttonVariants.button.hover}
                            whileTap={buttonVariants.button.tap}
                        >
                            <span className={styles.expandIcon}>📋</span>
                            Laad in canvas
                        </motion.button>
                    ) : (
                        <motion.button
                            className={`${styles.expandButton} ${styles.canvasButton}`}
                            onClick={onNavigateToCanvas}
                            aria-label="Open dit gedicht in de canvas editor"
                            whileHover={buttonVariants.button.hover}
                            whileTap={buttonVariants.button.tap}
                        >
                            <span className={styles.expandIcon}>🎨</span>
                            Open in canvas
                        </motion.button>
                    )}
                </>
            )}

            {/* EXPAND/COLLAPSE BUTTON - Only shown for expandable poems */}
            {canExpand && (
                <motion.button
                    className={`${styles.expandButton} ${isExpanded ? styles.collapseButton : ''}`}
                    onClick={onToggle}
                    disabled={animationPhase !== 'idle' && animationPhase !== 'complete' && animationPhase !== 'revealing'}
                    aria-expanded={isExpanded}
                    whileHover={buttonVariants.button.hover}
                    whileTap={buttonVariants.button.tap}
                >
                    <span className={styles.expandIcon}>
                        {isExpanded ? '▲' : '▼'}
                    </span>
                    {isExpanded ? (
                        'Verberg volledig gedicht'
                    ) : (
                        animationPhase === 'expanding' ? 'Uitklappen...' :
                            animationPhase === 'scrolling' ? 'Plaatsen...' :
                                'Toon volledig gedicht'
                    )}
                </motion.button>
            )}
        </motion.div>
    );
});

PoemActionButtons.displayName = 'PoemActionButtons';

export default PoemActionButtons;