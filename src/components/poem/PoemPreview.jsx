/**
 * PoemPreview Component
 * Extracted text rendering logic from PoemResultItem
 * Handles poem line display with animations
 */

import {memo} from 'react';
import {motion} from 'framer-motion';
import {hiddenIndicatorVariants, poemLineVariants} from '@/utils/animationVariants';

export const PoemPreview = memo(({
                                     previewLines = [],
                                     hiddenContentInfo = {},
                                     isExpandable = false,
                                     isExpanded = false,
                                     styles
                                 }) => {

    return (
        <div className={styles.previewSection}>
            {previewLines.map((line, i) => (
                <motion.p
                    key={`preview-${i}`}
                    className={styles.poemLine}
                    initial={poemLineVariants.preview.initial}
                    animate={poemLineVariants.preview.animate}
                    transition={poemLineVariants.preview.transition(i)}
                >
                    {line || '\u00A0'}
                </motion.p>
            ))}

            {/* Hidden content indicator - only shown in collapsed preview state */}
            {isExpandable && hiddenContentInfo.displayText && !isExpanded && (
                <motion.div
                    className={styles.hiddenContentIndicator}
                    initial={hiddenIndicatorVariants.initial}
                    animate={hiddenIndicatorVariants.animate}
                    transition={hiddenIndicatorVariants.transition}
                >
                    {hiddenContentInfo.displayText}
                </motion.div>
            )}
        </div>
    );
});
