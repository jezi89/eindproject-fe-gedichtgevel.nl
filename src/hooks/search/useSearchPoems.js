/**
 * Modern React 19 search hook using TanStack Query
 * Automatic caching, refetching, and state management
 */

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {searchPoemsGeneral, searchPoemsByEra} from '@/services/api/poemSearchService.js';

/**
 * @param {Object} options - Hook options
 * @param {Array<string>} options.selectedEras - Selected era IDs for filtering
 */
export function useSearchPoems({ selectedEras = [] } = {}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [hasSearched, setHasSearched] = useState(false); // Track if user has initiated a search

    // Determine search mode
    const trimmedTerm = searchTerm.trim();
    const isEraOnlySearch = !trimmedTerm && selectedEras.length === 1;
    const singleEraId = isEraOnlySearch ? selectedEras[0] : null;

    // TanStack Query hook - automatic caching and state management
    const {
        data: results = [],
        isLoading: loading,
        error: queryError,
        isFetching,
        refetch
    } = useQuery({
        queryKey: isEraOnlySearch
            ? ['poems', 'era', singleEraId]
            : ['poems', 'search', trimmedTerm],
        queryFn: async ({ signal }) => {
            // Era-only search (empty term + single era selected)
            if (isEraOnlySearch) {
                const data = await searchPoemsByEra(singleEraId, { signal });
                return data || [];
            }

            // Normal text search
            const data = await searchPoemsGeneral(trimmedTerm, { signal });

            // Update search history when successful (only for non-empty searches)
            if (trimmedTerm && data && data.length > 0) {
                setSearchHistory(prev =>
                    [trimmedTerm, ...prev.filter(item => item !== trimmedTerm)].slice(0, 10)
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
        setHasSearched(false); // Reset search state to prevent auto-fetch on typing
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
