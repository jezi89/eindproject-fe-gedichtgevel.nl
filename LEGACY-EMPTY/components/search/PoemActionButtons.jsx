/**
 * PoemActionButtons Component
 * Extracted button logic from SearchResultItem
 * Handles canvas and expand/collapse buttons
 */

import {memo} from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router';
import {buttonVariants} from '@/utils/animationVariants';
import searchContextService from '@/services/context/SearchContextService';

const PoemActionButtons = memo(({
                                    canvasMode = false,
                                    isExpanded = false,
                                    canExpand = false,
                                    animationPhase = 'idle',
                                    hiddenLinesLength = 0,
                                    onLoadInCanvas,
                                    onNavigateToCanvas,
                                    onNavigateToRecording,
                                    onToggle,
                                    styles,
                                    className = ''
                                }) => {

    // Animation delay for expanded state buttons
    const expandedButtonDelay = 0.4 + (hiddenLinesLength * 0.06);

    // Debug: Check if handlers exist
    console.log('🔍 PoemActionButtons props:', {
        hasNavigateToRecording: !!onNavigateToRecording,
        hasNavigateToCanvas: !!onNavigateToCanvas,
        canvasMode,
        canExpand
    });

    return (
        <motion.div
            className={`${styles.buttonContainer} ${className}`}
            initial={buttonVariants.container.initial}
            animate={buttonVariants.container.animate}
            exit={buttonVariants.container.exit}
            transition={{
                ...buttonVariants.container.transition,
                delay: isExpanded ? expandedButtonDelay : 0,
                duration: isExpanded ? 0.6 : 0.3,
                ease: isExpanded ? [0.25, 0.46, 0.45, 0.94] : undefined
            }}
        >
            {/* DECLAMEER BUTTON - Always visible when handler exists */}
            {onNavigateToRecording && (
                <motion.button
                    className={`${styles.expandButton} ${styles.recordingButton}`}
                    onClick={onNavigateToRecording}
                    aria-label="Open dit gedicht in Spreekgevel voor opname"
                    whileHover={buttonVariants.button.hover}
                    whileTap={buttonVariants.button.tap}
                >
                    <span className={styles.expandIcon}>🎤</span>
                    Declameer!
                </motion.button>
            )}

            {/* CANVAS BUTTON - Always visible, only 'Open in canvas' */}
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