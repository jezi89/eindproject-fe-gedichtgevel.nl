import { useState, useCallback } from 'react';
import { uploadCanvasImage } from '@/services/supabase/storageService';

/**
 * Custom hook for sharing canvas designs
 *
 * @param {Object} exportUtils - The export utilities from useCanvasExport
 * @returns {Object} Share utilities and state
 */
export function useCanvasShare(exportUtils) {
    const [isSharing, setIsSharing] = useState(false);
    const [shareError, setShareError] = useState(null);
    const [shareUrl, setShareUrl] = useState(null);

    /**
     * Share the current canvas state
     * 1. Get Data URL from exportUtils (JPEG)
     * 2. Convert to Blob
     * 3. Upload to Supabase
     * 4. Return public URL
     * 
     * @param {string} [designId] - Optional design ID to link image to database record
     */
    const shareDesign = useCallback(async (designId = null) => {
        if (!exportUtils || !exportUtils.getExportDataUrl) {
            setShareError('Export utilities not available');
            return null;
        }

        setIsSharing(true);
        setShareError(null);
        setShareUrl(null);

        try {
            // 1. Get Data URL (JPEG for smaller size/compatibility)
            // We use 'jpeg' format as requested by the user for the bucket
            const dataUrl = await exportUtils.getExportDataUrl('jpeg');
            
            if (!dataUrl) {
                throw new Error('Failed to generate image data');
            }

            // 2. Convert Data URL to Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // 3. Generate filename
            // If designId is provided, use it to link image to the database record.
            // Otherwise, generate a unique ID.
            let uniqueId;
            if (designId) {
                uniqueId = designId;
            } else if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                uniqueId = crypto.randomUUID();
            } else {
                uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
            }
            
            const fileName = `design-${uniqueId}.jpg`;

            // 4. Upload to Supabase
            const { publicUrl, error } = await uploadCanvasImage(blob, fileName);

            if (error) {
                throw error;
            }

            setShareUrl(publicUrl);
            return publicUrl;

        } catch (err) {
            console.error('❌ Share failed:', err);
            setShareError(err.message || 'Failed to share design');
            return null;
        } finally {
            setIsSharing(false);
        }
    }, [exportUtils]);

    const resetShareState = useCallback(() => {
        setShareError(null);
        setShareUrl(null);
        setIsSharing(false);
    }, []);

    return {
        shareDesign,
        isSharing,
        shareError,
        shareUrl,
        resetShareState
    };
}
