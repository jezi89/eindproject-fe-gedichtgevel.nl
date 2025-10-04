// src/hooks/canvas/useFlickr.js
import { useState, useCallback, useRef, useEffect } from "react";
import { useFlickrSearchByGeo } from "../search/useFlickrSearchByGeo";
import { useFlickrSearchByText } from "../search/useFlickrSearchByText";

export function useFlickr() {
    const [page, setPage] = useState(1);
    const [lastSearch, setLastSearch] = useState(null);

    const {
        photos: geoPhotos,
        totalPages: geoTotalPages,
        isLoading: isGeoLoading,
        isError: isGeoError,
        error: geoError,
    } = useFlickrSearchByGeo(lastSearch?.type === 'geo' ? lastSearch.params : null, page);

    const {
        photos: textPhotos,
        totalPages: textTotalPages,
        isLoading: isTextLoading,
        isError: isTextError,
        error: textError,
    } = useFlickrSearchByText(lastSearch?.type === 'text' ? lastSearch.query : null, page);

    const searchPhotosByGeo = useCallback((searchParams) => {
        setLastSearch({ type: 'geo', params: searchParams });
        setPage(1);
    }, []);

    const searchPhotosByText = useCallback((query) => {
        setLastSearch({ type: 'text', query: query });
        setPage(1);
    }, []);

    const goToNextFlickrPage = useCallback(() => {
        const totalPages = lastSearch?.type === 'geo' ? geoTotalPages : textTotalPages;
        if (page < totalPages) {
            setPage(p => p + 1);
        }
    }, [page, geoTotalPages, textTotalPages, lastSearch]);

    const goToPrevFlickrPage = useCallback(() => {
        if (page > 1) {
            setPage(p => p - 1);
        }
    }, [page]);

    const clearFlickrPhotos = useCallback(() => {
        setLastSearch(null);
        setPage(1);
    }, []);

    const photos = lastSearch?.type === 'geo' ? geoPhotos : textPhotos;
    const isLoading = lastSearch?.type === 'geo' ? isGeoLoading : isTextLoading;
    const isError = lastSearch?.type === 'geo' ? isGeoError : isTextError;
    const error = lastSearch?.type === 'geo' ? geoError : textError;
    const totalPages = lastSearch?.type === 'geo' ? geoTotalPages : textTotalPages;

    return {
        flickrPhotos: photos,
        isFlickrLoading: isLoading,
        flickrError: error,
        searchPhotosByGeo,
        searchPhotosByText,
        goToNextFlickrPage,
        goToPrevFlickrPage,
        hasNextFlickrPage: page < totalPages,
        hasPrevFlickrPage: page > 1,
        clearFlickrPhotos,
    };
}