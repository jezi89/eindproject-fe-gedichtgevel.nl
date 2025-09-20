import { useMemo } from 'react';

/**
 * Hook voor responsive text positioning in PIXI canvas
 * Berekent optimale posities gebaseerd op canvas afmetingen en content
 */
export function useResponsiveTextPosition(canvasWidth, canvasHeight, fontSize, lineHeight, poemLines = []) {
  return useMemo(() => {
    // Bereken totale content hoogte
    const titleHeight = fontSize * 1.5;
    const authorHeight = fontSize * 0.75;
    const poemHeight = poemLines.length * lineHeight;
    const spacing = 20; // Ruimte tussen secties
    
    const totalContentHeight = titleHeight + spacing + authorHeight + spacing + poemHeight;
    
    // Horizontaal centreren binnen canvas (niet viewport)
    const containerX = canvasWidth / 2;
    
    // Verticaal positioneren - hoger dan midden, meer naar boven
    const topMargin = Math.max(60, canvasHeight * 0.15); // 15% van canvas hoogte, minimum 60px
    const containerY = topMargin;
    
    // Relatieve posities binnen container
    const authorY = titleHeight + spacing;
    const poemStartY = authorY + authorHeight + spacing;
    
    // Scale factor voor kleine schermen - alleen als echt nodig
    const minCanvasWidth = 400;
    const scaleFactor = canvasWidth < minCanvasWidth ? canvasWidth / minCanvasWidth : 1;
    
    return {
      containerX,
      containerY,
      authorY,
      poemStartY,
      scaleFactor,
      totalContentHeight,
      // Helper voor debugging
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
