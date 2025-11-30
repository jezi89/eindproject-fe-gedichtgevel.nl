import { supabase } from '../supabase/supabase';

/**
 * Uploads a base64 image to Supabase Storage
 * @param {string} dataUrl - The base64 data URL of the image
 * @param {string} format - 'png' or 'jpeg' (default: 'jpeg')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadSharedImage = async (dataUrl, format = 'jpeg') => {
    try {
        // Enforce JPEG if requested or default
        const isJpeg = format === 'jpeg' || format === 'jpg';
        const contentType = isJpeg ? 'image/jpeg' : 'image/png';
        const fileExt = isJpeg ? 'jpg' : 'png';

        // Convert base64 to Blob
        const base64Data = dataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 10);
        const fileName = `share_${timestamp}_${randomId}.${fileExt}`;
        const filePath = `public/${fileName}`;

        // Upload to 'shared-poems' bucket
        const { data, error } = await supabase.storage
            .from('shared-poems')
            .upload(filePath, blob, {
                contentType: contentType,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('shared-poems')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error('Share upload failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Shares a URL via Web Share API or returns it
 * @param {string} url - The URL to share
 * @param {object} options - Title and text
 * @returns {Promise<boolean>} - True if shared via API, False if not supported (caller should show copy/social buttons)
 */
export const shareToSocialMedia = async (url, { title = 'Mijn Gedicht', text = 'Bekijk dit gedicht!' } = {}) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text,
                url
            });
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Web Share API error:', error);
            }
            return false;
        }
    }
    return false;
};

/**
 * Opens a social media share dialog
 * @param {string} platform - 'twitter', 'facebook', 'whatsapp'
 * @param {string} url - URL to share
 * @param {string} text - Optional text
 */
export const openShareDialog = (platform, url, text = '') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    let shareUrl = '';

    switch (platform) {
        case 'twitter':
        case 'x':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            break;
        case 'linkedin':
             shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
             break;
        default:
            return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
};
