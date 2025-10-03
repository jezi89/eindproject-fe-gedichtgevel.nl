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

    // TanStack Query hook - automatic caching and state management
    const {
        data: results = [],
        isLoading: loading,
        error: queryError,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['poems', 'search', searchTerm.trim()],
        queryFn: async () => {
            const trimmed = searchTerm.trim();
            if (!trimmed) return [];

            const data = await searchPoemsGeneral(trimmed);

            // Update search history when successful
            if (data && data.length > 0) {
                setSearchHistory(prev =>
                    [trimmed, ...prev.filter(item => item !== trimmed)].slice(0, 10)
                );
            }

            return data || [];
        },
        enabled: !!searchTerm.trim(), // Only fetch if searchTerm is not empty
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
    };

    const updateSearchTerm = (term) => {
        setSearchTerm(term);
    };

    const clearResults = () => {
        setSearchTerm('');
    };

    // Search metadata
    const searchMeta = {
        hasResults: results.length > 0,
        resultCount: results.length,
        isEmpty: !searchTerm.trim(),
        hasError: !!error,
        isLoading: loading || isFetching,
        canSearch: !!searchTerm.trim() && !loading,
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
