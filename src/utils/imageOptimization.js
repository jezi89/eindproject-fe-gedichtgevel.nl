/**
 * Smart Image Fetching Utility
 *
 * Calculates optimal image URLs based on viewport dimensions and device pixel ratio
 * to minimize bandwidth while maintaining quality.
 *
 * Strategies:
 * - Pexels: Use dynamic URL parameters (?w= or ?h=) based on aspect ratio
 * - Flickr: Select best-fit URL from available sizes (_b, _h, _k, _o)
 */

/**
 * Calculate optimal Pexels image URL
 * @param {Object} photo - Photo object with width, height, and src.original
 * @param {number} requiredWidth - Required width (viewport × DPR)
 * @param {number} requiredHeight - Required height (viewport × DPR)
 * @returns {string} Optimized Pexels URL
 */
function calculatePexelsOptimalURL(photo, requiredWidth, requiredHeight) {
    const photoAspect = photo.width / photo.height;
    const viewportAspect = requiredWidth / requiredHeight;

    let url = photo.src.original;

    // Determine limiting dimension based on aspect ratios
    if (photoAspect > viewportAspect) {
        // Photo is wider than viewport - height is limiting factor
        // Request height, Pexels auto-crops width
        url = `${url}?auto=compress&h=${requiredHeight}`;
        console.log(`📐 Pexels: Height-constrained (${requiredHeight}px)`);
    } else {
        // Photo is taller/same - width is limiting factor
        // Request width, Pexels auto-crops height
        url = `${url}?auto=compress&w=${requiredWidth}`;
        console.log(`📐 Pexels: Width-constrained (${requiredWidth}px)`);
    }

    return url;
}

/**
 * Calculate optimal Flickr image URL from available sizes
 * @param {Object} photo - Photo object with available URLs
 * @param {number} requiredWidth - Required width (viewport × DPR)
 * @param {number} requiredHeight - Required height (viewport × DPR)
 * @returns {string} Best-fit Flickr URL
 */
function calculateFlickrOptimalURL(photo, requiredWidth, requiredHeight) {
    // Flickr size options (from smallest to largest)
    const sizes = [
        { key: 'url_b', width: 1024, label: '_b (1024px)' },
        { key: 'url_h', width: 1600, label: '_h (1600px)' },
        { key: 'url_k', width: 2048, label: '_k (2048px)' },
        { key: 'url_o', width: photo.width || 4000, label: '_o (original)' }
    ];

    // Find smallest size that fits requirements
    const requiredSize = Math.max(requiredWidth, requiredHeight);

    for (const size of sizes) {
        if (photo[size.key] && size.width >= requiredSize) {
            console.log(`📐 Flickr: Selected ${size.label} for ${requiredSize}px requirement`);
            return photo[size.key];
        }
    }

    // Fallback to largest available (original or url_k)
    const fallback = photo.url_o || photo.url_k || photo.url_h || photo.url_b || photo.src?.large2x;
    console.log(`📐 Flickr: Using fallback (largest available)`);
    return fallback;
}

/**
 * Calculate optimal image request based on viewport and device capabilities
 * @param {Object} photo - Photo object from API
 * @param {number} [windowWidth] - Window width (defaults to window.innerWidth)
 * @param {number} [windowHeight] - Window height (defaults to window.innerHeight)
 * @returns {string} Optimized image URL
 */
export function calculateOptimalImageRequest(
    photo,
    windowWidth = window.innerWidth,
    windowHeight = window.innerHeight
) {
    const dpr = window.devicePixelRatio || 1;

    // Calculate required dimensions for viewport (with DPR for retina)
    const requiredWidth = Math.round(windowWidth * dpr);
    const requiredHeight = Math.round(windowHeight * dpr);

    console.log(`📊 Smart Image Request:`, {
        viewport: `${windowWidth}×${windowHeight}`,
        dpr,
        required: `${requiredWidth}×${requiredHeight}`,
        original: `${photo.width}×${photo.height}`,
        source: photo.source
    });

    // Route to appropriate strategy
    if (photo.source === 'pexels' || !photo.source) {
        return calculatePexelsOptimalURL(photo, requiredWidth, requiredHeight);
    } else if (photo.source === 'flickr') {
        return calculateFlickrOptimalURL(photo, requiredWidth, requiredHeight);
    }

    // Fallback: use large2x
    console.warn('⚠️ Unknown photo source, using large2x fallback');
    return photo.src?.large2x || photo.url_b || photo.src?.original;
}
