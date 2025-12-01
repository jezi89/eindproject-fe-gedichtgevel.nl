import { useCallback } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Rectangle } from 'pixi.js';
import { IMAGE_QUALITY_MODE } from '@/utils/imageOptimization';

/**
 * Get quality multiplier for export resolution
 */
function getExportQualityMultiplier(qualityMode) {
    switch (qualityMode) {
        case IMAGE_QUALITY_MODE.ECO: return 0.75;
        case IMAGE_QUALITY_MODE.AUTO: return 1.0;
        case IMAGE_QUALITY_MODE.HIGH: return 2.5;
        default: return 1.0;
    }
}

/**
 * Custom hook for exporting canvas as image files
 * Uses html-to-image for viewport capture and PixiJS Extract API for full sprite export
 *
 * @param {Object} canvasContainerRef - Ref to the canvas container DOM element
 * @param {Object} appRef - Ref to the PixiJS Application
 * @param {Object} backgroundImageRef - Ref to BackgroundImage component (for sprite bounds)
 * @param {string} imageQualityMode - Current quality mode for resolution scaling
 * @returns {Object} Export utilities
 */
export function useCanvasExport(canvasContainerRef, appRef, backgroundImageRef, imageQualityMode = IMAGE_QUALITY_MODE.AUTO, viewportRef) {
    // Helper function to trigger browser download
    const triggerDownload = useCallback((dataUrl, filename) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // Export container as PNG
    const exportAsPNG = useCallback(async () => {
        const container = canvasContainerRef.current;

        if (!container) {
            console.error('Canvas container is not ready for export');
            return;
        }

        try {

            // Use html-to-image to capture the entire canvas container
            const dataUrl = await toPng(container, {
                cacheBust: true,
                pixelRatio: window.devicePixelRatio || 1
            });

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `gedicht-${timestamp}.png`;

            triggerDownload(dataUrl, filename);
        } catch (error) {
            console.error('❌ PNG export failed:', error);
        }
    }, [canvasContainerRef, triggerDownload]);

    // Export container as JPG
    const exportAsJPG = useCallback(async (quality = 0.9) => {
        const container = canvasContainerRef.current;

        if (!container) {
            console.error('Canvas container is not ready for export');
            return;
        }

        try {

            // Use html-to-image to capture the entire canvas container
            const dataUrl = await toJpeg(container, {
                cacheBust: true,
                quality,
                pixelRatio: window.devicePixelRatio || 1
            });

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `gedicht-${timestamp}.jpg`;

            triggerDownload(dataUrl, filename);
        } catch (error) {
            console.error('❌ JPG export failed:', error);
        }
    }, [canvasContainerRef, triggerDownload]);

    // Check if export is available
    const canExport = useCallback(() => {
        return canvasContainerRef.current !== null;
    }, [canvasContainerRef]);

    /**
     * Export full sprite without black bars using PixiJS Extract API
     * Exports the entire sprite area (not just viewport) with quality-aware resolution
     *
     * @param {string} format - 'png' or 'jpeg'
     * @param {number} jpegQuality - JPEG quality (0-1), only used for JPEG format
     * @returns {Promise<string|null>} Data URL of exported image, or null if failed
     */
    const exportFullSprite = useCallback(async (format = 'png', jpegQuality = 0.92) => {
        const app = appRef?.current;
        const bgImageRef = backgroundImageRef?.current;
        const viewport = viewportRef?.current;

        if (!app || !bgImageRef || !viewport) {
            console.error('❌ Export failed: Missing refs', { app: !!app, bgImageRef: !!bgImageRef, viewport: !!viewport });
            return null;
        }

        try {
            // Get sprite bounds in PARENT (viewport) space
            // This gives us the un-zoomed bounds of the background image within the viewport container
            const spriteBounds = bgImageRef.getBoundsInParent ? bgImageRef.getBoundsInParent() : bgImageRef.getSpriteBounds();
            
            if (!spriteBounds) {
                console.error('❌ Export failed: No sprite bounds available');
                return null;
            }

            // Calculate resolution to match original texture size
            // spriteScale is the scale applied to fit the image to the screen
            const spriteScale = bgImageRef.getScale ? bgImageRef.getScale() : 1;
            const originalResolution = 1 / spriteScale;

            let finalResolution = 1.0;

            if (imageQualityMode === IMAGE_QUALITY_MODE.HIGH) {
                // High Quality: Target original texture resolution (1:1 with source image)
                finalResolution = originalResolution;
            } else if (imageQualityMode === IMAGE_QUALITY_MODE.AUTO) {
                // Auto: Target screen resolution (1.0)
                finalResolution = 1.0;
            } else {
                // Eco: Reduced resolution
                finalResolution = 0.75;
            }

            // Create frame rectangle for extraction
            // We use the bounds in viewport space
            const frame = new Rectangle(
                spriteBounds.x,
                spriteBounds.y,
                spriteBounds.width,
                spriteBounds.height
            );

            // Extract canvas from PixiJS renderer
            // Target the VIEWPORT (container), not the stage
            // This renders the content inside the viewport, ignoring the viewport's own zoom/pan transform
            const extractedCanvas = app.renderer.extract.canvas({
                target: viewport,
                frame: frame,
                resolution: finalResolution
            });

            // Convert to data URL based on format
            let dataUrl;
            if (format === 'jpeg' || format === 'jpg') {
                dataUrl = extractedCanvas.toDataURL('image/jpeg', jpegQuality);
            } else {
                dataUrl = extractedCanvas.toDataURL('image/png');
            }

            return dataUrl;

        } catch (error) {
            console.error('❌ Export failed:', error);
            return null;
        }
    }, [appRef, backgroundImageRef, imageQualityMode, viewportRef]);

    /**
     * Export full sprite as PNG and trigger download
     */
    const exportFullSpriteAsPNG = useCallback(async () => {

        const dataUrl = await exportFullSprite('png');
        if (!dataUrl) {
            console.error('❌ Full Sprite PNG export failed');
            return;
        }

        // Generate filename with timestamp and quality indicator
        const timestamp = new Date().toISOString().split('T')[0];
        const qualityLabel = imageQualityMode === IMAGE_QUALITY_MODE.HIGH ? '-hq' : '';
        const filename = `gedicht-${timestamp}${qualityLabel}-full.png`;

        triggerDownload(dataUrl, filename);
    }, [exportFullSprite, triggerDownload, imageQualityMode]);

    /**
     * Export full sprite as JPG and trigger download
     */
    const exportFullSpriteAsJPG = useCallback(async (quality = 0.92) => {

        const dataUrl = await exportFullSprite('jpeg', quality);
        if (!dataUrl) {
            console.error('❌ Full Sprite JPG export failed');
            return;
        }

        // Generate filename with timestamp and quality indicator
        const timestamp = new Date().toISOString().split('T')[0];
        const qualityLabel = imageQualityMode === IMAGE_QUALITY_MODE.HIGH ? '-hq' : '';
        const filename = `gedicht-${timestamp}${qualityLabel}-full.jpg`;

        triggerDownload(dataUrl, filename);
    }, [exportFullSprite, triggerDownload, imageQualityMode]);

    /**
     * Get export data URL without triggering download (for sharing)
     * @returns {Promise<string|null>} Data URL or null
     */
    const getExportDataUrl = useCallback(async (format = 'png') => {
        return await exportFullSprite(format);
    }, [exportFullSprite]);

    return {
        // Viewport exports (html-to-image) - for backward compatibility
        exportAsPNG,
        exportAsJPG,
        // Full sprite exports (PixiJS Extract API) - new print-quality exports
        exportFullSpriteAsPNG,
        exportFullSpriteAsJPG,
        // Utility for sharing
        getExportDataUrl,
        canExport
    };
}
