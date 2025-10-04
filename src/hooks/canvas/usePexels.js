// src/hooks/canvas/usePexels.js
import { useState, useCallback, useEffect } from "react";
import { usePexelsSearch } from "../search/usePexelsSearch";
import { usePexelsCollection } from "../search/usePexelsCollection";

const COLLECTION_ID = import.meta.env.VITE_PEXELS_COLLECTION_ID;

export function usePexels() {
    const [currentQuery, setCurrentQuery] = useState("");
    const [isCollectionMode, setIsCollectionMode] = useState(true);
    const [page, setPage] = useState(1);

    const {
        photos: searchPhotosData,
        isLoading: isSearchLoading,
        isError: isSearchError,
        error: searchError,
    } = usePexelsSearch(currentQuery, page);

    const {
        photos: collectionPhotosData,
        isLoading: isCollectionLoading,
        isError: isCollectionError,
        error: collectionError,
    } = usePexelsCollection(COLLECTION_ID, page);

    const searchPhotos = useCallback((query) => {
        setCurrentQuery(query);
        setIsCollectionMode(false);
        setPage(1);
    }, []);

    const getCollectionPhotos = useCallback(() => {
        setCurrentQuery("");
        setIsCollectionMode(true);
        setPage(1);
    }, []);

    const goToNextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const goToPrevPage = () => {
        setPage((prevPage) => Math.max(1, prevPage - 1));
    };

    useEffect(() => {
        if (isCollectionMode) {
            // Logic to handle collection loading
        }
    }, [isCollectionMode]);

    const photos = isCollectionMode ? collectionPhotosData : searchPhotosData;
    const isLoading = isCollectionMode ? isCollectionLoading : isSearchLoading;
    const isError = isCollectionMode ? isCollectionError : isSearchError;
    const error = isCollectionMode ? collectionError : searchError;

    // The new hooks do not provide pagination info, so we need to calculate it.
    // This is a simplified example. A more robust solution would require more info from the API.
    const hasNextPage = photos.length > 0; 
    const hasPrevPage = page > 1;

    return {
        photos,
        isLoading,
        isError,
        error,
        currentQuery,
        searchPhotos,
        getCollectionPhotos,
        goToNextPage,
        goToPrevPage,
        hasNextPage,
        hasPrevPage,
    };
}