/**
 * Share Service - Upload exports to Supabase storage for sharing
 *
 * Uploads poem canvas exports to a public bucket for social media sharing.
 * Returns shareable URLs that can be used for OG meta tags.
 *
 * @module services/share/shareService
 */

import { supabase } from '../supabase/supabase.js';

// Storage bucket name for shared images
const SHARE_BUCKET = 'shared-poems';

/**
 * Convert base64 data URL to Blob for upload
 * @param {string} dataUrl - Base64 data URL (e.g., data:image/png;base64,...)
 * @returns {Blob} File blob
 */
function dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * Generate unique filename for shared image
 * @param {string} format - Image format (png or jpg)
 * @returns {string} Unique filename
 */
function generateShareFilename(format = 'png') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `gedicht-${timestamp}-${randomId}.${format}`;
}

/**
 * Upload exported image to Supabase storage
 *
 * @param {string} dataUrl - Base64 data URL of the exported image
 * @param {string} format - Image format ('png' or 'jpg')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadSharedImage(dataUrl, format = 'png') {
    try {
        console.log('📤 Uploading shared image to Supabase storage...');

        // Convert data URL to blob
        const blob = dataUrlToBlob(dataUrl);
        const filename = generateShareFilename(format);
        const filePath = `public/${filename}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from(SHARE_BUCKET)
            .upload(filePath, blob, {
                contentType: format === 'jpg' ? 'image/jpeg' : 'image/png',
                cacheControl: '3600', // Cache for 1 hour
                upsert: false
            });

        if (error) {
            console.error('❌ Upload failed:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(SHARE_BUCKET)
            .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;

        console.log('✅ Upload successful:', publicUrl);

        return {
            success: true,
            url: publicUrl,
            filename: filename,
            path: filePath
        };

    } catch (error) {
        console.error('❌ Share upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Share to social media platforms
 *
 * @param {string} imageUrl - Public URL of the shared image
 * @param {Object} options - Share options
 * @param {string} options.title - Share title
 * @param {string} options.text - Share description
 * @returns {Promise<boolean>} Success status
 */
export async function shareToSocialMedia(imageUrl, options = {}) {
    const {
        title = 'Mijn Gedicht op Gedichtgevel.nl',
        text = 'Bekijk mijn visualisatie op Gedichtgevel.nl!'
    } = options;

    // Use Web Share API if available (mobile)
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url: imageUrl
            });
            console.log('✅ Shared via Web Share API');
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
            }
            return false;
        }
    }

    // Fallback: Copy URL to clipboard
    try {
        await navigator.clipboard.writeText(imageUrl);
        console.log('📋 URL copied to clipboard');
        return true;
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
    }
}

/**
 * Open share dialog for specific platform
 *
 * @param {string} platform - Platform name ('twitter', 'facebook', 'linkedin', 'whatsapp')
 * @param {string} imageUrl - Public URL of the shared image
 * @param {string} text - Share text
 */
export function openShareDialog(platform, imageUrl, text = 'Bekijk mijn gedicht!') {
    const encodedUrl = encodeURIComponent(imageUrl);
    const encodedText = encodeURIComponent(text);

    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`
    };

    const url = shareUrls[platform];
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
    }
}

/**
 * Delete shared image from storage (cleanup)
 *
 * @param {string} filePath - Path in storage bucket
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSharedImage(filePath) {
    try {
        const { error } = await supabase.storage
            .from(SHARE_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('Delete failed:', error);
            return false;
        }

        console.log('🗑️ Shared image deleted:', filePath);
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
}
