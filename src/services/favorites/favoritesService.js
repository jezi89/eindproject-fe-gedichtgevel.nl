// UNUSED - Temporary stub export to prevent import errors
// Returns silent success responses to prevent error messages in UI
export const favoritesService = {
    addFavoritePoem: async () => ({
        success: true,
        data: { message: 'Favourites feature coming soon!' }
    }),
    removeFavoritePoem: async () => ({
        success: true,
        data: { message: 'Favourites feature coming soon!' }
    }),
    getFavoritePoems: async () => ({
        success: true,
        data: [] // Empty array = no favourites yet
    }),
    checkPoemFavorited: async () => ({
        success: true,
        isFavorited: false
    }),
    addFavoriteAuthor: async () => ({
        success: true,
        data: { message: 'Favourites feature coming soon!' }
    }),
    removeFavoriteAuthor: async () => ({
        success: true,
        data: { message: 'Favourites feature coming soon!' }
    }),
    getFavoriteAuthors: async () => ({
        success: true,
        data: [] // Empty array = no favourites yet
    }),
    checkAuthorFavorited: async () => ({
        success: true,
        isFavorited: false
    })
};

//
// /**
//  * Favorites Service
//  *
//  * Handles all Supabase operations for user favorites (poems and authors)
//  * Provides functions to add, remove, and retrieve favorite items
//  *
//  * @module services/favorites/favoritesService
//  */
//
// import {supabase} from '../supabase/supabase';
//
// // Helper for consistent error handling
// export const handleError = (operation, error) => {
//     console.error(`${operation} error:`, error);
//     return {success: false, error: error.message};
// };
//
// // Helper for successful responses
// export const handleSuccess = (data = null) => {
//     return {success: true, ...(data && {data})};
// };
//
// /**
//  * Add a poem to user's favorites
//  * @param {string} userId - User ID
//  * @param {Object} poem - Poem object with title, author, lines
//  * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
//  */
// export const addFavoritePoem = async (userId, poem) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_poems')
//             .insert({
//                 user_id: userId,
//                 poem_title: poem.title,
//                 poem_author: poem.author || 'Onbekend',
//                 poem_lines: poem.lines
//             })
//             .select()
//             .single();
//
//         if (error) {
//             // Handle duplicate entry gracefully
//             if (error.code === '23505') {
//                 return handleError('Add favorite poem', new Error('Dit gedicht staat al in je favorieten'));
//             }
//             throw error;
//         }
//
//         return handleSuccess(data);
//     } catch (error) {
//         return handleError('Add favorite poem', error);
//     }
// };
//
// /**
//  * Remove a poem from user's favorites
//  * @param {string} userId - User ID
//  * @param {string} poemId - Favorite poem ID
//  * @returns {Promise<{success: boolean, error?: string}>}
//  */
// export const removeFavoritePoem = async (userId, poemId) => {
//     try {
//         const {error} = await supabase
//             .from('user_favorite_poems')
//             .delete()
//             .eq('id', poemId)
//             .eq('user_id', userId);
//
//         if (error) throw error;
//
//         return handleSuccess();
//     } catch (error) {
//         return handleError('Remove favorite poem', error);
//     }
// };
//
// /**
//  * Get all favorite poems for a user
//  * @param {string} userId - User ID
//  * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
//  */
// export const getFavoritePoems = async (userId) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_poems')
//             .select('*')
//             .eq('user_id', userId)
//             .order('created_at', {ascending: false});
//
//         if (error) throw error;
//
//         return handleSuccess(data || []);
//     } catch (error) {
//         return handleError('Get favorite poems', error);
//     }
// };
//
// /**
//  * Check if a poem is favorited
//  * @param {string} userId - User ID
//  * @param {string} poemTitle - Poem title
//  * @param {string} poemAuthor - Poem author
//  * @returns {Promise<{isFavorited: boolean, favoriteId?: string, error?: string}>}
//  */
// export const checkPoemFavorited = async (userId, poemTitle, poemAuthor) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_poems')
//             .select('id')
//             .eq('user_id', userId)
//             .eq('poem_title', poemTitle)
//             .eq('poem_author', poemAuthor || 'Onbekend')
//             .single();
//
//         if (error && error.code !== 'PGRST116') {
//             throw error;
//         }
//
//         return {
//             isFavorited: !!data,
//             favoriteId: data?.id
//         };
//     } catch (error) {
//         return {
//             isFavorited: false,
//             error: error.message
//         };
//     }
// };
//
// /**
//  * Add an author to user's favorites
//  * @param {string} userId - User ID
//  * @param {string} authorName - Author name
//  * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
//  */
// export const addFavoriteAuthor = async (userId, authorName) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_authors')
//             .insert({
//                 user_id: userId,
//                 author_name: authorName
//             })
//             .select()
//             .single();
//
//         if (error) {
//             // Handle duplicate entry gracefully
//             if (error.code === '23505') {
//                 return handleError('Add favorite author', new Error('Deze dichter staat al in je favorieten'));
//             }
//             throw error;
//         }
//
//         return handleSuccess(data);
//     } catch (error) {
//         return handleError('Add favorite author', error);
//     }
// };
//
// /**
//  * Remove an author from user's favorites
//  * @param {string} userId - User ID
//  * @param {string} authorId - Favorite author ID
//  * @returns {Promise<{success: boolean, error?: string}>}
//  */
// export const removeFavoriteAuthor = async (userId, authorId) => {
//     try {
//         const {error} = await supabase
//             .from('user_favorite_authors')
//             .delete()
//             .eq('id', authorId)
//             .eq('user_id', userId);
//
//         if (error) throw error;
//
//         return handleSuccess();
//     } catch (error) {
//         return handleError('Remove favorite author', error);
//     }
// };
//
// /**
//  * Get all favorite authors for a user
//  * @param {string} userId - User ID
//  * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
//  */
// export const getFavoriteAuthors = async (userId) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_authors')
//             .select('*')
//             .eq('user_id', userId)
//             .order('created_at', {ascending: false});
//
//         if (error) throw error;
//
//         return handleSuccess(data || []);
//     } catch (error) {
//         return handleError('Get favorite authors', error);
//     }
// };
//
// /**
//  * Check if an author is favorited
//  * @param {string} userId - User ID
//  * @param {string} authorName - Author name
//  * @returns {Promise<{isFavorited: boolean, favoriteId?: string, error?: string}>}
//  */
// export const checkAuthorFavorited = async (userId, authorName) => {
//     try {
//         const {data, error} = await supabase
//             .from('user_favorite_authors')
//             .select('id')
//             .eq('user_id', userId)
//             .eq('author_name', authorName)
//             .single();
//
//         if (error && error.code !== 'PGRST116') {
//             throw error;
//         }
//
//         return {
//             isFavorited: !!data,
//             favoriteId: data?.id
//         };
//     } catch (error) {
//         return {
//             isFavorited: false,
//             error: error.message
//         };
//     }
// };