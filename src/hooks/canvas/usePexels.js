// src/hooks/canvas/usePexels.js
import {useState, useCallback, useEffect, useRef} from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const COLLECTION_ID = import.meta.env.VITE_PEXELS_COLLECTION_ID;
const SEARCH_URL = "https://api.pexels.com/v1/search";
const COLLECTION_URL = `https://api.pexels.com/v1/collections/${COLLECTION_ID}`;

export function usePexels(onDefaultBackground = null) {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuery, setCurrentQuery] = useState("");
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    // --- NIEUW: Collection paginering state ---
    const [currentPage, setCurrentPage] = useState(1);
    const [isCollectionMode, setIsCollectionMode] = useState(false);
    const [perPage] = useState(15); // Standaard per_page waarde

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

            setPhotos(photosData);

            // Set mode voor paginering logic
            setIsCollectionMode(isCollection);

            if (isCollection) {
                // Collection mode: handmatige paginering
                // hasNextPage = true als we exact perPage foto's hebben (mogelijk meer pagina's)
                // hasNextPage = false als we minder dan perPage hebben (laatste pagina)
                const hasMore = photosData.length === perPage;
                setNextPageUrl(hasMore ? 'manual_next' : null);
                setPrevPageUrl(currentPage > 1 ? 'manual_prev' : null);

                // Auto-set foto 14 (index 13) als default achtergrond bij eerste collection load
                // ALLEEN als er nog geen achtergrond is gekozen (geen persisted background)
                if (!collectionLoadedRef.current && onDefaultBackground && photosData.length >= 14) {
                    // Check of er al een achtergrond in localStorage staat
                    const existingBackground = localStorage.getItem('canvas_background_image');
                    if (!existingBackground || existingBackground === 'null') {
                        const defaultPhoto = photosData[13]; // Foto 14 (13-indexed)
                        onDefaultBackground(defaultPhoto.src.large2x);
                    }
                }

                collectionLoadedRef.current = true;
            } else {
                // Search mode: gebruik API's next_page/prev_page URLs
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
            setCurrentQuery(query);
            setCurrentPage(1); // Reset page voor nieuwe zoekopdracht
            setIsCollectionMode(false); // Ga uit collection mode
            const initialUrl = `${SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
            fetchPexelsData(initialUrl);
        },
        [fetchPexelsData]
    );

    const goToNextPage = useCallback(() => {
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
