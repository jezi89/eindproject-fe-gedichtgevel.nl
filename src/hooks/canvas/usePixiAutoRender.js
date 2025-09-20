import { useEffect, useRef } from 'react';

/**
 * Modern React 19 hook voor automatische PIXI re-renders
 * Triggert re-render wanneer layout properties veranderen
 */
export function usePixiAutoRender(app, dependencies = []) {
  const rafRef = useRef(null);
  const lastDepsRef = useRef(dependencies);

  useEffect(() => {
    if (!app?.renderer || !app?.stage) return;

    // Check if dependencies have actually changed
    const depsChanged = dependencies.some((dep, index) => 
      dep !== lastDepsRef.current[index]
    );

    if (depsChanged) {
      // Cancel any pending render
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule render on next frame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        if (app?.renderer && app?.stage) {
          app.renderer.render(app.stage);
        }
        rafRef.current = null;
      });

      // Update last dependencies
      lastDepsRef.current = [...dependencies];
    }

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Force immediate render function
  const forceRender = () => {
    if (app?.renderer && app?.stage) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        app.renderer.render(app.stage);
        rafRef.current = null;
      });
    }
  };

  return { forceRender };
}
