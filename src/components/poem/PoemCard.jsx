/**
 * PoemCard Component
 * Main wrapper component for poem display
 * Provides motion animations and layout structure with spring physics
 */

import {forwardRef, memo} from 'react';
import {motion} from 'framer-motion';
import PropTypes from 'prop-types';

const PoemCard = memo(forwardRef(({
                                      isExpanded,
                                      canvasMode,
                                      onClick,
                                      onDoubleClick,
                                      onMouseEnter,
                                      onMouseLeave,
                                      styles,
                                      children
                                  }, ref) => {
    // TODO debug logging animation states checken en weghalen
    // Debug logging voor animation states
    console.log('PoemCard render:', {isExpanded, canvasMode});

    return (
        <motion.div
            ref={ref}
            className={`${styles.resultCard} ${canvasMode ? styles.canvasCard : ''}`}
            data-expanded={isExpanded}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            layout={!canvasMode} // Layout animations alleen voor search mode
            // Geen scale transforms - deze veroorzaken altijd text rendering issues
            // Monthly sizing wordt gedaan via CSS container sizing
            transition={{
                type: "spring",
                stiffness: 350,
                damping: 20, // Lagere damping voor natural bounce
                mass: 0.6
            }}
            onAnimationStart={() => console.log('PoemCard animation started')}
            onAnimationComplete={() => console.log('PoemCard animation completed')}
            style={{
                cursor: canvasMode ? 'pointer' : 'default',
                position: 'relative',
                transformOrigin: 'top center', // Ensure expansion happens downward
                willChange: 'transform' // GPU acceleration hint
            }}
        >
            {children}
        </motion.div>
    );
}));

PoemCard.displayName = 'PoemCard';

PoemCard.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    canvasMode: PropTypes.bool,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    styles: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
};

export default PoemCard;
