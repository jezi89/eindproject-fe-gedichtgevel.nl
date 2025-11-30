import { useRef, useEffect } from 'react';

/**
 * Auto-centers viewport content with responsive positioning
 *
 * @param {Object} config
 * @param {React.RefObject} config.viewportRef - PIXI Viewport instance
 * @param {React.RefObject} config.contentRef - Content container
 * @param {Array} config.deps - Triggers for re-centering
 * @param {Object} config.poemOffset - Poem offset for move detection
 * @param {Object} config.lineOverrides - Line overrides for move detection
 */
export function useAutoRecenter({ viewportRef, contentRef, poemOffset, lineOverrides, deps }) {
  const rafId = useRef(0);

  useEffect(() => {
    if (!viewportRef.current || !contentRef.current) return;

    const hasPoemMoves = poemOffset && (poemOffset.x !== 0 || poemOffset.y !== 0);
    const hasLineMoves = lineOverrides && Object.keys(lineOverrides).some(index => {
      const override = lineOverrides[index];
      return override && (override.xOffset || override.yOffset);
    });

    if (hasPoemMoves || hasLineMoves) {
      return;
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const content = contentRef.current;

      if (!viewport || !content) return;
      if (!viewport.animate || typeof viewport.animate !== "function") return;
      if (!content.getLocalBounds || typeof content.getLocalBounds !== "function") return;

      const bounds = content.getLocalBounds();
      if (bounds.width <= 0 || bounds.height <= 0) return;

      const centerX = content.parent ? content.parent.x + content.x : content.x;

      viewport.animate({
        position: {
          x: centerX,
          y: viewport.center.y
        },
        time: 250,
        ease: "easeOutCubic",
        removeOnInterrupt: true,
      });
    });

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, deps);
}
