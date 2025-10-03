/**
 * User Statistics Service
 *
 * Calculates and retrieves user activity statistics
 * Provides aggregated data for the statistics dashboard
 *
 * @module services/stats/userStatsService
 */

// Helper for consistent error handling
const handleError = (operation, error) => {
    console.error(`${operation} error:`, error);
    return {success: false, error: error.message};
};

// Helper for successful responses
const handleSuccess = (data = null) => {
    return {success: true, ...(data && {data})};
};

// UNUSED - Temporary stub export to prevent import errors
// Returns silent success responses with empty data to prevent error messages in UI
export const userStatsService = {
    getUserStats: async () => ({
        success: true,
        data: {
            totalFavorites: 0,
            totalFavoriteAuthors: 0,
            topAuthors: [],
            recentActivity: []
        }
    }),
    getMonthlyActivity: async () => ({
        success: true,
        data: [] // Empty array = no activity yet
    }),
    getFavoriteThemes: async () => ({
        success: true,
        data: [] // Empty array = no themes yet
    })
};

//
// UNUSED
// /**
//  * Get comprehensive user statistics
//  * @param {string} userId - User ID
//  * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
//  */
// const getUserStats = async (userId) => {
//     try {
//         // Get counts in parallel for better performance
//         const [
//             favoritePoemsResult,
//             favoriteAuthorsResult
//         ] = await Promise.all([
//             supabase
//                 .from('user_favorite_poems')
//                 .select('id', {count: 'exact', head: true})
//                 .eq('user_id', userId),
//             supabase
//                 .from('user_favorite_authors')
//                 .select('id', {count: 'exact', head: true})
//                 .eq('user_id', userId)
//         ]);
//
//         // Get most favorited authors (top 5)
//         const {data: topAuthors} = await supabase
//             .from('user_favorite_poems')
//             .select('poem_author')
//             .eq('user_id', userId);
//
//         // Calculate author frequency
//         const authorCounts = {};
//         topAuthors?.forEach(({poem_author}) => {
//             if (poem_author && poem_author !== 'Onbekend') {
//                 authorCounts[poem_author] = (authorCounts[poem_author] || 0) + 1;
//             }
//         });
//
//         const topAuthorsList = Object.entries(authorCounts)
//             .sort(([, a], [, b]) => b - a)
//             .slice(0, 5)
//             .map(([author, count]) => ({author, count}));
//
//         // Get recent activity (last 30 days)
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//
//         const {data: recentActivity} = await supabase
//             .from('user_favorite_poems')
//             .select('created_at')
//             .eq('user_id', userId)
//             .gte('created_at', thirtyDaysAgo.toISOString());
//
//         // Aggregate by week
//         const weeklyActivity = {};
//         recentActivity?.forEach(({created_at}) => {
//             const date = new Date(created_at);
//             const weekStart = new Date(date);
//             weekStart.setDate(date.getDate() - date.getDay()); // Start of week
//             const weekKey = weekStart.toISOString().split('T')[0];
//             weeklyActivity[weekKey] = (weeklyActivity[weekKey] || 0) + 1;
//         });
//
//         const activityData = Object.entries(weeklyActivity)
//             .map(([week, count]) => ({week, count}))
//             .sort((a, b) => new Date(a.week) - new Date(b.week));
//
//         const stats = {
//             totalFavoritePoems: favoritePoemsResult.count || 0,
//             totalFavoriteAuthors: favoriteAuthorsResult.count || 0,
//             topAuthors: topAuthorsList,
//             recentActivity: activityData,
//             lastActivityDate: recentActivity?.[0]?.created_at || null
//         };
//
//         return handleSuccess(stats);
//     } catch (error) {
//         return handleError('Get user stats', error);
//     }
// };

// UNUSED
// /**
//  * Get daily activity breakdown
//  * @param {string} userId - User ID
//  * @param {number} months - Number of months to look back (default: 6)
//  * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
//  */
// export const getMonthlyActivity = async (userId, months = 6) => {
//     try {
//         const startDate = new Date();
//         startDate.setMonth(startDate.getMonth() - months);
//
//         const {data: favorites, error} = await supabase
//             .from('user_favorite_poems')
//             .select('created_at')
//             .eq('user_id', userId)
//             .gte('created_at', startDate.toISOString());
//
//         if (error) throw error;
//
//         // Group by month
//         const dailyData = {};
//         favorites?.forEach(({created_at}) => {
//             const date = new Date(created_at);
//             const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//             dailyData[monthKey] = (dailyData[monthKey] || 0) + 1;
//         });
//
//         // Fill in missing months with 0
//         const result = [];
//         for (let i = 0; i < months; i++) {
//             const date = new Date();
//             date.setMonth(date.getMonth() - i);
//             const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//             result.unshift({
//                 month: monthKey,
//                 count: dailyData[monthKey] || 0
//             });
//         }
//
//         return handleSuccess(result);
//     } catch (error) {
//         return handleError('Get daily activity', error);
//     }
// };

// UNUSED
// /**
//  * Get user's favorite genres/themes (based on poem content analysis)
//  * Note: This is a placeholder - actual implementation would require
//  * more sophisticated text analysis or pre-tagged poems
//  * @param {string} userId - User ID
//  * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
//  */
// export const getFavoriteThemes = async (userId) => {
//     try {
//         // This is a simplified version
//         // In production, you'd want to have a themes/tags table
//         const {data: poems} = await supabase
//             .from('user_favorite_poems')
//             .select('poem_title, poem_lines')
//             .eq('user_id', userId);
//
//         // Simple keyword-based theme detection
//         const themes = {
//             'Liefde': 0,
//             'Natuur': 0,
//             'Tijd': 0,
//             'Droom': 0
//         };
//
//         const keywords = {
//             'Liefde': ['liefde', 'hart', 'kus', 'geliefde', 'verliefd'],
//             'Natuur': ['wind', 'bloem', 'boom', 'zon', 'maan', 'ster'],
//             'Tijd': ['tijd', 'jaar', 'dag', 'nacht', 'eeuwig'],
//             'Droom': ['droom', 'dromen', 'slaap', 'nacht']
//         };
//
//         poems?.forEach(({poem_lines}) => {
//             const text = poem_lines?.join(' ').toLowerCase() || '';
//             Object.entries(keywords).forEach(([theme, words]) => {
//                 words.forEach(word => {
//                     if (text.includes(word)) {
//                         themes[theme]++;
//                     }
//                 });
//             });
//         });
//
//         const themeData = Object.entries(themes)
//             .map(([theme, count]) => ({theme, count}))
//             .filter(({count}) => count > 0)
//             .sort((a, b) => b.count - a.count);
//
//         return handleSuccess(themeData);
//     } catch (error) {
//         return handleError('Get favorite themes', error);
//     }
// };

