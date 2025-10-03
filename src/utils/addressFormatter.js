/**
 * Address Formatting Utilities
 *
 * Utilities for formatting street poetry addresses and generating Google Maps links
 */

/**
 * Format address for display - remove postcodes where possible
 * @param {string} address - Raw address string
 * @returns {string} Formatted address without postcodes
 */
export function formatAddressForDisplay(address) {
    if (!address || typeof address !== 'string') return '';

    // Remove Dutch postcodes (1234 AB format)
    let formatted = address.replace(/\b\d{4}\s*[A-Z]{2}\b/gi, '');

    // Remove Belgian postcodes (4 digits at word boundaries)
    formatted = formatted.replace(/\b\d{4}\b/g, '');

    // Clean up extra commas and spaces
    formatted = formatted
        .replace(/,\s*,/g, ',')      // double commas
        .replace(/^\s*,\s*/, '')      // leading comma
        .replace(/\s*,\s*$/, '')      // trailing comma
        .replace(/\s+/g, ' ')         // multiple spaces
        .trim();

    return formatted;
}

/**
 * Generate Google Maps URL for location
 * Priority: coordinates > full address > null
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} address - Full address as fallback
 * @returns {string|null} Google Maps URL or null
 */
export function generateMapsUrl(lat, lon, address) {
    const baseUrl = 'https://www.google.com/maps/search/?api=1&query=';

    // Best option: Use coordinates (most accurate)
    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
        return `${baseUrl}${lat},${lon}`;
    }

    // Fallback: Use full address string
    if (address && address.trim()) {
        const encoded = encodeURIComponent(address);
        return `${baseUrl}${encoded}`;
    }

    return null;
}
