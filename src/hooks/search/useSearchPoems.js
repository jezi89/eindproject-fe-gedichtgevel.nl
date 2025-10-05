/**
 * Modern React 19 search hook using TanStack Query
 * Automatic caching, refetching, and state management
 */

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {searchPoemsGeneral} from '@/services/api/poemSearchService.js';

export function useSearchPoems() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [hasSearched, setHasSearched] = useState(false); // Track if user has initiated a search

    // TanStack Query hook - automatic caching and state management
    const {
        data: results = [],
        isLoading: loading,
        error: queryError,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['poems', 'search', searchTerm.trim()],
        queryFn: async ({ signal }) => { // Destructure the signal from the query context
            const trimmed = searchTerm.trim();
            // Pass the signal to the search function
            const data = await searchPoemsGeneral(trimmed, { signal });

            // Update search history when successful (only for non-empty searches)
            if (trimmed && data && data.length > 0) {
                setSearchHistory(prev =>
                    [trimmed, ...prev.filter(item => item !== trimmed)].slice(0, 10)
                );
            }

            return data || [];
        },
        enabled: hasSearched, // Only fetch when user has initiated a search
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        retry: 1,
    });

    // Convert error to string message
    const error = queryError ?
        (results.length === 0 ? 'Geen gedichten gevonden die overeenkomen met uw zoekopdracht.' : '')
        : '';

    // Actions
    const handleSearch = (term = searchTerm) => {
        setSearchTerm(term);
        setHasSearched(true); // Mark that a search has been initiated
    };

    const updateSearchTerm = (term) => {
        setSearchTerm(term);
    };

    const clearResults = () => {
        setSearchTerm('');
        setHasSearched(false); // Reset search state
    };

    // Search metadata
    const searchMeta = {
        hasResults: results.length > 0,
        resultCount: results.length,
        isEmpty: !searchTerm.trim(),
        hasError: !!error,
        isLoading: loading || isFetching,
        canSearch: !loading, // Always can search, even with empty term
        fromCache: false // TanStack Query handles caching automatically
    };

    return {
        // State
        searchTerm,
        results,
        loading: loading || isFetching,
        error,
        searchHistory,
        fromCache: false,
        carouselPosition: 0, // Can be managed separately if needed

        // Actions
        handleSearch,
        updateSearchTerm,
        clearResults,
        refetch,

        // Computed
        searchMeta
    };
}
