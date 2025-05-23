/**
 * Axios API Client Instances
 * 
 * Configures and exports axios instances for different API endpoints.
 * 
 * @module services/api/axios
 */

import axios from 'axios';

/**
 * Axios instance for the external PoetryDB API
 * 
 * @constant
 * @type {import('axios').AxiosInstance}
 */
export const poetryDbApi = axios.create({
    baseURL: 'https://poetrydb.org',
    timeout: 5000
    // Additional headers or interceptors for PoetryDB
});

/**
 * Example: Axios instance for Supabase API
 * Note: Often the Supabase client is more appropriate than a custom REST endpoint
 * 
 * @constant
 * @type {import('axios').AxiosInstance}
 */
// export const supabaseApi = axios.create({
//     baseURL: 'YOUR_SUPABASE_URL',
//     timeout: 10000,
//     headers: {
//         'apikey': 'YOUR_SUPABASE_ANON_KEY',
//         'Authorization': `Bearer YOUR_SUPABASE_ANON_KEY`
//     }
// });

// Additional API instances can be added here
// export const anotherApi = axios.create({...});