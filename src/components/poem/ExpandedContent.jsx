/**
 * ExpandedContent Component
 * Displays the expanded poem content with staggered animations
 * Extracted from PoemResultItem for modularity
 */

import {memo} from 'react';
import {motion} from 'framer-motion';
import PropTypes from 'prop-types';
import PoemActionButtons from './PoemActionButtons.jsx';
import {poemLineVariants, expandedContentVariants} from '@/utils/animationVariants.js';

const ExpandedContent = memo(({
                                  hiddenLines,
                                  staggeredDelays,
                                  canvasMode,
                                  animationPhase,
                                  isSmallPoem = false,
                                  displayMode = 'search',
                                  onLoadInCanvas,
                                  onNavigateToCanvas,
                                  onToggle,
                                  styles
                              }) => {
    return (
        <motion.div
            key="expanded-content"
            className={styles.expandedContent}
            initial={isSmallPoem ? {opacity: 0} : expandedContentVariants.initial}
            animate={{
                opacity: animationPhase === 'collapsing' ? 0 : 1
            }}
            transition={{
                duration: isSmallPoem ?
                    (animationPhase === 'collapsing' ? 0.15 : 0.4) :
                    (animationPhase === 'collapsing' ? 0.3 : 0.5),
                ease: [0.4, 0.0, 0.2, 1],
                delay: isSmallPoem ? 0.1 : 0.2
            }}
        >
            {/* Content with appropriate animation style */}
            {isSmallPoem ? (
                // Small poems: Full fade instead of line-by-line
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{
                        opacity: animationPhase === 'collapsing' ? 0 : 1,
                        y: animationPhase === 'collapsing' ? 10 : 0
                    }}
                    transition={{
                        duration: animationPhase === 'collapsing' ? 0.2 : 0.6,
                        ease: [0.4, 0.0, 0.2, 1],
                        delay: animationPhase === 'collapsing' ? 0 : 0.15
                    }}
                >
                    {hiddenLines.map((line, i) => (
                        <p key={`hidden-${i}`} className={styles.poemLine}>
                            {line || '\u00A0'}
                        </p>
                    ))}
                </motion.div>
            ) : (
                // Larger poems: Cinematographic staggered reveal (slower timing)
                hiddenLines.map((line, i) => (
                    <motion.p
                        key={`hidden-${i}`}
                        className={styles.poemLine}
                        initial={poemLineVariants.hidden.initial}
                        animate={{
                            ...poemLineVariants.hidden.animate,
                            opacity: animationPhase === 'collapsing' ? 0 : 1
                        }}
                        transition={{
                            ...poemLineVariants.hidden.transition(
                                staggeredDelays[i] || (300 + (i * 80)) // Slower, more graceful timing
                            ),
                            duration: animationPhase === 'collapsing' ? 0.15 : 1.0 // Slower reveal
                        }}
                    >
                        {line || '\u00A0'}
                    </motion.p>
                ))
            )}

            {/* Visual separator - elegant end marker */}
            <motion.div
                className={styles.poemSeparator}
                initial={{opacity: 0, y: 10}}
                animate={{
                    opacity: animationPhase === 'collapsing' ? 0 : 1,
                    y: animationPhase === 'collapsing' ? 10 : 0
                }}
                transition={{
                    duration: isSmallPoem ? 0.3 : 0.4,
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: isSmallPoem ? 0.2 : 0.3
                }}
            >
                <span className={styles.separatorDingbat}>❚</span>
                <span className={styles.separatorDingbat}>❚</span>
                <span className={styles.separatorDingbat}>❚</span>
            </motion.div>

            <PoemActionButtons
                canvasMode={canvasMode}
                isExpanded={true}
                canExpand={true}
                animationPhase={animationPhase}
                hiddenLinesLength={hiddenLines.length}
                displayMode={displayMode}
                onLoadInCanvas={onLoadInCanvas}
                onNavigateToCanvas={onNavigateToCanvas}
                onToggle={onToggle}
                styles={styles}
            />
        </motion.div>
    );
});

ExpandedContent.displayName = 'ExpandedContent';

ExpandedContent.propTypes = {
    hiddenLines: PropTypes.arrayOf(PropTypes.string).isRequired,
    staggeredDelays: PropTypes.arrayOf(PropTypes.number).isRequired,
    canvasMode: PropTypes.bool,
    animationPhase: PropTypes.string.isRequired,
    isSmallPoem: PropTypes.bool,
    displayMode: PropTypes.string,
    onLoadInCanvas: PropTypes.func,
    onNavigateToCanvas: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    styles: PropTypes.object.isRequired
};

export default ExpandedContent;
