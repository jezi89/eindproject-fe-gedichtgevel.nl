/**
 * PoemCard Component
 * Main wrapper component for poem display
 * Provides motion animations and layout structure with spring physics
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isExpanded - Whether the card is expanded.
 * @param {boolean} [props.canvasMode] - Whether the card is in canvas mode.
 * @param {Function} [props.onClick] - Click handler for the card.
 * @param {Function} [props.onDoubleClick] - Double click handler for the card.
 * @param {Function} [props.onMouseEnter] - Mouse enter handler for the card.
 * @param {Function} [props.onMouseLeave] - Mouse leave handler for the card.
 * @param {Object} props.styles - CSS module or style object for class names.
 * @param {React.ReactNode} props.children - Child nodes to render inside the card.
 * @param {React.Ref} ref - Ref forwarded to the root element.
 */

import {forwardRef, memo} from 'react';
import {motion} from 'framer-motion';

export const PoemCard = memo(forwardRef(({
                                             isExpanded,
                                             canvasMode = false,
                                             onClick,
                                             onDoubleClick,
                                             onMouseEnter,
                                             onMouseLeave,
                                             styles,
                                             children
                                         }, ref) => {
                                           // Debug logging for animation states

                                           return (
                                             <motion.div
                                               ref={ref}
                                               className={`${
                                                 styles.resultCard
                                               } ${
                                                 canvasMode
                                                   ? styles.canvasCard
                                                   : ""
                                               }`}
                                               data-expanded={isExpanded}
                                               onClick={onClick}
                                               onDoubleClick={onDoubleClick}
                                               onMouseEnter={onMouseEnter}
                                               onMouseLeave={onMouseLeave}
                                               layout={!canvasMode} // Layout animations only for search mode
                                               // No scale transforms - these always cause text rendering issues
                                               // Monthly sizing is done via CSS container sizing
                                               transition={{
                                                 type: "spring",
                                                 stiffness: 350,
                                                 damping: 20, // Lower damping for natural bounce
                                                 mass: 0.6,
                                               }}
                                               style={{
                                                 cursor: canvasMode
                                                   ? "pointer"
                                                   : "default",
                                                 position: "relative",
                                                 transformOrigin: "top center", // Ensure expansion happens downward
                                                 willChange: "transform", // GPU acceleration hint
                                               }}
                                             >
                                               {children}
                                             </motion.div>
                                           );
                                         }));

