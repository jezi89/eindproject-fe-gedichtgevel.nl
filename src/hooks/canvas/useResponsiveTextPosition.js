import { useMemo } from 'react';

/**
 * Hook for responsive text positioning in PIXI canvas
 */
export function useResponsiveTextPosition(canvasWidth, canvasHeight, fontSize, lineHeight, poemLines = []) {
  return useMemo(() => {
    const titleHeight = fontSize * 1.5;
    const authorHeight = fontSize * 0.75;
    const poemHeight = poemLines.length * lineHeight;
    const spacing = 20;

    const totalContentHeight = titleHeight + spacing + authorHeight + spacing + poemHeight;

    const containerX = canvasWidth / 2;

    const topMargin = Math.max(60, canvasHeight * 0.15);
    const containerY = topMargin;

    const authorY = titleHeight + spacing;
    const poemStartY = authorY + authorHeight + spacing;

    const minCanvasWidth = 400;
    const scaleFactor = canvasWidth < minCanvasWidth ? canvasWidth / minCanvasWidth : 1;

    return {
      containerX,
      containerY,
      authorY,
      poemStartY,
      scaleFactor,
      totalContentHeight,
      debug: {
        canvasWidth,
        canvasHeight,
        totalContentHeight,
        topMargin,
        isContentTooTall: totalContentHeight > canvasHeight * 0.8,
        scaleFactor
      }
    };
  }, [canvasWidth, canvasHeight, fontSize, lineHeight, poemLines.length]);
}
