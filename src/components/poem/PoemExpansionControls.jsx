/**
 * PoemExpansionControls Component
 * Shows ellipsis and expand/collapse button
 * Extracted from PoemResultItem for clarity
 */

import {motion, AnimatePresence} from 'framer-motion';
import PropTypes from 'prop-types';
import PoemActionButtons from './PoemActionButtons.jsx';
import {ellipsisVariants} from '@/utils/animationVariants.js';

const PoemExpansionControls = ({
                                   isExpanded,
                                   animationPhase,
                                   canvasMode,
                                   canExpand,
                                   displayMode = 'search',
                                   onLoadInCanvas,
                                   onNavigateToCanvas,
                                   onToggle,
                                   styles
                               }) => {
    if (!canExpand) return null;

    // TODO goed begrijpen hoe deze expansion controls werken en hoe ze zich verhouden tot de rest van de UI
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
                        onToggle={onToggle}
                        styles={styles}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

PoemExpansionControls.displayName = 'PoemExpansionControls';

PoemExpansionControls.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    animationPhase: PropTypes.string.isRequired,
    canvasMode: PropTypes.bool,
    canExpand: PropTypes.bool.isRequired,
    displayMode: PropTypes.string,
    onLoadInCanvas: PropTypes.func,
    onNavigateToCanvas: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired
};

export default PoemExpansionControls;
