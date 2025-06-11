import {useEffect, useState} from 'react';
import styles from './Searchbar.module.scss';
import {cleanSearchInput} from '@/utils/TextUtils.js';

/**
 * SearchBar Component
 *
 * Provides a search interface for finding poems by title or author,
 * and displays the results.
 * - Simple input (not textarea)
 * - 75 character limit
 * - Proper styling states
 * - Reusable across different contexts (home, design)
 * - Supports initialValue for context restoration
 * @module components/search/SearchBar
 */

export function SearchBar({
                              onSearch,
                              compact = false,
                              className = '',
                              placeholder = "Zoek op dichter en/of titel...",
                              // TODO checken of die initial value nodig is
                              initialValue = '',
                              showCharacterCount = true
                          }) {
    const [searchTerm, setSearchTerm] = useState(initialValue); // Current search query

    // Constants
    const MAX_CHARACTERS = 75;

    // TODO Checken of de caching nu verwekt wordt hier
    // Update internal state when initialValue changes (e.g., from context)
    useEffect(() => {
        setSearchTerm(initialValue);
    }, [initialValue]);

    /**
     * Cleans the search term and returns the version to be used for searching.
     * @param {string} currentSearchTerm - The current search term from the input.
     * @returns {string} The processed search term.
     */
    function finalizeSearchTerm(currentSearchTerm) {
        const {original, cleaned, wasModified} = cleanSearchInput(currentSearchTerm);
        if (wasModified) {
            return cleaned;
            // If the search term was modified, use the cleaned version
        } else {
            return original;
        }
    }


    const handleInputChange = (e) => {
        let value = e.target.value;

        // Enforce character limit strictly
        if (value.length > MAX_CHARACTERS) {
            value = value.slice(0, MAX_CHARACTERS);
        }
        setSearchTerm(value);
    };


    const handleKeyPress = (e) => {
        // Prevent typing if at character limit (except for backspace, delete, arrows, etc.)
        if (searchTerm.length >= MAX_CHARACTERS && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    };


    /**
     * Triggers the search operation with the current search term.
     */
    const executeSearch = () => {
        const trimmedSearchTerm = searchTerm.trim();
        if (onSearch && trimmedSearchTerm) {
            const termToSearch = finalizeSearchTerm(trimmedSearchTerm);
            onSearch(termToSearch);
        }
    };
    // Handle Enter key to trigger search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            executeSearch();
        }
    };

    /**
     * Handles click event on the search button.
     */
    const handleSearchClick = () => {
        executeSearch();
    };

    const hasContent = searchTerm.trim().length > 0;

// TODO Dubbele classnames hier checken
    // TODO Checken of input met type tekst hier nodig is, of beter textarea gebruiken met rows={1} voor dynamische versie, want we willen 2 rijen ervan kunnen maken
    return (
        <div className={`${styles.searchSection} ${className}`}>
            {/* Main Search Bar */}
            <div className={styles.searchContainer}>
                <div className={`${styles.searchBar} ${hasContent ? styles.searchBarActive : ''}`}>
                    {/*${isInputTall ? styles.searchBarTall : ''}*/}
                    // TODO conditional styling voor tall input
                    {/*                    This indicates a plan for dynamic height adjustment. If you switch to <textarea>, you could manage its height. For a simple two-row expansion,
                    you might conditionally change the rows prop or apply a class that sets a specific height.
                    You'll need to define the logic for when isInputTall becomes true
                    */}
                    <div className={styles.searchInputContainer}>
                        <textarea
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onKeyPress={handleKeyPress} // Added onKeyPress to enforce char limit while typing
                            placeholder={placeholder}
                            className={styles.searchInput}
                            rows={1}
                            aria-label="Zoek naar gedichten"
                            style={{resize: 'none', overflow: 'hidden'}}
                            maxLength={MAX_CHARACTERS} // Good to have for accessibility and some browser behavior
                        />
                    </div>
                    <div className={styles.searchButtonContainer}>
                        <button
                            onClick={handleSearchClick}
                            disabled={!searchTerm.trim()}
                            className={styles.searchButton}
                            aria-label="Zoeken"
                        >
                            ZOEK
                        </button>
                    </div>
                </div>
                // TODO Checken hoe we compact gebruiken als mode om
                {searchTerm.length > 0 && showCharacterCount && !compact && (
                    <div className={styles.characterCount}>
                        {searchTerm.length}/{MAX_CHARACTERS}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchBar;