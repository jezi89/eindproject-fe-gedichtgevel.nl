import { useCallback } from 'react';
import { Rectangle } from 'pixi.js';

/**
 * Custom hook for exporting canvas as image files
 *
 * Provides functions to export the current canvas content as JPG or PNG images.
 * Uses viewport.getVisibleBounds() to capture exactly what's visible on screen,
 * accounting for zoom and pan transformations.
 *
 * @param {Object} appRef - Ref to the Pixi Application instance
 * @param {Object} viewportRef - Ref to the Pixi Viewport instance
 * @returns {Object} Export utilities
 */
export function useCanvasExport(appRef, viewportRef) {

    return {
        // exportAsPNG,
        // exportAsJPG,
        // canExport
    };
}
