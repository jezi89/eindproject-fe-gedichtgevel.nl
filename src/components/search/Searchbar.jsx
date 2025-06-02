import {useState} from 'react';
import styles from './Searchbar.module.scss';
// import SearchResults from "./searchResults.jsx";
// import {searchPoemsGeneral} from "@/services/poetryApi.js";

/**
 * SearchBar Component
 *
 * Provides a search interface for finding poems by title or author,
 * and displays the results.
 *
 * @module components/search/SearchBar
 */

/**
 * SearchBar component for searching poems
 *
 * @component
 * @returns {JSX.Element} Search bar with results display
 */

export function SearchBar({onSearch}) {
    const [searchTerm, setSearchTerm] = useState(''); // Current search query
    // const [results, setResults] = useState([]); // Array of search results
    // const [loading, setLoading] = useState(false); // Whether search is in progress
    // const [error, setError] = useState(''); // Error message if search fails

    const cleanSearchTerm = searchTerm.replace(/\s*[^a-zA-Z]\s*|\n|\r/g, ' ').trim(); // Clean search term by removing non-alphabetic characters and line breaks

    const handleInputChange = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
    };

    const handleKeyDown = (e) => {
        // Handle Enter key to trigger search
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            if (onSearch && searchTerm.trim() !== '') {
                // Clean search term before sending (remove any line breaks)
                handleInputChange(); // Trigger search
                onSearch(cleanSearchTerm); // Clean search term before sending
            }
        }
    };


    /**
     * Handles key press events to trigger search on Enter
     *
     * @param {React.KeyboardEvent} e - Keyboard event
     */
    const handleSearchClick = () => {
        // TODO checken of hier nogmaals een regex clean nodig is
        if (onSearch && searchTerm.trim() !== '') {
            handleInputChange(); // Trigger search
            onSearch(cleanSearchTerm); // Clean search term before sending
        }
    };


    return (
        <div className={styles.searchSection}>
            {/* Main Search Bar */}
            <div className={styles.searchContainer}>
                <div className={`${styles.searchBar} ${searchTerm.trim() ? styles.searchBarActive : ''} `}>
                    {/*${isInputTall ? styles.searchBarTall : ''}*/} // TODO conditional styling voor tall input
                    <div className={styles.searchInputContainer}>
                        <textarea
                            // ref={textareaRef}
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Shakespeare: The Phoenix and Turtle"
                            className={styles.searchInput}
                            /*{`${styles.searchInput} ${isInputTall ? styles.searchInputTall : ''}`}*/ // TODO conditional styling voor tall input
                            aria-label="Zoek naar gedichten"
                            rows={1}
                            style={{resize: 'none', overflow: 'hidden'}}
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
            </div>
        </div>
    );
}


export default SearchBar;