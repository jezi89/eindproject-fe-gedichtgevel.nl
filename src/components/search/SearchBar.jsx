import {useEffect, useRef, useState} from 'react';
import styles from './SearchBar.module.scss';

export function SearchBar({
                              onSearch,
                              compact = false,
                              className = '',
                              placeholder = "Zoek op dichter en/of titel...",
                              initialValue = '',
                              variant = 'default',
                              showCharacterCount = true,
                              searchTerm: externalSearchTerm = '',
                              onSearchTermChange = null
                          }) {
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm || initialValue);
    const textareaRef = useRef(null);

    useEffect(() => {
        setSearchTerm(externalSearchTerm || initialValue);
    }, [externalSearchTerm, initialValue]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [searchTerm]);

    const MAX_CHARACTERS = 75;

    const handleInputChange = (e) => {
        let value = e.target.value;

        if (value.length > MAX_CHARACTERS) {
            value = value.slice(0, MAX_CHARACTERS);
        }

        setSearchTerm(value);

        if (onSearchTermChange) {
            onSearchTermChange(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch) {
                onSearch(searchTerm);
            }
        }
        if (searchTerm.length >= MAX_CHARACTERS &&
            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(e.key) &&
            !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    };

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const hasContent = searchTerm.trim().length > 0;

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
                            maxLength={MAX_CHARACTERS}
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