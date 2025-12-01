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
