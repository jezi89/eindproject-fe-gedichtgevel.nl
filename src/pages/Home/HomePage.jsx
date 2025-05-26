/**
 * HomePage Component
 *
 * The main landing page for the gedichtgevel.nl application.
 * Displays welcome message and search functionality.
 *
 * @module pages/Home/HomePage
 */

import SearchBar from "@/components/search/Searchbar.jsx";

/**
 * HomePage component
 *
 * @component
 * @returns {JSX.Element} Home page component
 */
export function HomePage() {
    // Render welcome message and search bar
    // Handle any error states
    
    return (
        <div className="page-home">
            <h1 className="page-title">Welkom bij GedichtGevel</h1>
            <p className="page-subtitle">Ontdek de wereld van poëzie</p>
            {/* <SearchBar /> */}
        </div>
    );
}