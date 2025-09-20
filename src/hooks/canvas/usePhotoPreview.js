import { useState, useCallback } from 'react';

/**
 * Hook for managing photo preview functionality in FloatingPhotoGrid
 * Simplified version: dimmed (grid open, no hover) or preview (thumbnail hovered)
 * Once hovered, preview persists until reset or grid close
 */
export function usePhotoPreview() {
    // Two main states for the layout
    const [previewMode, setPreviewMode] = useState('normal'); // 'normal' | 'dimmed' | 'preview'
    const [previewImage, setPreviewImage] = useState(null);
    const [originalBackground, setOriginalBackground] = useState(null);
    const [hasHovered, setHasHovered] = useState(false); // Persistent hover state

    // Open grid - set to dimmed state and store original background
    const openGrid = useCallback((currentBackground) => {
        console.log('🖼️ Opening photo grid, storing background:', currentBackground);
        setOriginalBackground(currentBackground);
        setPreviewMode('dimmed');
        setPreviewImage(null);
        setHasHovered(false); // Reset hover state when opening
    }, []);

    // Close grid - restore original background and reset state
    const closeGrid = useCallback(() => {
        console.log('🖼️ Closing photo grid');
        setPreviewMode('normal');
        setPreviewImage(null);
        setHasHovered(false); // Reset hover state when closing
        const bgToRestore = originalBackground;
        setOriginalBackground(null);
        return bgToRestore; // Return background to restore
    }, [originalBackground]);

    // Handle hover over photo thumbnail - immediate response
    const handlePhotoHover = useCallback((photoUrl) => {
        console.log('🖼️ Photo hover:', photoUrl);
        setPreviewImage(photoUrl);
        setPreviewMode('preview');
        setHasHovered(true); // Mark that user has hovered (persistent)
    }, []);

    // Reset preview to dimmed state (for reset button)
    const resetPreview = useCallback(() => {
        console.log('🖼️ Resetting preview to dimmed state');
        setPreviewImage(null);
        setPreviewMode('dimmed');
        setHasHovered(false); // Allow dimmed state again
    }, []);

    // Handle immediate photo selection (click)
    const handlePhotoSelect = useCallback((photoUrl) => {
        console.log('🖼️ Photo selected:', photoUrl);
        // Don't change preview state here - let parent handle background setting
        // The closeGrid function will handle cleanup
        return photoUrl;
    }, []);

    return {
        // State
        previewMode,        // 'normal' | 'dimmed' | 'preview'
        previewImage,       // URL of image being previewed, or null
        originalBackground, // Original background before grid opened
        hasHovered,         // Boolean - has user hovered over any thumbnail
        
        // Actions
        openGrid,           // (currentBg) => void - opens grid and stores current bg
        closeGrid,          // () => backgroundToRestore - closes grid and returns bg to restore
        handlePhotoHover,   // (photoUrl) => void - immediate hover handler
        handlePhotoSelect,  // (photoUrl) => photoUrl - immediate selection handler
        resetPreview,       // () => void - reset to dimmed state
    };
}
