import { pexelsApi, flickrApi } from './axios';
import { supabase } from '../supabase/supabase';

/**
 * Generic, reusable fetcher for all Axios calls.
 * @param {import('axios').AxiosInstance} apiClient - The Axios instance to use.
 * @param {object} config - The request configuration (url, params, etc.).
 * @returns {Promise<any>}
 */
const fetchWithAxios = async (apiClient, config) => {
    try {
        const response = await apiClient.request(config);
        return response.data;
    } catch (error) {
        // Throw a standardized error for TanStack Query to catch.
        throw new Error(error.response?.data?.message || error.message);
    }
};

// --- Pexels API Service ---
export const pexelsApiService = {
  search: (query, page = 1, orientation = "landscape") =>
    fetchWithAxios(pexelsApi, {
      url: "search",
      params: { query, per_page: 16, orientation, page },
    }),
  getCollection: (id, page = 1) =>
    fetchWithAxios(pexelsApi, {
      url: `collections/${id}`,
      params: { per_page: 16, page },
    }),
};

// --- Flickr API Service ---
const FLICKR_API_KEY = import.meta.env.VITE_FLICKR_API_KEY;

export const flickrApiService = {
    searchByGeo: (searchParams, page = 1) => {
        const twentyYearsAgo = new Date();
        twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
        const minUploadDate = Math.floor(twentyYearsAgo.getTime() / 1000);

        const germanCities = ['Baden-Baden', 'Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Dresden', 'Düsseldorf'];
        const isGermanCity = germanCities.some(germanCity =>
            searchParams.city.toLowerCase().includes(germanCity.toLowerCase()) || germanCity.toLowerCase().includes(searchParams.city.toLowerCase())
        );

        const searchTerm = isGermanCity ?
            `Fassade` :
            `${searchParams.city} gevel`;

        const params = {
            method: 'flickr.photos.search',
            api_key: FLICKR_API_KEY,
            has_geo: 1,
            lat: searchParams.lat,
            lon: searchParams.lon,
            radius: searchParams.radius,
            text: searchTerm,
            min_upload_date: minUploadDate,
            sort: 'interestingness-desc',
            extras: 'geo,url_q,url_n,url_m,url_b,url_h,url_k,url_o,' +
                    'width_b,height_b,width_h,height_h,width_k,height_k,width_o,height_o,' +
                    'o_dims,owner_name,date_taken',
            format: 'json',
            nojsoncallback: 1,
            per_page: 16,
            page: page,
        };

        return fetchWithAxios(flickrApi, { params });
    },
    searchByText: (query, page = 1) => {
        const twentyYearsAgo = new Date();
        twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
        const minUploadDate = Math.floor(twentyYearsAgo.getTime() / 1000);

        const params = {
            method: 'flickr.photos.search',
            api_key: FLICKR_API_KEY,
            text: query,
            min_upload_date: minUploadDate,
            sort: 'interestingness-desc',
            extras: 'url_q,url_n,url_m,url_b,url_h,url_k,url_o,' +
                    'width_b,height_b,width_h,height_h,width_k,height_k,width_o,height_o,' +
                    'o_dims,owner_name,date_taken',
            format: 'json',
            nojsoncallback: 1,
            per_page: 16,
            page: page,
        };

        return fetchWithAxios(flickrApi, { params });
    },
};

// --- Supabase Service (Uses JS Client) ---
// Wraps the Supabase call in an async function for TanStack Query.
export const supabaseApiService = {
    getUserSettings: async (userId) => {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) throw error; // TanStack Query catches this error.
        return data; // Returns null if no record exists
    },
    // Add other Supabase query functions here...
};
