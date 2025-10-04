import {useState, useCallback, useEffect, useMemo} from 'react';
import {useSearchPoems} from '@/hooks/search/useSearchPoems.js';
import {useDebounce} from '../utils/useDebounce.js';

/**
 * Advanced search hook met auto-search, filtering en sorting
 * Implementeert moderne React 19 patterns voor optimale UX
 */

// TODO useAdvancedSearch.js hook werking checken en testen

export function refUseAdvancedSearch(options = {}) {
    const {
        autoSearchDelay = 500,
        enableAutoSearch = false,
        maxResults = 50,
        sortBy = 'relevance'
    } = options;

    const [filters, setFilters] = useState({
        language: 'all',
        length: 'all',
        period: 'all',
        genre: 'all'
    });

    const [sortOption, setSortOption] = useState(sortBy);
    const [autoSearchEnabled, setAutoSearchEnabled] = useState(enableAutoSearch);

    const {
        searchTerm,
        results: rawResults,
        loading,
        error,
        searchHistory,
        handleSearch: baseHandleSearch,
        updateSearchTerm,
        clearResults,
        searchMeta
    } = useSearchPoems();

    // Debounce search term voor auto-search
    const debouncedSearchTerm = useDebounce(searchTerm, autoSearchDelay);

    // Auto-search effect
    useEffect(() => {
        if (autoSearchEnabled && debouncedSearchTerm?.trim()) {
            baseHandleSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, autoSearchEnabled, baseHandleSearch]);

    // Filter en sort resultaten
    const processedResults = useMemo(() => {
        if (!rawResults?.length) return [];

        let filtered = rawResults;

        // Apply filters
        if (filters.language !== 'all') {
            filtered = filtered.filter(poem =>
                poem.language?.toLowerCase() === filters.language.toLowerCase()
            );
        }

        if (filters.length !== 'all') {
            const targetLength = filters.length;
            filtered = filtered.filter(poem => {
                const lineCount = poem.lines?.length || 0;
                switch (targetLength) {
                    case 'short':
                        return lineCount <= 10;
                    case 'medium':
                        return lineCount > 10 && lineCount <= 30;
                    case 'long':
                        return lineCount > 30;
                    default:
                        return true;
                }
            });
        }

        if (filters.period !== 'all') {
            // Implementeer period filtering op basis van auteur of metadata
            // Voor nu simpele implementatie
            filtered = filtered.filter(poem => {
                const author = poem.author?.toLowerCase() || '';
                switch (filters.period) {
                    case 'classical':
                        return author.includes('shakespeare') || author.includes('milton');
                    case 'romantic':
                        return author.includes('wordsworth') || author.includes('keats');
                    case 'modern':
                        return author.includes('frost') || author.includes('eliot');
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortOption) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'author':
                    return (a.author || '').localeCompare(b.author || '');
                case 'length':
                    return (b.lines?.length || 0) - (a.lines?.length || 0);
                case 'relevance':
                default:
                    // Keep original order for relevance
                    return 0;
            }
        });

        return sorted.slice(0, maxResults);
    }, [rawResults, filters, sortOption, maxResults]);

    // Update filter
    const updateFilter = useCallback((filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    }, []);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({
            language: 'all',
            length: 'all',
            period: 'all',
            genre: 'all'
        });
    }, []);

    // Enhanced search with immediate filtering
    const handleAdvancedSearch = useCallback((term = searchTerm) => {
        return baseHandleSearch(term);
    }, [baseHandleSearch, searchTerm]);

    // Search suggestions gebaseerd op history en filters
    const searchSuggestions = useMemo(() => {
        const suggestions = [];

        // Add history-based suggestions
        suggestions.push(...searchHistory.slice(0, 3));

        // Add filter-based suggestions
        if (filters.period !== 'all') {
            suggestions.push(`${filters.period} poetry`);
        }

        return [...new Set(suggestions)].slice(0, 5);
    }, [searchHistory, filters]);

    // Enhanced metadata
    const advancedSearchMeta = useMemo(() => ({
        ...searchMeta,
        filteredResultCount: processedResults.length,
        totalResultCount: rawResults?.length || 0,
        hasActiveFilters: Object.values(filters).some(filter => filter !== 'all'),
        autoSearchEnabled,
        sortOption,
        filters
    }), [searchMeta, processedResults.length, rawResults?.length, filters, autoSearchEnabled, sortOption]);

    return {
        // State
        searchTerm,
        results: processedResults,
        loading,
        error,
        searchHistory,
        filters,
        sortOption,
        autoSearchEnabled,

        // Actions
        handleSearch: handleAdvancedSearch,
        updateSearchTerm,
        clearResults,
        updateFilter,
        resetFilters,
        setSortOption,
        setAutoSearchEnabled,

        // Computed
        searchMeta: advancedSearchMeta,
        searchSuggestions
    };
}

export default refUseAdvancedSearch;