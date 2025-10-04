import { useCallback } from 'react';

/**
 * Custom hook for exporting canvas as image files
 * Simple approach: exports the entire viewport as-is
 *
 * @param {Object} appRef - Ref to the Pixi Application instance
 * @returns {Object} Export utilities
 */
export function useCanvasExport(appRef) {
    // Helper function to trigger browser download
    const triggerDownload = useCallback((base64, filename) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // Export canvas as specific format
    const exportCanvas = useCallback(async (format, quality = 0.9) => {
        const app = appRef.current;

        if (!app || !app.renderer) {
            console.error('Canvas is not ready for export');
            return;
        }

        try {
            // Export the entire stage using Pixi's renderer.extract
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const base64 = await app.renderer.extract.base64(app.stage, mimeType, quality);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `gedicht-${timestamp}.${format === 'jpeg' ? 'jpg' : 'png'}`;

            triggerDownload(base64, filename);
            console.log(`✅ Export successful: ${filename}`);
        } catch (error) {
            console.error('❌ Export failed:', error);
        }
    }, [appRef, triggerDownload]);

    // Export as PNG
    const exportAsPNG = useCallback(() => {
        return exportCanvas('png', 1.0);
    }, [exportCanvas]);

    // Export as JPG
    const exportAsJPG = useCallback((quality = 0.9) => {
        return exportCanvas('jpeg', quality);
    }, [exportCanvas]);

    // Check if export is available
    const canExport = useCallback(() => {
        return appRef.current && appRef.current.renderer;
    }, [appRef]);

    return {
        exportAsPNG,
        exportAsJPG,
        canExport
    };
}
