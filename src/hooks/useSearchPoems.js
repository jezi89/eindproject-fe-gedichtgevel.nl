import {useCallback, useMemo, useState} from "react";

export function useSearchPoems() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState('[]');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


// TODO Checken hoe de cache precies werkt in de context van deze hook
// In memory cache for search results with a simple Map,
// that stores the search term as the key and results as the value

    const [cache] = useState(new Map());

    const clearResults = useCallback(async (term = searchTerm) => {
        //clean once st the beginning by trimming the search term
        if (!term) {
            setError('Voer een zoekterm in');
            setResults([]);
            return;
        }

        // Check cache first
        if (cache.has(term)) {
            const cachedResults = cache.get(term);
            setResults(cachedResults);
            setError('');
            return;
        }

        setLoading(true);
        setError('');
        clearResults();

        try {
            const data = await searchPoemsGeneral(term);

            if (data && data.length > 0) {
                setResults(data);
                setError('');

                // Cache the results
                cache.set(term, data);

                // TODO nagaan hoe we de history gebruiken (nu nog niet functioneel)
                // Add to search history (max 10 items)
                setSearchHistory(prev => {
                    const newHistory = [term, ...prev.filter(item => item !== term)];
                    return newHistory.slice(0, 10);
                });
            } else {
                setError('Geen gedichten gevonden die overeenkomen met uw zoekopdracht.');
                setResults([]);
            }
        } catch (error) {
            {
                console.error('Search error:', error);
            }
            setError('Er is een fout opgetreden bij het zoeken. Probeer het later opnieuw.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, cache, clearResults]);

    const updateSearchTerm = useCallback((term) => {
        setSearchTerm(term);
    }, []);

// TODO checken hoe dit precies werkt in de context van deze hook
// Memoized search Metadata
    const searchMeta = useMemo(() => ({
        hasResults: results.length > 0,
        resultCount: results.length,
        isEmpty: !searchTerm,
        hasError: !!error,
        isLoading: loading,
        canSearch: !!searchTerm && !loading
    }), [results.length, searchTerm, error, loading]);

    return {
        // State variables
        searchTerm,
        results,
        loading,
        error,
        searchHistory: [], // TODO implement search history

        // Actions
        handleSearch,
        updateSearchTerm,
        clearResults,

        // Computed properties
        searchMeta
    }
}