/**
 * CanvasToast Component
 * Shows hint for canvas mode interaction
 * Extracted from PoemResultItem for better separation
 */

// TODO Checken of Canvas Toast nog goed werkt op deisgn page of dat refactor nodig is.

import {motion, AnimatePresence} from 'framer-motion';
import PropTypes from 'prop-types';
import {toastVariants} from '@/utils/animationVariants.js';

const CanvasToast = ({show, styles}) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={styles.doubleClickToastInline}
                    {...toastVariants}
                    style={{
                        // Ensure proper centering
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    💡 Dubbelklik om te openen in volledige canvas
                </motion.div>
            )}
        </AnimatePresence>
    );
};

CanvasToast.displayName = 'CanvasToast';

CanvasToast.propTypes = {
    show: PropTypes.bool.isRequired,
    styles: PropTypes.object.isRequired
};

export default CanvasToast;
