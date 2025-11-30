import React, {useState, useEffect} from "react";
import styles from "./Canvas.module.scss";
import {usePhotoPreview} from "@/hooks/canvas/usePhotoPreview.js";
import {calculateOptimalImageRequest} from "@/utils/imageOptimization.js";

function calculateAspectRatio(width, height) {
    if (!width || !height) return 'Unknown';

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

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
                                              onSetBackgroundLoadingFreeze,
                                              onClose,
                                              onNextPage,
                                              onPrevPage,
                                              hasNextPage,
                                              hasPrevPage,
                                              searchContext,
                                              currentBackground,
                                              onPreviewChange,
                                              hoverFreezeActive,
                                              imageQualityMode
                                          }) {
    const [isVisible, setIsVisible] = useState(false);
    const photoPreview = usePhotoPreview();

    useEffect(() => {
        photoPreview.openGrid(currentBackground);

        return () => {
            const backgroundToRestore = photoPreview.closeGrid();

            if (backgroundToRestore && backgroundToRestore !== currentBackground) {
                onSetBackground(backgroundToRestore);
            }
        };
    }, []);

    useEffect(() => {
        if (onPreviewChange) {
            onPreviewChange({
                previewMode: photoPreview.previewMode,
                previewImage: photoPreview.previewImage,
                hasHovered: photoPreview.hasHovered
            });
        }
    }, [photoPreview.previewMode, photoPreview.previewImage, photoPreview.hasHovered, onPreviewChange]);

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

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        const backgroundToRestore = photoPreview.closeGrid();
        setIsVisible(false);

        setTimeout(() => {
            if (backgroundToRestore && backgroundToRestore !== currentBackground) {
                onSetBackground(backgroundToRestore);
            }
            onClose();
        }, 300);
    };

    const handleBackgroundClick = (e) => {
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


                <div className={styles.floatingPhotoGridContent}>
                    {(photos || []).map((photo) => {
                        const isPrintQuality = photo.width && photo.height &&
                            Math.max(photo.width, photo.height) >= 3000;

                        const isLowQuality = photo.width && photo.height &&
                            Math.max(photo.width, photo.height) <= 1024;

                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        const viewportAspect = viewportWidth / viewportHeight;
                        const photoAspect = photo.width / photo.height;

                        let cropPercentage = 0;
                        if (photoAspect > viewportAspect) {
                            const usedWidth = photo.height * viewportAspect;
                            cropPercentage = Math.round((1 - usedWidth / photo.width) * 100);
                        } else {
                            const usedHeight = photo.width / viewportAspect;
                            cropPercentage = Math.round((1 - usedHeight / photo.height) * 100);
                        }

                        return (
                            <PhotoThumbnail
                                key={photo.id}
                                photo={photo}
                                isPrintQuality={isPrintQuality}
                                isLowQuality={isLowQuality}
                                styles={styles}
                                onClick={() => {
                                    if (onSetBackgroundLoadingFreeze) {
                                        onSetBackgroundLoadingFreeze(true);

                                        setTimeout(() => {
                                            onSetBackgroundLoadingFreeze(false);
                                        }, 3000);
                                    }

                                    const optimalUrl = calculateOptimalImageRequest(
                                        photo,
                                        window.innerWidth,
                                        window.innerHeight,
                                        imageQualityMode
                                    );

                                    photoPreview.handlePhotoSelect(optimalUrl);

                                    const backgroundData = {
                                        url: optimalUrl,
                                        thumbnail: photo.src.tiny,
                                        alt: photo.alt,
                                        photographer: photo.photographer || 'Unknown',
                                        source: searchContext?.source || 'custom',
                                        width: photo.width || null,
                                        height: photo.height || null,

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

                                        ...(searchContext?.source === 'pexels' && photo.src && {
                                            src: photo.src
                                        })
                                    };

                                    onSetBackground(backgroundData);
                                    handleClose();
                                }}
                                onMouseEnter={() => {
                                    if (hoverFreezeActive) {
                                        return;
                                    }

                                    const optimalUrl = calculateOptimalImageRequest(
                                        photo,
                                        window.innerWidth,
                                        window.innerHeight,
                                        imageQualityMode
                                    );
                                    photoPreview.handlePhotoHover(optimalUrl);
                                }}
                                searchContext={searchContext}
                            />
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

function PhotoThumbnail({ photo, isPrintQuality, isLowQuality, styles, onClick, onMouseEnter, searchContext }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className={styles.floatingPhotoThumbnail}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            title={photo.alt || 'Hover voor preview, klik om te selecteren'}
        >
            {/* Loading Spinner */}
            {!isLoaded && (
                <div className={styles.thumbnailLoader}>
                    <div className={styles.spinner}></div>
                </div>
            )}

            <img
                src={photo.src.tiny}
                alt={photo.alt}
                onLoad={() => setIsLoaded(true)}
                style={{ opacity: isLoaded ? 1 : 0 }}
            />

            {/* Badges */}
            <div className={styles.badgeContainer}>
                {isPrintQuality && (
                    <span
                        className={styles.printQualityBadge}
                        title="Print-kwaliteit (>3000px)"
                    >
                        ⭐
                    </span>
                )}
                {isLowQuality && (
                    <span
                        className={styles.lowQualityBadge}
                        title="Lage resolutie (SD) - Max 1024px"
                    >
                        SD
                    </span>
                )}
            </div>

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
                        {photo.height > photo.width ? '📱 Portrait' : '🖼️ Landscape'}
                    </div>
                </div>
            )}
        </div>
    );
}
