// src/hooks/canvas/useFlickr.js
import {useState, useCallback, useRef} from "react";
import axios from "axios";

const FLICKR_API_KEY = import.meta.env.VITE_FLICKR_API_KEY;
const FLICKR_API_URL = "https://api.flickr.com/services/rest/";

export function useFlickr() {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);


    // State voor paginering
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Sla de laatste zoekopdracht op voor paginering
    const lastSearchRef = useRef(null);

    // src/hooks/canvas/useFlickr.js

    const searchPhotosByGeo = useCallback(async (searchParams, newSearch = true, targetPage = null) => {
        // ...
        setError(null);
        console.log("🕵️‍♂️ --- STARTING SIMPLIFIED FLICKR SEARCH --- 🕵️‍♂️");

        const searchPage = targetPage !== null ? targetPage : (newSearch ? 1 : page + 1);
        setIsLoading(true);
        if (newSearch) {
            setPhotos([]);
            setPage(1); // Reset pagina bij nieuwe zoekopdracht
            lastSearchRef.current = searchParams;
        }

        if (!FLICKR_API_KEY) {
            setError("Flickr API sleutel ontbreekt.");
            setIsLoading(false);
            return;
        }

        const twentyYearsAgo = new Date();
        twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
        const minUploadDate = Math.floor(twentyYearsAgo.getTime() / 1000);

        // Bepaal de juiste zoekterm op basis van de stad
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
            per_page: 15,
            page: searchPage,
        };

        console.log("📡 FLICKR QUERY VERZONDEN:", {
            url: FLICKR_API_URL,
            params,
            city: searchParams.city,
            searchTerm,
            isGermanCity
        });

        try {
            const response = await axios.get(FLICKR_API_URL, {params});
            console.log("✅ FLICKR ANTWOORD ONTVANGEN:", response.data);
            // ... de rest van de functie (try/catch/finally) blijft exact hetzelfde ...
            if (response.data.stat === 'ok') {
                const {photo, page, pages, total} = response.data.photos;
                console.log(`📸 Resultaten gevonden: ${total} foto's in totaal, op ${pages} pagina's.`);
                const photoData = photo.filter(p => p.secret && p.server !== '0').map(p => ({
                    id: p.id,
                    alt: p.title,
                    src: {
                        large2x: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_b.jpg`,
                        tiny: `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}_q.jpg`
                    }
                }));
                console.log(`📊 Verwerkte foto's op deze pagina: ${photoData.length}`);
                setPhotos(photoData);
                setPage(page);
                setTotalPages(pages);
            } else {
                setError(`Flickr API fout: ${response.data.message}`);
            }
        } catch (err) {
            setError(`Netwerkfout: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    // --- DE ONTBREKENDE FUNCTIE ---
    const goToNextFlickrPage = useCallback(() => {
        if (page < totalPages) {
            // We roepen de zoekfunctie aan met de OPGESLAGEN zoekopdracht
            // en de vlag 'newSearch' op false.
            searchPhotosByGeo(lastSearchRef.current, false);
        }
    }, [page, totalPages, searchPhotosByGeo]);

    const goToPrevFlickrPage = useCallback(() => {
        if (page > 1) {
            // Roep de zoekfunctie aan voor de vorige pagina
            searchPhotosByGeo(lastSearchRef.current, false, page - 1);
        }
    }, [page, searchPhotosByGeo]);

    // Clear function voor reset functionality
    const clearFlickrPhotos = useCallback(() => {
        setPhotos([]);
        setError(null);
        setPage(1);
        setTotalPages(0);
        lastSearchRef.current = null;
    }, []);

    return {
        flickrPhotos: photos,
        isFlickrLoading: isLoading,
        flickrError: error,
        searchPhotosByGeo,
        goToNextFlickrPage,
        // We hebben booleans nodig voor de UI
        goToPrevFlickrPage, // <-- Nieuwe functie exporteren
        hasNextFlickrPage: page < totalPages,
        hasPrevFlickrPage: page > 1,
        clearFlickrPhotos, // <-- Nieuwe functie voor reset
    };
}
