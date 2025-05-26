/**
 * SearchResults Component
 *
 * Displays search results for poems with expandable/collapsible details.
 *
 * @module components/search/SearchResults
 */

import React, {useState} from 'react';
import styles from './SearchResults.module.scss';

/**
 * Individual search result item component
 *
 * @component
 * @param {Object} props
 * @param {Object} props.poem - Poem object with title, author, and lines
 * @returns {JSX.Element} Search result item
 */
function SearchResultItem({poem}) {
    // State
    // - isExpanded: Whether the full poem is displayed

    /**
     * Prevents click propagation within poem content
     *
     * @param {React.MouseEvent} e - Mouse event
     */
    function handleContentClick(e) {
        // Stop event propagation
    }

    /**
     * Toggles expanded state
     *
     * @param {React.MouseEvent} e - Mouse event
     */
    function toggleExpanded(e) {
        // Prevent default behavior
        // Toggle expanded state
    }

    return (
        // Result item container
        // Poem title and author
        // Preview (first few lines when collapsed)
        // Expand/collapse toggle
        // Full poem content when expanded

        // TODO Checken of we hier index moeten gebruiken
        <div className={styles.resultsContainer}>
            <div className={styles.resultsList}>
                {/*{results.map((poem, index) => (*/}
                {/*    <SearchResultItem key={index} poem={poem}/>*/}
                {/*))}*/}
            </div>
        </div>
    );
}

/**
 * SearchResults component for displaying poem search results
 *
 * @component
 * @param {Object} props
 * @param {Array} props.results - Array of poem objects
 * @returns {JSX.Element|null} Search results container or null if no results
 */
function SearchResults({results}) {
    // Return null if no results
    // Otherwise render list of search result items


}

export default SearchResults;