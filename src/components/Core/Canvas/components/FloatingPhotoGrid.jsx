// src/components/Core/Canvas/components/FloatingPhotoGrid.jsx

import React, {useState, useEffect} from "react";
import styles from "../Canvas.module.scss"; // Updated import path
import { usePhotoPreview } from "@/hooks/canvas/usePhotoPreview";

export default function FloatingPhotoGrid({
                                               photos,
                                               isLoading,
                                               error,
                                               onSetBackground,
                                               onSetBackgroundLoadingFreeze, // NEW: Callback to control background loading freeze
                                               onClose,
                                               onNextPage,
                                               onPrevPage,
                                               hasNextPage,
                                               hasPrevPage,
                                               searchContext,
                                               currentBackground,     // NEW: Current background to preserve
                                               onPreviewChange,       // NEW: Callback for preview state changes
                                               hoverFreezeActive      // NEW: Combined hover freeze state (Alt+J + background loading)
                                           }) {
    const [isVisible, setIsVisible] = useState(false);
    
    // Photo preview functionality
    const photoPreview = usePhotoPreview();

    // Initialize preview system when grid opens
    useEffect(() => {
        console.log('🖼️ FloatingPhotoGrid mounted, opening preview system');
        photoPreview.openGrid(currentBackground);
        
        // Cleanup when component unmounts
        return () => {
            console.log('🖼️ FloatingPhotoGrid unmounting, closing preview system');
            const backgroundToRestore = photoPreview.closeGrid();
            
            // Only restore background if it's different from current
            if (backgroundToRestore && backgroundToRestore !== currentBackground) {
                onSetBackground(backgroundToRestore);
            }
        };
    }, []); // Only run on mount/unmount

    // Update parent when preview state changes
    useEffect(() => {
        if (onPreviewChange) {
            onPreviewChange({
                previewMode: photoPreview.previewMode,
                previewImage: photoPreview.previewImage,
                hasHovered: photoPreview.hasHovered
            });
        }
    }, [photoPreview.previewMode, photoPreview.previewImage, photoPreview.hasHovered, onPreviewChange]);

    // FloatingPhotoGrid component ready

    // Generate title based on search context
    const getTitle = () => {
        if (!searchContext) return "Achtergronden";

        switch (searchContext.type) {
            case 'collection':
                return "Achtergronden";
            case 'pexels_search':
                return `Resultaten voor "${searchContext.query}"`;
            case 'flickr_city':
                return `Foto's uit ${searchContext.query}`;
            case 'pexels_fallback':
                return `Resultaten voor "${searchContext.query}"`;
            default:
                return searchContext.query ? `Resultaten voor "${searchContext.query}"` : "Achtergronden";
        }
    };

    // Animate in when component mounts
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        console.log('🖼️ Closing FloatingPhotoGrid');
        
        // Clean up preview system and get background to restore
        const backgroundToRestore = photoPreview.closeGrid();
        
        setIsVisible(false);
        
        // Wait for animation before actually closing
        setTimeout(() => {
            // Restore background if needed
            if (backgroundToRestore && backgroundToRestore !== currentBackground) {
                console.log('🖼️ Restoring background:', backgroundToRestore);
                onSetBackground(backgroundToRestore);
            }
            onClose();
        }, 300);
    };

    const handleBackgroundClick = (e) => {
        // Close if clicking on backdrop (not the grid itself)
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className={`${styles.photoGridOverlay} ${isVisible ? styles.fadeIn : styles.fadeOut}`}
            onClick={handleBackgroundClick}
        >
            <div className={`${styles.floatingPhotoGrid} ${isVisible ? styles.slideIn : styles.slideOut}`}>
                {/* Header with close button */}
                <div className={styles.floatingGridHeader}>
                    <h3>
                        {getTitle()}
                    </h3>
                    {/* Loading state */}
                    {isLoading && (
                        <div className={styles.loadingMessage}>
                            Foto's laden...
                        </div>
                    )}
                    <div className={styles.headerButtons}>
                        {/* Reset Preview button - only show if user has hovered */}
                        {photoPreview.hasHovered && (
                            <button
                                className={styles.resetPhotoButton}
                                onClick={photoPreview.resetPreview}
                                title="Reset preview naar dimmed achtergrond"
                            >
                                ↺
                            </button>
                        )}
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                            aria-label="Sluit foto grid"
                        >
                            ✕
                        </button>
                    </div>

                </div>

                {/* Enhanced Error message */}
                {error && (
                    <div className={styles.errorMessage}>
                        <h4>⚠️ Fout bij laden van foto's:</h4>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.reloadButton}
                        >
                            🔄 Pagina herladen
                        </button>
                    </div>
                )}


                {/* Photo grid */}
                <div className={styles.floatingPhotoGridContent}>
                    {(photos || []).map((photo) => (
                        <div
                            key={photo.id}
                            className={styles.floatingPhotoThumbnail}
                            onClick={() => {
                                console.log('🖼️ Photo clicked:', photo.src.large2x);

                                // Immediately activate background loading freeze to prevent hover conflicts
                                if (onSetBackgroundLoadingFreeze) {
                                    onSetBackgroundLoadingFreeze(true);
                                    console.log('🚫 Background loading freeze activated');

                                    // Auto-deactivate freeze after 3 seconds (enough time for background loading)
                                    setTimeout(() => {
                                        onSetBackgroundLoadingFreeze(false);
                                        console.log('✅ Background loading freeze deactivated');
                                    }, 3000);
                                }

                                photoPreview.handlePhotoSelect(photo.src.large2x);
                                onSetBackground(photo.src.large2x);
                                handleClose(); // Close grid after selecting
                            }}
                            onMouseEnter={() => {
                                // Check if hover is frozen (e.g., after Alt+J navigation)
                                if (hoverFreezeActive) {
                                    console.log('🚫 Photo hover blocked - freeze active');
                                    return;
                                }
                                console.log('🖼️ Photo hover start:', photo.src.large2x);
                                photoPreview.handlePhotoHover(photo.src.large2x);
                            }}
                            title={photo.alt || 'Hover voor preview, klik om te selecteren'}
                        >
                            <img src={photo.src.tiny} alt={photo.alt}/>
                        </div>
                    ))}
                </div>

                {/* Pagination controls */}
                {(photos && photos.length > 0) && (hasPrevPage || hasNextPage) && (
                    <div className={styles.floatingPaginationControls}>
                        <button
                            onClick={onPrevPage}
                            disabled={!hasPrevPage || isLoading}
                            className={styles.paginationButton}
                        >
                            ← Vorige
                        </button>
                        <button
                            onClick={onNextPage}
                            disabled={!hasNextPage || isLoading}
                            className={styles.paginationButton}
                        >
                            Volgende →
                        </button>
                    </div>
                )}

                {/* No results message */}
                {!isLoading && (!photos || photos.length === 0) && (
                    <div className={styles.noResultsMessage}>
                        Geen foto's gevonden. Probeer een andere zoekopdracht.
                    </div>
                )}
            </div>
        </div>
    );
}
