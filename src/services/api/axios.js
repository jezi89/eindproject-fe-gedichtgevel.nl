
import axios from 'axios';

/**
 * Een factory-functie voor het aanmaken van een geconfigureerde Axios-instantie.
 * @param {string} baseURL - De basis-URL van de API.
 * @param {object} headers - Optionele extra headers.
 * @returns {import('axios').AxiosInstance}
 */
const createApiClient = (baseURL, headers = {}) => {
    return axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
};

// Client voor PoetryDB
export const poetryDbApi = createApiClient('https://poetrydb.org');

// Client voor Flickr
// API key wordt via request params meegegeven, dus geen extra headers nodig.
export const flickrApi = createApiClient('https://api.flickr.com/services/rest/');

// Client voor Pexels
export const pexelsApi = createApiClient('https://api.pexels.com/v1/', {
    Authorization: import.meta.env.VITE_PEXELS_API_KEY,
});
