import { pexelsApi, flickrApi, commonsApi } from './axios';
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

// --- Wikimedia Commons API Service ---
// Drop-in vervanger voor de Flickr geo/tekst-zoek: gratis, geen API key.
// Levert foto-objecten in dezelfde vorm als de Flickr API zodat de bestaande
// hooks (useFlickrSearchByGeo/Text) en de FloatingPhotoGrid ongewijzigd werken.
const COMMONS_PER_PAGE = 16;

const stripHtml = (html) =>
    (html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .trim();

// Wikimedia accepteert alleen vaste thumbnail-breedtes bij directe requests
// (zie https://www.mediawiki.org/wiki/Common_thumbnail_sizes); andere maten geven HTTP 400.
const COMMONS_ALLOWED_WIDTHS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840];

// Commons thumb-URL's bevatten '/<breedte>px-'; door die breedte te vervangen door de
// dichtstbijzijnde toegestane maat (naar boven) krijgen we een geldig formaat.
// Vanaf de originele breedte gebruiken we het origineel.
const commonsThumb = (thumburl, requestedWidth, originalWidth, originalUrl) => {
    const snapped = COMMONS_ALLOWED_WIDTHS.find((w) => w >= requestedWidth)
        || COMMONS_ALLOWED_WIDTHS[COMMONS_ALLOWED_WIDTHS.length - 1];
    if (originalWidth && snapped >= originalWidth) return originalUrl;
    return thumburl.replace(/\/(\d+)px-/, `/${snapped}px-`);
};

const normalizeCommonsPage = (page) => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl) return null;

    const meta = info.extmetadata || {};
    const thumb = (w) => commonsThumb(info.thumburl, w, info.width, info.url);
    const title = (meta.ObjectName?.value || page.title || '')
        .replace(/^File:/, '')
        .replace(/\.\w+$/, '');

    return {
        // Flickr-vormige velden (zie normalizeFlickrPhoto in de hooks)
        id: String(page.pageid),
        title,
        ownername: stripHtml(meta.Artist?.value) || 'Onbekende maker',
        datetaken: meta.DateTimeOriginal?.value || null,
        secret: 'commons', // laat de bestaande p.secret-filter passeren
        server: 'commons',

        url_q: thumb(150),
        url_n: thumb(320),
        url_m: thumb(500),
        url_b: thumb(1024),
        url_h: thumb(1600),
        url_k: thumb(2048),
        url_o: info.url,
        width_o: info.width,
        height_o: info.height,
        o_dims: `${info.width}x${info.height}`,

        // Extra t.o.v. Flickr: licentie & bronpagina voor correcte attributie
        license: meta.LicenseShortName?.value || null,
        descriptionurl: info.descriptionurl || null,
    };
};

const commonsSearch = async (gsrsearch, page = 1) => {
    const params = {
        action: 'query',
        generator: 'search',
        gsrsearch,
        gsrnamespace: 6, // File-namespace
        gsrlimit: COMMONS_PER_PAGE,
        gsroffset: (page - 1) * COMMONS_PER_PAGE,
        gsrinfo: 'totalhits',
        prop: 'imageinfo',
        iiprop: 'url|size|extmetadata',
        iiurlwidth: 1600,
        format: 'json',
        origin: '*', // CORS
    };

    const data = await fetchWithAxios(commonsApi, { url: 'api.php', params });

    const photos = Object.values(data?.query?.pages || {})
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(normalizeCommonsPage)
        .filter(Boolean);

    const totalHits = data?.query?.searchinfo?.totalhits;
    const pages = totalHits
        ? Math.ceil(totalHits / COMMONS_PER_PAGE)
        : (data?.continue ? page + 1 : page);

    // Zelfde envelope als de Flickr API
    return { photos: { page, pages, perpage: COMMONS_PER_PAGE, photo: photos }, stat: 'ok' };
};

export const commonsApiService = {
    // searchParams: { city, lat, lon, radius (km) } — zelfde vorm als flickrApiService.searchByGeo
    searchByGeo: (searchParams, page = 1) =>
        commonsSearch(`filetype:bitmap nearcoord:${searchParams.radius}km,${searchParams.lat},${searchParams.lon}`, page),
    searchByText: (query, page = 1) =>
        commonsSearch(`filetype:bitmap ${query}`, page),
};

// --- Geo-foto bron-switch ---
// Commons is de standaardbron (gratis). Zet VITE_USE_FLICKR=true in .env.local om
// tijdelijk terug te vallen op Flickr zolang de API key nog werkt (vereist Pro sinds 2025).
const USE_FLICKR_GEO = import.meta.env.VITE_USE_FLICKR === 'true';
export const geoPhotoApiService = USE_FLICKR_GEO ? flickrApiService : commonsApiService;
// Bron-identifier voor searchContext/labels, zodat UI en optimalisatie weten waar foto's vandaan komen
export const GEO_PHOTO_SOURCE = USE_FLICKR_GEO ? 'flickr' : 'commons';

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
