// src/hooks/canvas/usePexels.js
import {useState, useCallback, useEffect, useRef} from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const COLLECTION_ID = import.meta.env.VITE_PEXELS_COLLECTION_ID;
const SEARCH_URL = "https://api.pexels.com/v1/search";
const COLLECTION_URL = `https://api.pexels.com/v1/collections/${COLLECTION_ID}`;

export function usePexels() {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuery, setCurrentQuery] = useState("");
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    // --- NIEUW: Collection paginering state ---
    const [currentPage, setCurrentPage] = useState(1);
    const [isCollectionMode, setIsCollectionMode] = useState(false);
    const [perPage] = useState(16); // 16 foto's per pagina

    // --- NIEUW: Vlag om te zorgen dat de collectie maar één keer laadt ---
    const collectionLoadedRef = useRef(false);

    const fetchPexelsData = useCallback(async (url, isCollection = false) => {
        setIsLoading(true);
        setError(null);

        if (!API_KEY) {
            setError("Pexels API sleutel ontbreekt.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(url, {
                headers: {Authorization: API_KEY},
            });

            const photosData = isCollection ? response.data.media : response.data.photos;

            if (!photosData) {
                setError(`Onverwachte API response structuur. Expected ${isCollection ? 'media' : 'photos'} array.`);
                setIsLoading(false);
                return;
            }

            // Toon alle foto's die de API teruggeeft (max perPage = 16)
            // Op laatste pagina kunnen dit minder zijn
            setPhotos(photosData);

            // Set mode voor paginering logic
            setIsCollectionMode(isCollection);

            if (isCollection) {
                // Collection mode: handmatige paginering
                // hasNextPage = true als we exact perPage (16) foto's kregen (mogelijk meer pagina's)
                // hasNextPage = false als we minder dan perPage hebben (laatste pagina)
                const hasMore = photosData.length === perPage;
                setNextPageUrl(hasMore ? 'manual_next' : null);
                setPrevPageUrl(currentPage > 1 ? 'manual_prev' : null);

                collectionLoadedRef.current = true;
            } else {
                // Search mode: gebruik API's next_page/prev_page URLs
                console.log('🔍 PEXELS SEARCH RESPONSE:', {
                    total_results: response.data.total_results,
                    page: response.data.page,
                    per_page: response.data.per_page,
                    photos_count: photosData.length,
                    next_page: response.data.next_page,
                    prev_page: response.data.prev_page
                });
                setNextPageUrl(response.data.next_page || null);
                setPrevPageUrl(response.data.prev_page || null);
            }

        } catch (err) {
            setError(`API fout: ${err.response?.status || err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, perPage]);

    const getCollectionPhotos = useCallback((page = 1) => {
        if (!COLLECTION_ID) {
            setError("Pexels Collectie ID ontbreekt.");
            return;
        }
        setCurrentPage(page);
        const collectionUrl = `${COLLECTION_URL}?per_page=${perPage}&page=${page}`;
        fetchPexelsData(collectionUrl, true);
    }, [fetchPexelsData, perPage]);

    const searchPhotos = useCallback(
        (query) => {
            setPhotos([]); // Clear oude foto's voor nieuwe search
            setCurrentQuery(query);
            setCurrentPage(1); // Reset page voor nieuwe zoekopdracht
            setIsCollectionMode(false); // Ga uit collection mode
            const initialUrl = `${SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
            console.log('🔎 PEXELS SEARCH URL:', initialUrl);
            fetchPexelsData(initialUrl);
        },
        [fetchPexelsData, perPage]
    );

    const goToNextPage = useCallback(() => {
        console.log('📄 NEXT PAGE CLICKED:', { nextPageUrl, isCollectionMode, currentPage });
        if (!nextPageUrl) return;

        if (isCollectionMode) {
            // Collection mode: handmatige page increment
            getCollectionPhotos(currentPage + 1);
        } else {
            // Search mode: gebruik next_page URL
            fetchPexelsData(nextPageUrl);
        }
    }, [nextPageUrl, isCollectionMode, currentPage, getCollectionPhotos, fetchPexelsData]);

    const goToPrevPage = useCallback(() => {
        if (!prevPageUrl) return;

        if (isCollectionMode) {
            // Collection mode: handmatige page decrement
            getCollectionPhotos(currentPage - 1);
        } else {
            // Search mode: gebruik prev_page URL
            fetchPexelsData(prevPageUrl);
        }
    }, [prevPageUrl, isCollectionMode, currentPage, getCollectionPhotos, fetchPexelsData]);

    useEffect(() => {
        // Laad de collectie alleen als deze nog NIET geladen is.
        if (!collectionLoadedRef.current) {
            getCollectionPhotos();
        }
    }, [getCollectionPhotos]);

    return {
        photos,
        isLoading,
        error,
        currentQuery,
        searchPhotos,
        getCollectionPhotos,
        goToNextPage,
        goToPrevPage,
        hasNextPage: !!nextPageUrl,
        hasPrevPage: !!prevPageUrl,
    };
}
