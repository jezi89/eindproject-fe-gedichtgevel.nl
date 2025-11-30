/**
 * PoemExpansionControls Component
 * Shows ellipsis and expand/collapse button
 * Extracted from PoemResultItem for clarity
 */

import {AnimatePresence, motion} from 'framer-motion';
import {PoemActionButtons} from './PoemActionButtons.jsx';
import {ellipsisVariants} from '@/utils/animationVariants.js';

/**
 * @param {Object} props
 * @param {boolean} props.isExpanded
 * @param {string} props.animationPhase
 * @param {boolean} [props.canvasMode]
 * @param {boolean} props.canExpand
 * @param {string} [props.displayMode]
 * @param {Function} [props.onLoadInCanvas]
 * @param {Function} props.onNavigateToCanvas
 * @param {Function} [props.onNavigateToRecording]
 * @param {Function} props.onToggle
 * @param {Object} props.styles
 */

export const PoemExpansionControls = ({
                                          isExpanded,
                                          animationPhase,
                                          canvasMode = false,
                                          canExpand,
                                          displayMode = 'search',
                                          onLoadInCanvas,
                                          onNavigateToCanvas,
                                          onNavigateToRecording,
                                          onToggle,
                                          styles,
                                          showLabels = true
                                      }) => {
    if (!canExpand) return null;

    return (
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
                        displayMode={displayMode}
                        onLoadInCanvas={onLoadInCanvas}
                        onNavigateToCanvas={onNavigateToCanvas}
                        onNavigateToRecording={onNavigateToRecording}
                        onToggle={onToggle}
                        styles={styles}
                        showLabels={showLabels}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};