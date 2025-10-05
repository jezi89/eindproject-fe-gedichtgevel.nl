import {useEffect, useRef, useState} from 'react';
import styles from './Searchbar.module.scss';

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
                              // TODO checken of die variant nodig is, of dat we die kunnen verwijderen
                              variant = 'default', // 'default', 'canvas', 'focus'
                              showCharacterCount = true,
                              searchTerm: externalSearchTerm = '',
                              onSearchTermChange = null
                          }) {
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm || initialValue); // Current search query or initial value
    const textareaRef = useRef(null);

    // Update internal state when external search term changes (from hook)
    useEffect(() => {
        setSearchTerm(externalSearchTerm || initialValue);
    }, [externalSearchTerm, initialValue]);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to get accurate scrollHeight
            textareaRef.current.style.height = 'auto';
            // Set height to scrollHeight, but cap it at max. height, defined in CSS
            textareaRef.current.style.heigh = `$textareaRef.current.scrollHeight}px`;
        }
    }, [searchTerm]);

    // Constants
    const MAX_CHARACTERS = 75;

    const handleInputChange = (e) => {
        let value = e.target.value;


        // Enforce character limit strictly
        if (value.length > MAX_CHARACTERS) {
            value = value.slice(0, MAX_CHARACTERS);
        }

        setSearchTerm(value);

        // Notify parent about search term changes for synchronization and caching
        // TODO Checken of caching nu verwekt wordt hier
        if (onSearchTermChange) {
            onSearchTermChange(value);
        }
    };

// Handle Enter key to trigger search
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            if (onSearch) {
                onSearch(searchTerm);
            }
        }
        // Shift+Enter will naturally create a new line

        // Prevent typing if at character limit (except for backspace, delete, arrows, etc.)
        if (searchTerm.length >= MAX_CHARACTERS &&
            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(e.key) &&
            !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    };


// Handle click on search button
    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    };


    const hasContent = searchTerm.trim().length > 0;

// TODO Dubbele classnames hier checken
    // TODO Checken of input met type tekst hier nodig is, of beter textarea gebruiken met rows={1} voor dynamische versie, want we willen 2 rijen ervan kunnen maken
    return (
        <div className={`${styles.searchSection} ${compact ? styles.compact : ''} ${className}`}>
            <div className={styles.searchContainer}>
                <div className={`${styles.searchBar} ${hasContent ? styles.searchBarActive : ''}`}>
                    <div className={styles.searchInputContainer}>
                        <textarea
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={styles.searchInput}
                            aria-label="Zoek naar gedichten"
                            style={{resize: 'none', overflow: 'hidden'}}
                            maxLength={MAX_CHARACTERS} // Good to have for accessibility and some browser behavior
                            rows={1}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>
                    {searchTerm.length > 0 && showCharacterCount && (
                        <div className={styles.characterCount}>
                            {searchTerm.length}/{MAX_CHARACTERS}
                        </div>
                    )}
                    <div className={styles.searchButtonContainer}>
                        <button
                            onClick={handleSearchClick}
                            className={styles.searchButton}
                            aria-label="Zoeken"
                        >
                            ZOEK
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}