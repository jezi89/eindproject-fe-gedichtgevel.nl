import {useLocalStorage} from '../utils/useLocalStorage.js';
import {useCallback} from 'react';

/**
 * Hook for managing search history with localStorage persistence
 * @param {Object} options - Configuration options
 * @param {number} options.maxHistory - Maximum number of history items to keep
 * @returns {Object} Search history state and methods
 */

// TODO useSearchHistory.js hook werking checken en testen
export function useSearchHistory(options = {}) {
    const {maxHistory = 10} = options;

    const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', []);

    // Add search term to history
    const addToHistory = useCallback((term) => {
        if (!term?.trim()) return;

        const trimmedTerm = term.trim();

        setSearchHistory(prev => {
            // Remove if already exists to avoid duplicates
            const filtered = prev.filter(item => item !== trimmedTerm);
            // Add to beginning and limit to maxHistory
            return [trimmedTerm, ...filtered].slice(0, maxHistory);
        });
    }, [setSearchHistory, maxHistory]);

    // Remove specific term from history
    const removeFromHistory = useCallback((term) => {
        setSearchHistory(prev => prev.filter(item => item !== term));
    }, [setSearchHistory]);

    // Clear all history
    const clearHistory = useCallback(() => {
        setSearchHistory([]);
    }, [setSearchHistory]);

    // Get filtered suggestions based on current input
    const getSuggestions = useCallback((currentInput = '') => {
        if (!currentInput?.trim()) {
            return searchHistory.slice(0, 5);
        }

        const input = currentInput.toLowerCase();
        return searchHistory
            .filter(term => term.toLowerCase().includes(input))
            .slice(0, 5);
    }, [searchHistory]);

    return {
        searchHistory,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getSuggestions,
        hasHistory: searchHistory.length > 0
    };
}

export default useSearchHistory;