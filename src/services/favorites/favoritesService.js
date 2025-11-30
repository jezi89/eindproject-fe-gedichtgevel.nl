/**
 * Favorites Service
 * Handles Supabase operations for user favorites (poems and authors)
 */

import {supabase} from '../supabase/supabase';

// Helper for consistent error handling
export const handleError = (operation, error) => {
    console.error(`${operation} error:`, error);
    return {success: false, error: error.message};
};

// Helper for successful responses
export const handleSuccess = (data = null) => {
    return {success: true, ...(data && {data})};
};

/**
 * Add a poem to user's favorites
 * @param {string} userId - User ID
 * @param {Object} poem - Poem object with title, author, lines
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const addFavoritePoem = async (userId, poem) => {
    try {
        // 1. Check if we already have a valid UUID (e.g. for Straatgedichten)
        let poemId = poem.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (poemId && uuidRegex.test(poemId)) {
            // Verify it exists to be safe (optional but good practice)
            const { data: exists } = await supabase
                .from('poem')
                .select('id, title, author, content, year, street, city, source, location_lat, location_lon')
                .eq('id', poemId)
                .maybeSingle();
            
            if (!exists) {
                poemId = null; // Invalid ID, fall back to lookup
            }
        } else {
            poemId = null;
        }

        if (!poemId) {
            // 2. Check if poem exists in 'poem' table by title/author
            const { data: existingPoem } = await supabase
                .from('poem')
                .select('id')
                .eq('title', poem.title)
                .eq('author', poem.author || 'Onbekend')
                .limit(1)
                .maybeSingle();

            if (existingPoem) {
                poemId = existingPoem.id;
            } else {
                // 3. Create poem if it doesn't exist
                const { data: newPoem, error: createError } = await supabase
                    .from('poem')
                    .insert({
                        title: poem.title,
                        author: poem.author || 'Onbekend',
                        content: Array.isArray(poem.lines) ? poem.lines.join('\n') : poem.lines || '',
                        lines_count: Array.isArray(poem.lines) ? poem.lines.length : (poem.lines || '').split('\n').length,
                        street: poem.street || null,
                        city: poem.city || null,
                        location_lat: poem.location_lat || null,
                        location_lon: poem.location_lon || null,
                        source: poem.source || null,
                        year: poem.year || null,
                        is_public: true // Ensure it's public
                    })
                    .select('id')
                    .single();
                
                if (createError) throw createError;
                poemId = newPoem.id;
            }
        }

        // 3. Add to favorites
        const { data, error } = await supabase
            .from('favorite')
            .insert({
                user_id: userId,
                item_id: poemId,
                item_type: 'poem'
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                 return handleError('Add favorite poem', new Error('Dit gedicht staat al in je favorieten'));
            }
            throw error;
        }

        return handleSuccess(data);
    } catch (error) {
        return handleError('Add favorite poem', error);
    }
};

/**
 * Remove a poem from user's favorites
 * @param {string} userId - User ID
 * @param {string} poemId - Favorite poem ID (this is the item_id in favorite table)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeFavoritePoem = async (userId, poemId) => {
    try {
        const {error} = await supabase
            .from('favorite')
            .delete()
            .eq('item_id', poemId)
            .eq('user_id', userId)
            .eq('item_type', 'poem');

        if (error) throw error;

        return handleSuccess();
    } catch (error) {
        return handleError('Remove favorite poem', error);
    }
};

/**
 * Get all favorite poems for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getFavoritePoems = async (userId) => {
    try {
        // 1. Get favorite IDs
        const {data: favorites, error: favError} = await supabase
            .from('favorite')
            .select('id, item_id, created_at')
            .eq('user_id', userId)
            .eq('item_type', 'poem')
            .order('created_at', {ascending: false});

        if (favError) throw favError;

        if (!favorites || favorites.length === 0) {
            return handleSuccess([]);
        }

        const poemIds = favorites.map(f => f.item_id);

        // 2. Get poems details
        const {data: poems, error: poemError} = await supabase
            .from('poem')
            .select('id, title, author, content, lines_count, year, street, city, address, source, location_lat, location_lon') // Added extra fields for metadata
            .in('id', poemIds);

        if (poemError) throw poemError;

        // 3. Merge data
        const result = favorites.map(fav => {
            const poem = poems.find(p => p.id === fav.item_id);
            if (!poem) return null;
            
            return {
                ...fav,
                poem: poem
            };
        }).filter(item => item !== null);
        
        return handleSuccess(result);
    } catch (error) {
        return handleError('Get favorite poems', error);
    }
};

/**
 * Check if a poem is favorited
 * @param {string} userId - User ID
 * @param {string} poemTitle - Poem title
 * @param {string} poemAuthor - Poem author
 * @returns {Promise<{isFavorited: boolean, favoriteId?: string, error?: string}>}
 */
export const checkPoemFavorited = async (userId, poemTitle, poemAuthor) => {
    try {
        // 1. Find poem ID
        const { data: poem, error: poemError } = await supabase
            .from('poem')
            .select('id')
            .eq('title', poemTitle)
            .eq('author', poemAuthor || 'Onbekend')
            .limit(1)
            .maybeSingle();

        if (poemError) throw poemError;
        if (!poem) return { isFavorited: false };

        // 2. Check favorite
        const { data: favorite, error: favError } = await supabase
            .from('favorite')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', poem.id)
            .eq('item_type', 'poem')
            .maybeSingle();

        if (favError) throw favError;

        return {
            isFavorited: !!favorite,
            favoriteId: favorite?.id
        };
    } catch (error) {
         return {
            isFavorited: false,
            error: error.message
        };
    }
};

/**
 * Add an author to user's favorites
 * @param {string} userId - User ID
 * @param {string} authorName - Author name
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const addFavoriteAuthor = async (userId, authorName) => {
    try {
        const {data, error} = await supabase
            .from('user_favorite_authors')
            .insert({
                user_id: userId,
                author_name: authorName
            })
            .select()
            .single();

        if (error) {
            // Handle duplicate entry gracefully
            if (error.code === '23505') {
                return handleError('Add favorite author', new Error('Deze dichter staat al in je favorieten'));
            }
            throw error;
        }

        return handleSuccess(data);
    } catch (error) {
        return handleError('Add favorite author', error);
    }
};

/**
 * Remove an author from user's favorites
 * @param {string} userId - User ID
 * @param {string} authorId - Favorite author ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeFavoriteAuthor = async (userId, authorId) => {
    try {
        const {error} = await supabase
            .from('user_favorite_authors')
            .delete()
            .eq('id', authorId)
            .eq('user_id', userId);

        if (error) throw error;

        return handleSuccess();
    } catch (error) {
        return handleError('Remove favorite author', error);
    }
};

/**
 * Get all favorite authors for a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getFavoriteAuthors = async (userId) => {
    try {
        const {data, error} = await supabase
            .from('user_favorite_authors')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', {ascending: false});

        if (error) throw error;

        return handleSuccess(data || []);
    } catch (error) {
        return handleError('Get favorite authors', error);
    }
};

/**
 * Check if an author is favorited
 * @param {string} userId - User ID
 * @param {string} authorName - Author name
 * @returns {Promise<{isFavorited: boolean, favoriteId?: string, error?: string}>}
 */
export const checkAuthorFavorited = async (userId, authorName) => {
    try {
        const {data, error} = await supabase
            .from('user_favorite_authors')
            .select('id')
            .eq('user_id', userId)
            .eq('author_name', authorName)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return {
            isFavorited: !!data,
            favoriteId: data?.id
        };
    } catch (error) {
        return {
            isFavorited: false,
            error: error.message
        };
    }
};

export const favoritesService = {
    addFavoritePoem,
    removeFavoritePoem,
    getFavoritePoems,
    checkPoemFavorited,
    addFavoriteAuthor,
    removeFavoriteAuthor,
    getFavoriteAuthors,
    checkAuthorFavorited
};
