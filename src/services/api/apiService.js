import { poetryDbApi, pexelsApi, flickrApi } from './axios';
import { supabase } from '../supabase/supabase';

/**
 * Generieke, herbruikbare fetcher voor alle Axios-aanroepen.
 * @param {import('axios').AxiosInstance} apiClient - De te gebruiken Axios-instantie.
 * @param {object} config - De request-configuratie (url, params, etc.).
 * @returns {Promise<any>}
 */
const fetchWithAxios = async (apiClient, config) => {
    try {
        const response = await apiClient.request(config);
        return response.data;
    } catch (error) {
        // Gooi een gestandaardiseerde error zodat Tanstack Query deze kan opvangen.
        throw new Error(error.response?.data?.message || error.message);
    }
};

// --- Service Object voor Pexels API ---
export const pexelsApiService = {
    search: (query, page = 1) => fetchWithAxios(pexelsApi, {
        url: 'search',
        params: { query, per_page: 16, orientation: 'landscape', page }
    }),
    getCollection: (id, page = 1) => fetchWithAxios(pexelsApi, {
        url: `collections/${id}`,
        params: { per_page: 16, page }
    }),
};

// --- Service Object voor Flickr API ---
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
            extras: 'geo',
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
            format: 'json',
            nojsoncallback: 1,
            per_page: 16,
            page: page,
        };

        return fetchWithAxios(flickrApi, { params });
    },
};

// --- Service Object voor PoetryDB API ---
export const poetryDbApiService = {
    searchByAuthor: (author) => fetchWithAxios(poetryDbApi, {
        url: `/author/${author}`
    }),
    searchByTitle: (title) => fetchWithAxios(poetryDbApi, {
        url: `/title/${title}`
    }),
};

// --- Service Object voor Supabase (GEBRUIKT DE JS CLIENT!) ---
// We wrappen de Supabase-aanroep in een async functie die Tanstack Query kan consumeren.
export const supabaseApiService = {
    getUserSettings: async (userId) => {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error; // Tanstack Query vangt deze error op.
        return data;
    },
    // Voeg hier andere Supabase query-functies toe...
};
