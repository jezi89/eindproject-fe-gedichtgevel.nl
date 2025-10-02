// TODO useSearchPoems.js hook werking checken en testen

import {useCallback, useEffect, useState} from 'react';
import {searchPoemsGeneral} from '@/services/api/poemSearchService.js';
import {searchCacheService} from '@/services/cache/searchCacheService';
import {searchContextService} from '@/services/context/SearchContextService.js';


/**
 * Modern React 19 search hook with improved UX patterns
 * Implements Dexie caching, error handling and loading states
 * Now with comprehensive search term synchronization
 */
export function useSearchPoems(source = 'unknown') {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [fromCache, setFromCache] = useState(false);
    const [carouselPosition, setCarouselPosition] = useState(0);

    // Initialize search context on mount
    useEffect(() => {
        const loadContext = async () => {
            try {
                const context = await searchContextService.loadContext();
                if (context) {
                    setSearchTerm(context.searchTerm || '');
                    setResults(context.results || []);
                    setSearchHistory(context.searchHistory || []);
                    setCarouselPosition(context.carouselPosition || 0);

                    console.log(`[${source}] Loaded search context:`, {
                        searchTerm: context.searchTerm,
                        resultCount: context.results?.length || 0,
                        carouselPosition: context.carouselPosition || 0,
                        lastSource: context.lastSearchSource
                    });
                }
            } catch (error) {
                console.error('Failed to load search context:', error);
            }
        };
        loadContext();
    }, [source]);

    const clearResults = useCallback(() => {
        setResults([]);
        setError('');
    }, []);

    const handleSearch = useCallback(async (term = searchTerm) => {
        const trimmedTerm = term.trim();

        if (!trimmedTerm) {
            setError('Voer een zoekterm in');
            clearResults();
            return;
        }

        setLoading(true);
        setError('');
        setFromCache(false);

        try {
            // Check Dexie cache first
            const cachedResults = await searchCacheService.get(trimmedTerm);

            if (cachedResults) {
                setResults(cachedResults);
                setError('');
                setFromCache(true);
                setLoading(false);

                // Save context for navigation
                await searchCacheService.setContext({
                    searchTerm: trimmedTerm,
                    results: cachedResults,
                    searchHistory
                });

                return;
            }

            // Not in cache, fetch from API
            clearResults();
            const data = await searchPoemsGeneral(trimmedTerm);

            if (data && data.length > 0) {
                setResults(data);
                setError('');

                // Cache the results in Dexie
                await searchCacheService.set(trimmedTerm, data);

                // Update search history (max 10 items)
                const newHistory = [trimmedTerm, ...searchHistory.filter(item => item !== trimmedTerm)].slice(0, 10);
                setSearchHistory(newHistory);

                // Save context for navigation with source tracking
                await searchContextService.saveContext({
                    searchTerm: trimmedTerm,
                    results: data,
                    searchHistory: newHistory,
                    source: source
                });
            } else {
                setError('Geen gedichten gevonden die overeenkomen met uw zoekopdracht.');
                setResults([]);
            }
        } catch (err) {
            console.error("Zoekfout:", err);
            setError('Er ging iets mis bij het zoeken. Probeer het opnieuw.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, searchHistory, clearResults]);

    // Enhanced updateSearchTerm with real-time sync
    const updateSearchTerm = useCallback(async (term) => {
        setSearchTerm(term);

        // Save search term immediately for sync across components
        if (term.trim()) {
            await searchContextService.saveSearchTerm(term, source);
        }
    }, [source]);

    // Auto-trigger search for non-homepage sources when term is loaded
    const autoTriggerSearch = useCallback(async () => {
        if (source !== 'homepage' && searchTerm.trim() && results.length === 0) {
            console.log(`[${source}] Auto-triggering search for: "${searchTerm}"`);
            await handleSearch(searchTerm);
        }
    }, [source, searchTerm, results.length, handleSearch]);

    // Effect for auto-triggering search on canvas/focus pages
    useEffect(() => {
        if (searchTerm && (source === 'canvas' || source === 'focus')) {
            // Small delay to ensure component is mounted
            const timer = setTimeout(autoTriggerSearch, 100);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, source, autoTriggerSearch]);

    // Search metadata
    const searchMeta = {
        hasResults: results.length > 0,
        resultCount: results.length,
        isEmpty: !searchTerm.trim(),
        hasError: !!error,
        isLoading: loading,
        canSearch: !!searchTerm.trim() && !loading,
        fromCache
    };

    // Save context when important state changes
    useEffect(() => {
        if (searchTerm && results.length > 0) {
            searchCacheService.setContext({
                searchTerm,
                results,
                searchHistory
            }).catch(console.error);
        }
    }, [searchTerm, results, searchHistory]);

    return {
        // State
        searchTerm,
        results,
        loading,
        error,
        searchHistory,
        fromCache,
        carouselPosition,

        // Actions
        handleSearch,
        updateSearchTerm,
        clearResults,

        // Computed
        searchMeta
    };
}
