/**
 * Canvas Storage Service
 *
 * Handles CRUD operations for canvas designs in Supabase.
 * Manages poem storage and design_settings JSONB data.
 */

import {supabase} from '../supabase/supabase';
import {serializeCanvasState} from './canvasStateSerializer';

/**
 * Save or update a canvas design
 * @param {string} userId - User ID from auth
 * @param {Object} poemData - Poem data (title, author, lines)
 * @param {Object} canvasState - Canvas state from useCanvasState
 * @param {string} title - Optional design title
 * @param {string} designId - Optional design ID for updates
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function saveDesign(userId, poemData, canvasState, title = null, designId = null) {
    try {
        console.log('💾 Saving canvas design...', {userId, title, designId});

        // Step 1: Ensure poem exists in database
        const poemId = await ensurePoemExists(poemData, userId);

        // Step 2: Serialize canvas state
        const designSettings = serializeCanvasState(canvasState, poemData);

        // Step 3: Prepare design data
        const designData = {
            user_id: userId,
            poem_id: poemId,
            title: title || poemData.title || 'Untitled Design',
            background_url: canvasState.backgroundImage?.url || null,
            thumbnail_url: canvasState.backgroundImage?.thumbnail || null,
            design_settings: designSettings,
            updated_at: new Date().toISOString()
        };

        let result;

        if (designId) {
            // Update existing design
            const {data, error} = await supabase
                .from('canvas_design')
                .update(designData)
                .eq('id', designId)
                .eq('user_id', userId) // Security: only update own designs
                .select()
                .single();

            if (error) throw error;
            result = data;
            console.log('✅ Design updated:', designId);
        } else {
            // Create new design
            designData.created_at = new Date().toISOString();

            const {data, error} = await supabase
                .from('canvas_design')
                .insert(designData)
                .select()
                .single();

            if (error) throw error;
            result = data;
            console.log('✅ Design created:', result.id);
        }

        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error('❌ Failed to save design:', error);
        return {
            success: false,
            error: error.message || 'Failed to save design'
        };
    }
}

/**
 * Ensure poem exists in database, create if needed
 * @param {Object} poemData - Poem data (title, author, lines)
 * @param {string} userId - User ID
 * @returns {Promise<string>} Poem ID
 */
async function ensurePoemExists(poemData, userId) {
    try {
        // Check if poem already exists (by title + author)
        const {data: existingPoem, error: searchError} = await supabase
            .from('poem')
            .select('id')
            .eq('title', poemData.title)
            .eq('author', poemData.author)
            .maybeSingle();

        if (searchError && searchError.code !== 'PGRST116') {
            throw searchError;
        }

        if (existingPoem) {
            console.log('📖 Using existing poem:', existingPoem.id);
            return existingPoem.id;
        }

        // Create new poem
        const poemContent = Array.isArray(poemData.lines)
            ? poemData.lines.join('\n')
            : poemData.content || '';

        const {data: newPoem, error: insertError} = await supabase
            .from('poem')
            .insert({
                title: poemData.title,
                author: poemData.author,
                content: poemContent,
                user_id: userId,
                language: 'nl',
                source: poemData.source || 'user_canvas',
                is_public: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) throw insertError;

        console.log('📖 Created new poem:', newPoem.id);
        return newPoem.id;

    } catch (error) {
        console.error('❌ Failed to ensure poem exists:', error);
        throw new Error('Failed to save poem data');
    }
}

/**
 * Load a canvas design by ID
 * @param {string} designId - Design ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function loadDesign(designId, userId = null) {
    try {
        console.log('📂 Loading design:', designId);

        let query = supabase
            .from('canvas_design')
            .select(`
                *,
                poem:poem!canvas_designs_poem_id_fkey (
                    id,
                    title,
                    author,
                    content
                )
            `)
            .eq('id', designId);

        // If userId provided, check ownership
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const {data, error} = await query.single();

        if (error) {
            if (error.code === 'PGRST116') {
                return {
                    success: false,
                    error: 'Design not found or access denied'
                };
            }
            throw error;
        }

        console.log('✅ Design loaded:', data.title);

        return {
            success: true,
            data: {
                ...data,
                poem: {
                    ...data.poem,
                    lines: data.poem.content.split('\n')
                }
            }
        };

    } catch (error) {
        console.error('❌ Failed to load design:', error);
        return {
            success: false,
            error: error.message || 'Failed to load design'
        };
    }
}

/**
 * List all designs for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Promise<{success: boolean, data?: Array, count?: number, error?: string}>}
 */
export async function listUserDesigns(userId, options = {}) {
    try {
        const {
            limit = 20,
            offset = 0,
            orderBy = 'updated_at',
            ascending = false
        } = options;

        console.log('📋 Listing designs for user:', userId);

        // Debug: Check current auth user
        const {data: {user: authUser}} = await supabase.auth.getUser();
        console.log('🔐 Current auth user:', authUser?.id);

        let query = supabase
            .from('canvas_design')
            .select(`
                id,
                title,
                thumbnail_url,
                background_url,
                created_at,
                updated_at,
                is_public,
                poem:poem!canvas_designs_poem_id_fkey (
                    title,
                    author
                )
            `, {count: 'exact'})
            .eq('user_id', userId)
            .order(orderBy, {ascending})
            .range(offset, offset + limit - 1);

        const {data, error, count} = await query;

        if (error) {
            console.error('❌ Supabase query error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log(`✅ Found ${count} designs`, data);

        return {
            success: true,
            data: data || [],
            count: count || 0
        };

    } catch (error) {
        console.error('❌ Failed to list designs:', error);
        return {
            success: false,
            error: error.message || 'Failed to list designs',
            data: [],
            count: 0
        };
    }
}

/**
 * Delete a canvas design
 * @param {string} designId - Design ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteDesign(designId, userId) {
    try {
        console.log('🗑️ Deleting design:', designId);

        const {error} = await supabase
            .from('canvas_design')
            .delete()
            .eq('id', designId)
            .eq('user_id', userId); // Security: only delete own designs

        if (error) throw error;

        console.log('✅ Design deleted');

        return {success: true};

    } catch (error) {
        console.error('❌ Failed to delete design:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete design'
        };
    }
}

/**
 * Update design metadata (title, is_public, etc.)
 * @param {string} designId - Design ID
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updateDesignMetadata(designId, userId, updates) {
    try {
        console.log('📝 Updating design metadata:', designId);

        // Only allow specific fields to be updated
        const allowedFields = ['title', 'is_public', 'thumbnail_url'];
        const sanitizedUpdates = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        }

        sanitizedUpdates.updated_at = new Date().toISOString();

        const {data, error} = await supabase
            .from('canvas_design')
            .update(sanitizedUpdates)
            .eq('id', designId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Metadata updated');

        return {
            success: true,
            data
        };

    } catch (error) {
        console.error('❌ Failed to update metadata:', error);
        return {
            success: false,
            error: error.message || 'Failed to update design metadata'
        };
    }
}

/**
 * Duplicate a design
 * @param {string} designId - Design ID to duplicate
 * @param {string} userId - User ID
 * @param {string} newTitle - Title for the duplicate
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function duplicateDesign(designId, userId, newTitle = null) {
    try {
        console.log('📋 Duplicating design:', designId);

        // Load original design
        const {data: original, error: loadError} = await supabase
            .from('canvas_design')
            .select('*')
            .eq('id', designId)
            .eq('user_id', userId)
            .single();

        if (loadError) throw loadError;

        // Create duplicate
        const duplicate = {
            user_id: userId,
            poem_id: original.poem_id,
            title: newTitle || `${original.title} (copy)`,
            background_url: original.background_url,
            thumbnail_url: original.thumbnail_url,
            design_settings: original.design_settings,
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const {data, error} = await supabase
            .from('canvas_design')
            .insert(duplicate)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Design duplicated:', data.id);

        return {
            success: true,
            data
        };

    } catch (error) {
        console.error('❌ Failed to duplicate design:', error);
        return {
            success: false,
            error: error.message || 'Failed to duplicate design'
        };
    }
}

// UNUSED
// /**
//  * Check if user has access to a design
//  * @param {string} designId - Design ID
//  * @param {string} userId - User ID
//  * @returns {Promise<boolean>}
//  */
// async function hasDesignAccess(designId, userId) {
//     try {
//         const {data, error} = await supabase
//             .from('canvas_design')
//             .select('id, user_id, is_public')
//             .eq('id', designId)
//             .single();
//
//         if (error) return false;
//
//         // User has access if they own it or it's public
//         return data.user_id === userId || data.is_public;
//
//     } catch (error) {
//         console.error('Failed to check design access:', error);
//         return false;
//     }
// }
