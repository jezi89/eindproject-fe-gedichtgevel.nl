import React from 'react';
import styles from './AltSearchBar.module.scss';

export function AltSearchBar({ searchTerm, onSearchTermChange, onSearch, loading }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className={styles.searchBar}>
            <div className={styles.searchInputContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Zoek op titel, dichter of trefwoord..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <button 
                className={styles.searchButton}
                onClick={onSearch}
                disabled={loading}
                aria-label="Zoeken"
            >
                {loading ? (
                    '...'
                ) : (
                    <svg 
                        className={styles.searchIcon} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}
