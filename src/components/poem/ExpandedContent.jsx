/**
 * ExpandedContent Component
 * Displays the expanded poem content with staggered animations
 * Extracted from PoemResultItem for modularity
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.hiddenLines - The lines of the poem to display in expanded view.
 * @param {number[]} props.staggeredDelays - Animation delays for each line.
 * @param {boolean} [props.canvasMode] - Whether the component is in canvas mode.
 * @param {string} props.animationPhase - Animation phase (e.g., 'collapsing', 'expanding').
 * @param {boolean} [props.isSmallPoem=false] - Whether the poem is considered small (affects animation style).
 * @param {string} [props.displayMode='search'] - Display mode for the component.
 * @param {Function} [props.onLoadInCanvas] - Handler for loading in canvas.
 * @param {Function} props.onNavigateToCanvas - Handler for navigating to canvas.
 * @param {Function} [props.onNavigateToRecording] - Handler for navigating to recording.
 * @param {Function} props.onToggle - Handler for toggling the expanded state.
 * @param {Object} props.styles - CSS module or style object for class names.
 */

import {memo} from 'react';
import {motion} from 'framer-motion';
import {PoemActionButtons} from './PoemActionButtons.jsx';
import {expandedContentVariants, poemLineVariants} from '@/utils/animationVariants.js';

export const ExpandedContent = memo(({
                                         hiddenLines,
                                         staggeredDelays,
                                         canvasMode = false,
                                         animationPhase,
                                         isSmallPoem = false,
                                         displayMode = 'search',
                                         onLoadInCanvas,
                                         onNavigateToCanvas,
                                         onNavigateToRecording,
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
                onNavigateToRecording={onNavigateToRecording}
                onToggle={onToggle}
                styles={styles}
            />
        </motion.div>
    );
});

