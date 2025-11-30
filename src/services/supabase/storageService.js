/**
 * Service for handling file uploads to Supabase Storage
 *
 * @module services/supabase/storageService
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'shared-poem-designs';

/**
 * Uploads an image blob to the shared designs bucket
 *
 * @param {Blob} imageBlob - The image blob to upload (must be JPEG)
 * @param {string} fileName - The desired filename (e.g., 'design-uuid.jpg')
 * @returns {Promise<{path: string, publicUrl: string, error: object}>} Result object
 */
export const uploadCanvasImage = async (imageBlob, fileName) => {
    try {
        // 1. Upload the file
        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(fileName, imageBlob, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase Upload Error:', error);
            return { error };
        }

        // 2. Get the public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return {
            path: data.path,
            publicUrl,
            error: null
        };

    } catch (err) {
        console.error('❌ Unexpected Upload Error:', err);
        return { error: err };
    }
};
