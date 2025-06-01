import {useState} from 'react';
import styles from './Searchbar.module.scss';
import SearchResults from "./searchResults.jsx";
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

export function SearchBar() {
    const [searchTerm, setSearchTerm] = useState(''); // Current search query
    const [results, setResults] = useState([]); // Array of search results
    const [loading, setLoading] = useState(false); // Whether search is in progress
    const [error, setError] = useState(''); // Error message if search fails


    // States
    // - searchTerm: Current search query
    // - results: Array of search results
    // - loading: Whether search is in progress
    // - error: Error message if search fails

    /**
     * Handles search submission
     *
     * @async
     * @function
     * @returns {Promise<void>}
     */
    async function handleSearch() {
        // Validate search term
        // Set loading state
        // Clear previous results
        // Perform search API request
        // Handle success (set results)
        // Handle errors (set error message)
        // Reset loading state

        if (!searchTerm.trim()) {
            setError('Voer een zoekterm in');
            setResults([]); // Clear results for empty search term
            return;
        }
        setLoading(true);
        setError('');
        setResults([]); // Clear previous results on new search
    }


    /**
     * Handles key press events to trigger search on Enter
     *
     * @param {React.KeyboardEvent} e - Keyboard event
     */
    function handleKeyPress(e) {
        // Check for Enter key
        // Trigger search
    }

    return (
        <section>
            {/*Search container*/}
            <div className={styles.searchContainer}>
                <div className={styles.searchBar}>

                    {/*Search input and button*/}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Zoek op titel en/of auteur..."
                        className={styles.searchInput}
                    />
                    <button
                        onClick={handleSearch}
                        className={styles.searchButton}
                        disabled={loading} // Disable button while loading
                    >
                        // Loading indicator
                        {loading ? 'Zoeken...' : 'Zoek'}
                    </button>
                </div>

                {/*Error message display*/}
                {error && <p className={styles.error}>{error}</p>}
                // Search results component
                {results.length > 0 && <SearchResults results={results}/>}
            </div>
            );
        </section>

    );
}

export default SearchBar;