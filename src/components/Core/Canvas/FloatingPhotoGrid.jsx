// src/components/Core/Canvas/components/FloatingPhotoGrid.jsx

import React, {useState, useEffect} from "react";
import styles from "./Canvas.module.scss"; // Updated import path
import {usePhotoPreview} from "@/hooks/canvas/usePhotoPreview.js";
import {calculateOptimalImageRequest} from "@/utils/imageOptimization.js";

/**
 * Calculate simplified aspect ratio
 */
function calculateAspectRatio(width, height) {
    if (!width || !height) return 'Unknown';

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    // Common ratios
    const decimal = (width / height).toFixed(2);
    const common = {
        '1.33': '4:3', '1.78': '16:9', '1.50': '3:2',
        '0.67': '2:3', '0.75': '3:4', '1.00': '1:1', '0.56': '9:16'
    };

    return common[decimal] || `${ratioW}:${ratioH}`;
}

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
                                              hoverFreezeActive,     // NEW: Combined hover freeze state (Alt+J + background loading)
                                              imageQualityMode       // NEW: Image quality mode for smart image fetching
                                          }) {
    const [isVisible, setIsVisible] = useState(false);

    // Photo preview functionality
    const photoPreview = usePhotoPreview();

    // Initialize preview system when grid opens
    useEffect(() => {

        photoPreview.openGrid(currentBackground);

        // Cleanup when component unmounts
        return () => {

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

    // Generate title based on search context with source indicator
    const getTitle = () => {
        if (!searchContext) return "Achtergronden";

        const source = searchContext.source === 'flickr' ? '📸 Flickr' : '🔍 Pexels';

        switch (searchContext.type) {
            case 'collection':
                return "Achtergronden";
            case 'pexels_search':
                return `${source}: "${searchContext.query}"`;
            case 'flickr_city':
                return `${source}: ${searchContext.query}`;
            case 'flickr_text':
                return `${source}: "${searchContext.query}"`;
            case 'pexels_fallback':
                return `${source}: "${searchContext.query}"`;
            default:
                return searchContext.query ? `${source}: "${searchContext.query}"` : "Achtergronden";
        }
    };

    // Animate in when component mounts
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {

        // Clean up preview system and get background to restore
        const backgroundToRestore = photoPreview.closeGrid();

        setIsVisible(false);

        // Wait for animation before actually closing
        setTimeout(() => {
            // Restore background if needed
            if (backgroundToRestore && backgroundToRestore !== currentBackground) {

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
                    {(photos || []).map((photo) => {
                        // Check if photo meets print-quality threshold (3000px on longest side for A4 @ 300 DPI)
                        const isPrintQuality = photo.width && photo.height &&
                            Math.max(photo.width, photo.height) >= 3000;

                        // Calculate crop percentage for "cover" effect
                        // Viewport aspect ratio is typically 16:9 (or window dimensions)
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        const viewportAspect = viewportWidth / viewportHeight;
                        const photoAspect = photo.width / photo.height;

                        let cropPercentage = 0;
                        if (photoAspect > viewportAspect) {
                            // Photo is wider - will crop horizontally
                            const usedWidth = photo.height * viewportAspect;
                            cropPercentage = Math.round((1 - usedWidth / photo.width) * 100);
                        } else {
                            // Photo is taller - will crop vertically
                            const usedHeight = photo.width / viewportAspect;
                            cropPercentage = Math.round((1 - usedHeight / photo.height) * 100);
                        }

                        return (
                        <div
                            key={photo.id}
                            className={styles.floatingPhotoThumbnail}
                            onClick={() => {

                                // Immediately activate background loading freeze to prevent hover conflicts
                                if (onSetBackgroundLoadingFreeze) {
                                    onSetBackgroundLoadingFreeze(true);

                                    // Auto-deactivate freeze after 3 seconds (enough time for background loading)
                                    setTimeout(() => {
                                        onSetBackgroundLoadingFreeze(false);

                                    }, 3000);
                                }

                                // Calculate optimal image URL based on viewport and quality mode
                                const optimalUrl = calculateOptimalImageRequest(
                                    photo,
                                    window.innerWidth,
                                    window.innerHeight,
                                    imageQualityMode
                                );

                                photoPreview.handlePhotoSelect(optimalUrl);

                                // Pass complete photo object with ALL metadata for reactive quality switching
                                const backgroundData = {
                                    url: optimalUrl,
                                    thumbnail: photo.src.tiny,
                                    alt: photo.alt,
                                    photographer: photo.photographer || 'Unknown',
                                    source: searchContext?.source || 'custom',
                                    width: photo.width || null,
                                    height: photo.height || null,

                                    // CRITICAL: For Flickr - store ALL URL variants for quality recalculation
                                    ...(photo.source === 'flickr' && {
                                        url_b: photo.url_b,
                                        url_h: photo.url_h,
                                        url_k: photo.url_k,
                                        url_o: photo.url_o,
                                        width_b: photo.width_b,
                                        height_b: photo.height_b,
                                        width_h: photo.width_h,
                                        height_h: photo.height_h,
                                        width_k: photo.width_k,
                                        height_k: photo.height_k,
                                        width_o: photo.width_o,
                                        height_o: photo.height_o,
                                    }),

                                    // For Pexels - store src object for dynamic URL generation
                                    ...(searchContext?.source === 'pexels' && photo.src && {
                                        src: photo.src
                                    })
                                };

                                console.log('📸 FloatingPhotoGrid: Storing photo data for quality switching:', {
                                    source: backgroundData.source,
                                    hasFlickrVariants: !!(photo.url_b || photo.url_h || photo.url_k),
                                    hasPexelsSrc: !!(photo.src),
                                    dimensions: `${backgroundData.width}×${backgroundData.height}`
                                });

                                onSetBackground(backgroundData);

                                handleClose(); // Close grid after selecting
                            }}
                            onMouseEnter={() => {
                                // Check if hover is frozen (e.g., after Alt+J navigation)
                                if (hoverFreezeActive) {

                                    return;
                                }

                                // Calculate optimal image URL for preview
                                const optimalUrl = calculateOptimalImageRequest(
                                    photo,
                                    window.innerWidth,
                                    window.innerHeight,
                                    imageQualityMode
                                );
                                photoPreview.handlePhotoHover(optimalUrl);
                            }}
                            title={photo.alt || 'Hover voor preview, klik om te selecteren'}
                        >
                            <img src={photo.src.tiny} alt={photo.alt}/>
                            {isPrintQuality && (
                                <span
                                    className={styles.printQualityBadge}
                                    title="Print-kwaliteit (>3000px)"
                                >
                                    ⭐
                                </span>
                            )}
                            {/* Enhanced Metadata Overlay */}
                            {photo.width && photo.height && (
                                <div className={styles.thumbnailMetadata}>
                                    <div className={styles.metadataDimensions}>
                                        {photo.width} × {photo.height}
                                    </div>
                                    <div className={styles.metadataRow}>
                                        <span className={styles.metadataAspect}>
                                            {calculateAspectRatio(photo.width, photo.height)}
                                        </span>
                                        <span className={styles.metadataSource}>
                                            {searchContext?.source === 'flickr' ? '📸 Flickr' : '🔍 Pexels'}
                                        </span>
                                    </div>
                                    <div className={styles.metadataOrientation}>
                                        {photo.height > photo.width ? '📱 Portrait (fit-width)' : '🖼️ Landscape (contain)'}
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}
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
