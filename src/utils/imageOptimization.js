/**
 * Smart Image Fetching Utility
 *
 * Calculates optimal image URLs based on viewport dimensions and quality mode
 * to minimize bandwidth while maintaining quality.
 *
 * Strategies:
 * - Preview Mode: Instant hover feedback with small variants
 * - Pexels: Use dynamic URL parameters (?w= or ?h=) based on aspect ratio
 * - Flickr: Select best-fit URL from available sizes with variant-specific dimensions
 */

/**
 * Quality modes for image loading
 * - preview: Low-res instant hover (hardcoded small variants)
 * - eco: Bandwidth-saving (0.75x DPR)
 * - auto: Standard quality (1.0x DPR)
 * - high: High quality (2.5x DPR)
 */
export const IMAGE_QUALITY_MODE = {
    PREVIEW: 'preview',
    ECO: 'eco',
    AUTO: 'auto',
    HIGH: 'high'
};

/**
 * Get quality multiplier based on quality mode
 */
function getQualityMultiplier(qualityMode) {
    switch (qualityMode) {
        case IMAGE_QUALITY_MODE.PREVIEW: return 0.5;   // Handled separately in functions
        case IMAGE_QUALITY_MODE.ECO: return 0.75;
        case IMAGE_QUALITY_MODE.AUTO: return 1.0;
        case IMAGE_QUALITY_MODE.HIGH: return 2.5;      // 2.5x for high quality!
        default: return 1.0;
    }
}

/**
 * Calculate optimal Pexels image URL (Contain/Fit-Width strategy)
 * @param {Object} photo - Photo object with width, height, and src.original
 * @param {number} viewportWidth - Viewport width (NOT multiplied by DPR)
 * @param {number} viewportHeight - Viewport height (NOT multiplied by DPR)
 * @param {string} qualityMode - Quality mode (preview, eco, auto, high)
 * @returns {string} Optimized Pexels URL
 */
function calculatePexelsOptimalURL(photo, viewportWidth, viewportHeight, qualityMode = IMAGE_QUALITY_MODE.AUTO) {
    // Apply quality multiplier
    const qualityMultiplier = getQualityMultiplier(qualityMode);
    viewportWidth = Math.round(viewportWidth * qualityMultiplier);
    viewportHeight = Math.round(viewportHeight * qualityMultiplier);
    const isPortrait = photo.height > photo.width;

    let url = photo.src.original;
    let targetDimension, dimensionType;

    if (isPortrait) {
        // Portrait: Fit to width (crop bottom)
        targetDimension = Math.round(viewportWidth);
        dimensionType = 'w';
        console.log(`📐 Pexels: Portrait fit-width (${targetDimension}px)`);
    } else {
        // Landscape: Contain (fit within viewport)
        const scaleX = viewportWidth / photo.width;
        const scaleY = viewportHeight / photo.height;
        const containScale = Math.min(scaleX, scaleY);

        const targetWidth = Math.round(photo.width * containScale);
        const targetHeight = Math.round(photo.height * containScale);

        // Use limiting dimension
        if (scaleY < scaleX) {
            targetDimension = targetHeight;
            dimensionType = 'h';
        } else {
            targetDimension = targetWidth;
            dimensionType = 'w';
        }
        console.log(`📐 Pexels: Landscape ${dimensionType}-constrained (${targetDimension}px, scale: ${containScale.toFixed(2)})`);
    }

    return `${url}?auto=compress&${dimensionType}=${targetDimension}`;
}

/**
 * Calculate optimal Flickr image URL from available sizes (Contain/Fit-Width strategy)
 * @param {Object} photo - Photo object with available URLs
 * @param {number} viewportWidth - Viewport width (NOT multiplied by DPR)
 * @param {number} viewportHeight - Viewport height (NOT multiplied by DPR)
 * @param {string} qualityMode - Quality mode (preview, eco, auto, high)
 * @returns {string} Best-fit Flickr URL
 */
function calculateFlickrOptimalURL(photo, viewportWidth, viewportHeight, qualityMode = IMAGE_QUALITY_MODE.AUTO) {
    // Apply quality multiplier
    const qualityMultiplier = getQualityMultiplier(qualityMode);
    viewportWidth = Math.round(viewportWidth * qualityMultiplier);
    viewportHeight = Math.round(viewportHeight * qualityMultiplier);
    const isPortrait = photo.height > photo.width;

    let targetSize;
    if (isPortrait) {
        targetSize = viewportWidth;
    } else {
        const scaleX = viewportWidth / photo.width;
        const scaleY = viewportHeight / photo.height;
        const containScale = Math.min(scaleX, scaleY);

        const targetWidth = Math.round(photo.width * containScale);
        const targetHeight = Math.round(photo.height * containScale);
        targetSize = Math.max(targetWidth, targetHeight);
    }

    const sizes = [
        { key: 'url_b', width: 1024, label: '_b (1024px)' },
        { key: 'url_h', width: 1600, label: '_h (1600px)' },
        { key: 'url_k', width: 2048, label: '_k (2048px)' },
        { key: 'url_o', width: photo.width || 4000, label: '_o (original)' }
    ];

    for (const size of sizes) {
        if (photo[size.key] && size.width >= targetSize) {
            console.log(`📐 Flickr: ${size.label} for ${targetSize}px (${isPortrait ? 'portrait' : 'landscape'})`);
            return photo[size.key];
        }
    }

    const fallback = photo.url_o || photo.url_k || photo.url_h || photo.url_b || photo.src?.large2x;
    console.log(`📐 Flickr: Fallback (${isPortrait ? 'portrait' : 'landscape'})`);
    return fallback;
}

/**
 * Calculate optimal image request based on viewport (Contain/Fit-Width strategy)
 * @param {Object} photo - Photo object from API
 * @param {number} [windowWidth] - Window width (defaults to window.innerWidth)
 * @param {number} [windowHeight] - Window height (defaults to window.innerHeight)
 * @param {string} [qualityMode] - Quality mode (preview, eco, auto, high)
 * @returns {string} Optimized image URL
 */
export function calculateOptimalImageRequest(
    photo,
    windowWidth = window.innerWidth,
    windowHeight = window.innerHeight,
    qualityMode = IMAGE_QUALITY_MODE.AUTO
) {
    // Use viewport dimensions directly (NO DPR multiplication)
    const viewportWidth = Math.round(windowWidth);
    const viewportHeight = Math.round(windowHeight);

    console.log(`📊 Smart Image Request:`, {
        viewport: `${viewportWidth}×${viewportHeight}`,
        original: `${photo.width}×${photo.height}`,
        source: photo.source,
        qualityMode
    });

    // Route to appropriate strategy
    if (photo.source === 'pexels' || !photo.source) {
        return calculatePexelsOptimalURL(photo, viewportWidth, viewportHeight, qualityMode);
    } else if (photo.source === 'flickr') {
        return calculateFlickrOptimalURL(photo, viewportWidth, viewportHeight, qualityMode);
    }

    // Fallback
    console.warn('⚠️ Unknown photo source, using fallback');
    return photo.src?.large2x || photo.url_b || photo.src?.original;
}
