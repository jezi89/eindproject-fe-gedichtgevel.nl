import { useQuery } from '@tanstack/react-query';
import { flickrApiService } from '../../services/api/apiService';

/**
 * Normalize Flickr photo object to ensure metadata and variant dimensions are preserved
 *
 * CRITICAL: Uses variant-specific dimensions (post-EXIF rotation) as primary source
 * to fix portrait/landscape detection issues with EXIF-rotated photos.
 */
function normalizeFlickrPhoto(photo) {
    // STRATEGY: Use variant-specific dimensions (post-EXIF rotation)
    // Fallback hierarchy: largest available → medium → o_dims → defaults
    let effectiveWidth = null;
    let effectiveHeight = null;

    // Try largest available variant first (most reliable for orientation)
    if (photo.width_o && photo.height_o) {
        effectiveWidth = photo.width_o;
        effectiveHeight = photo.height_o;
    } else if (photo.width_k && photo.height_k) {
        effectiveWidth = photo.width_k;
        effectiveHeight = photo.height_k;
    } else if (photo.width_h && photo.height_h) {
        effectiveWidth = photo.width_h;
        effectiveHeight = photo.height_h;
    } else if (photo.width_b && photo.height_b) {
        effectiveWidth = photo.width_b;
        effectiveHeight = photo.height_b;
    } else if (photo.o_dims) {
        // Fallback to o_dims (may have EXIF rotation issues)
        const [w, h] = photo.o_dims.split('x').map(Number);
        effectiveWidth = w;
        effectiveHeight = h;
    }

    // Debug logging for EXIF rotation detection
    if (photo.o_dims) {
        const [oWidth, oHeight] = photo.o_dims.split('x').map(Number);
        const orientationChanged = (effectiveWidth && effectiveHeight) &&
            ((oWidth > oHeight) !== (effectiveWidth > effectiveHeight));

        if (orientationChanged) {
            console.log('🔄 Flickr EXIF rotation detected:', {
                id: photo.id,
                o_dims: photo.o_dims,
                effective: `${effectiveWidth}×${effectiveHeight}`,
                orientationFlipped: true
            });
        }
    }

    return {
        id: photo.id,
        alt: photo.title || 'Flickr photo',
        photographer: photo.ownername || photo.owner_name || 'Unknown',  // Map ownername
        datetaken: photo.datetaken || null,  // Preserve date

        // PRIMARY: Use variant dimensions (post-EXIF rotation)
        width: effectiveWidth || 1024,
        height: effectiveHeight || 768,

        source: 'flickr',

        // URL variants (preview + selection)
        url_q: photo.url_q || null,  // 150px square
        url_n: photo.url_n || null,  // 320px
        url_m: photo.url_m || null,  // 500px
        url_b: photo.url_b || `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`,
        url_h: photo.url_h || null,  // 1600px
        url_k: photo.url_k || null,  // 2048px
        url_o: photo.url_o || null,  // Original

        // Keep variant dimensions for reference
        width_b: photo.width_b || null,
        height_b: photo.height_b || null,
        width_h: photo.width_h || null,
        height_h: photo.height_h || null,
        width_k: photo.width_k || null,
        height_k: photo.height_k || null,
        width_o: photo.width_o || null,
        height_o: photo.height_o || null,

        // Fallback for Pexels compatibility
        src: {
            tiny: photo.url_q || photo.url_n || `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`,
            small: photo.url_m,
            medium: photo.url_b,
            large: photo.url_h,
            large2x: photo.url_k,
            original: photo.url_o
        }
    };
}

export function useFlickrSearchByGeo(searchParams, page = 1) {
    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ['flickr', 'geo', searchParams, page],
        queryFn: () => flickrApiService.searchByGeo(searchParams, page),
        enabled: !!searchParams,
    });

    return {
        photos: data?.photos?.photo
            .filter(p => p.secret && p.server !== '0')
            .map(normalizeFlickrPhoto) || [],
        totalPages: data?.photos?.pages || 0,
        isLoading,
        isError,
        error,
        isFetching,
    };
}
