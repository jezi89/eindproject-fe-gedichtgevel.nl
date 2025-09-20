/**
 * @fileoverview Custom hook for automatically centering content in a PIXI viewport
 *
 * @description
 * This hook provides automatic viewport centering functionality that responds to
 * content changes, canvas resizing, and text alignment modifications. It uses
 * optimized bounds calculation and aspect-ratio aware positioning.
 *
 * @version 2.0.0
 * @author Learning Project - React 19 + PIXI.js Integration
 */

import { useEffect, useRef } from "react";

/**
 * Custom hook for auto-centering viewport content with enhanced stability
 *
 * @param {Object} config - Configuration object
 * @param {React.RefObject} config.viewportRef - Reference to PIXI Viewport instance
 * @param {React.RefObject} config.contentRef - Reference to content container
 * @param {Array} config.deps - Dependency array for triggering re-centering
 * @param {Object} config.poemOffset - Current poem offset for move detection
 * @param {Object} config.lineOverrides - Line overrides for move detection
 *
 * @description
 * Key improvements in this version:
 * - Uses getLocalBounds() for stability (not affected by world transforms)
 * - Stable X positioning using container coordinates
 * - Only auto-centers when no moves have been made (respects user positioning)
 * - Comprehensive safety checks to prevent runtime errors
 * - requestAnimationFrame optimization for smooth performance
 *
 * @example
 * useAutoRecenter({
 *   viewportRef,
 *   contentRef,
 *   poemOffset,
 *   lineOverrides,
 *   deps: [width, height, fontSize, textAlign] // triggers re-center when changed
 * });
 */
export function useAutoRecenter({ viewportRef, contentRef, poemOffset, lineOverrides, deps }) {
  /**
   * RAF ID storage for cleanup and preventing animation stutter
   * @type {React.MutableRefObject<number>}
   */
  const rafId = useRef(0);

  useEffect(() => {
    /**
     * Initial safety check - ensure both refs are available
     *
     * @description
     * This prevents the hook from running when components are still mounting
     * or when refs haven't been assigned yet.
     */
    if (!viewportRef.current || !contentRef.current) return;

    /**
     * Check if any moves have been made - if so, don't auto-center
     *
     * @description
     * Auto-centering should only happen when content is in its default position.
     * If the user has moved the poem or individual lines, respect their positioning.
     */
    const hasPoemMoves = poemOffset && (poemOffset.x !== 0 || poemOffset.y !== 0);
    const hasLineMoves = lineOverrides && Object.keys(lineOverrides).some(index => {
      const override = lineOverrides[index];
      return override && (override.xOffset || override.yOffset);
    });

    if (hasPoemMoves || hasLineMoves) {
      console.log('Skipping auto-recenter: moves detected', { 
        hasPoemMoves, 
        hasLineMoves,
        poemOffset,
        lineOverrideCount: Object.keys(lineOverrides || {}).length
      });
      return;
    }

    /**
     * Cancel any previous animation request to prevent stutter
     *
     * @description
     * This ensures only one centering animation runs at a time.
     * Without this, rapid state changes could cause multiple overlapping
     * animations leading to jerky movement.
     */
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    /**
     * Request new animation frame for optimal performance
     *
     * @description
     * Using requestAnimationFrame ensures the centering happens during
     * the browser's repaint cycle, resulting in smooth animations.
     */
    rafId.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const content = contentRef.current;

      /**
       * Enhanced safety checks for PIXI objects
       *
       * @description
       * These checks prevent runtime errors that could occur if:
       * - Viewport gets destroyed during React updates
       * - Content container becomes invalid
       * - PIXI objects lose their methods due to memory issues
       */
      if (!viewport || !content) return;
      if (!viewport.animate || typeof viewport.animate !== "function") return;
      if (
        !content.getLocalBounds ||
        typeof content.getLocalBounds !== "function"
      )
        return;

      /**
       * Use getLocalBounds() instead of getBounds() for stability
       *
       * @description
       * getLocalBounds() returns bounds in the container's local space,
       * which is NOT affected by:
       * - World transformations (viewport panning/zooming)
       * - Text anchor changes (left/center/right alignment)
       * - Parent container scaling
       *
       * This makes it much more stable than getBounds() which returns
       * world coordinates that change with every viewport interaction.
       */
      const bounds = content.getLocalBounds();

      /**
       * Validate bounds before proceeding
       *
       * @description
       * Empty bounds indicate no renderable content, so we skip centering.
       * This prevents centering on invisible or zero-sized content.
       */
      if (bounds.width <= 0 || bounds.height <= 0) return;

      /**
       * STABLE X POSITIONING: Use container's world position
       *
       * @description
       * content.x is the container's stable X position in world coordinates.
       * This value comes from useResponsiveTextPosition and is always canvasWidth/2.
       *
       * Why this works:
       * - Container position never changes with text alignment
       * - Text alignment only affects anchor points WITHIN the container
       * - Viewport should always center on the container, not the text bounds
       *
       * This prevents the "drift" issue when switching between alignments.
       */
      const centerX = content.x;

      /**
       * X POSITIONING ONLY: Stable text alignment without Y camera movement
       * 
       * @description
       * LEARNING FOCUS: Master text alignment concepts without Y positioning complexity
       * 
       * Core principle:
       * - X positioning prevents text alignment drift
       * - Y positioning handled entirely by useResponsiveTextPosition 
       * - Camera NEVER adjusts Y axis - only X centering
       * - No camera-induced vertical movement during control changes
       * 
       * Benefits for learning:
       * ✅ Zero Y distractions while mastering X alignment concepts
       * ✅ Clean separation: content positioning vs camera centering
       * ✅ Predictable behavior: only X axis responds to alignment changes
       * ✅ Pure focus on anchor point vs container position concepts
       */

      /**
       * X-only viewport animation (with static Y)
       * 
       * @description
       * Only animate X position to center content horizontally.
       * Y axis uses current camera position - no vertical movement.
       * 
       * Technical note: PIXI viewport.animate() requires both x,y coordinates.
       * Providing only x breaks the animation. Solution: use current Y position.
       */
      viewport.animate({
        /**
         * Target position in world coordinates
         * - X: Stable container center (prevents alignment drift)
         * - Y: Current camera Y position (no movement, just maintains position)
         */
        position: { 
          x: centerX,
          y: viewport.center.y // Keep current Y - no camera Y movement
        },

        /**
         * Animation duration: 250ms
         *
         * @description
         * Fast enough to feel responsive, slow enough to be smooth.
         * Not too fast to cause motion sickness, not too slow to feel sluggish.
         */
        time: 250,

        /**
         * Easing function: easeOutCubic
         *
         * @description
         * Creates natural-feeling movement that starts fast and slows down,
         * similar to how objects move in the real world with friction.
         */
        ease: "easeOutCubic",

        /**
         * Remove animation on user interrupt
         *
         * @description
         * If user starts panning/zooming during auto-centering,
         * the animation is immediately cancelled to avoid conflicts.
         * This ensures user input always takes priority.
         */
        removeOnInterrupt: true,
      });
    });

    /**
     * Cleanup function for useEffect
     *
     * @description
     * This cleanup function runs when:
     * - Component unmounts
     * - Dependencies change (before running the effect again)
     * - Component re-renders with different dependencies
     *
     * It prevents memory leaks and animation conflicts by cancelling
     * any pending requestAnimationFrame calls.
     */
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0; // Reset the ID for cleaner debugging
      }
    };
  }, deps); // Dependencies array - hook re-runs when any of these values change
}
