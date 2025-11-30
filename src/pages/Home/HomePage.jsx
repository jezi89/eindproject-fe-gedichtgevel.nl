import { useNavigate, useSearchParams } from 'react-router';
import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { SearchBar } from "@/components/search/SearchBar.jsx";
import { SearchResults } from "@/components/search/SearchResults.jsx";
import { SearchLoadingState } from "@/components/search/SearchLoadingState.jsx";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary.jsx";
import { FilterDropdown } from "@/components/search/filters/FilterDropdown.jsx";
import { FilterDropdownSlider } from "@/components/search/filters/FilterDropdownSlider.jsx";
import { FilterToggle } from "@/components/search/filters/FilterToggle.jsx";
import { Footer } from "@/layouts/Footer/Footer.jsx";
import { DailyPoems } from "@/components/DailyPoems/DailyPoems.jsx";
import { WelcomeAnimation } from "@/components/ui/WelcomeAnimation/WelcomeAnimation.jsx";
import { useSearchPoems } from '@/hooks/search';
import { useCanvasNavigation } from "@/hooks/canvas/useCanvasNavigation.js";
import { useAuth } from '@/hooks/auth/useAuth';
import { DailyPoemsProvider, useDailyPoems } from '@/context/poem/DailyPoemsContext.jsx';
import { useEasterEgg } from '@/hooks/utils/useEasterEgg.js';
import { useToast } from '@/context/ui/ToastContext.jsx';
import { ERAS, filterPoemsByEras } from '@/utils/eraMapping.js';
import styles from './HomePage.module.scss';

// Plaats hier de Public URL van je video in Supabase Storage
const WELCOME_ANIMATION_URL = "https://fwaxobqcxzrrttzfvdsw.supabase.co/storage/v1/object/public/site-video-assets/Gedichtgevel%20Animatie%20Bewerkt%20optimized%20Res.mp4";


/**
 * Internal component containing the actual page content.
 * This allows us to use the DailyPoemsContext within the same file as the provider.
 */
function HomePageContent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dailyPoemsSectionRef = useRef(null);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [showAnimation, setShowAnimation] = useState(false);


    // --- Welcome Animation Logic ---
    useEffect(() => {
        // 1. Voer alleen uit voor ingelogde gebruikers
        if (!user) {
            return;
        }

        // 2. Controleer of de animatie al is getoond in deze sessie
        if (sessionStorage.getItem('hasSeenWelcomeAnimation')) {
            return;
        }

        // 3. Toon de animatie direct bij het laden van de component
        setShowAnimation(true);

        // 4. Markeer als gezien voor deze sessie
        sessionStorage.setItem('hasSeenWelcomeAnimation', 'true');

    }, [user]); // Afhankelijk van de user state

    const handleAnimationEnd = () => {
        setShowAnimation(false);
    };
    // --------------------------------

    // --- Easter Egg for Refetching Daily Poems (for logged-in users) ---
    const { refetchDailyPoems } = useDailyPoems();

    const handleRefetchAndScroll = useCallback(async () => {
        await refetchDailyPoems();
        // Scroll to the section after the poems have been refetched.
        // A small timeout ensures the DOM has time to update before scrolling.
        setTimeout(() => {
            dailyPoemsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, [refetchDailyPoems]);

    const easterEggCallback = user ? handleRefetchAndScroll : () => {};
    useEasterEgg(easterEggCallback);
    // ------------------------------------------------------------------

    // --- Filter State Management ---
    const [maxLength, setMaxLength] = useState(60); // Default: 60 lines
    const [selectedEras, setSelectedEras] = useState([]); // Empty array = all eras (multi-select)
    const [language, setLanguage] = useState('en'); // Default: English (only available option)
    const [onlyMyDesigns, setOnlyMyDesigns] = useState(false); // Creative Canvas filter (disabled)

    // Handler for disabled filter buttons
    const handleComingSoonClick = useCallback(() => {
        addToast('Binnenkort beschikbaar', 'info', 3000);
    }, [addToast]);
    // ------------------------------

    // Canvas navigation hook
    const { navigateToCanvas } = useCanvasNavigation();

    // Render welcome message and search bar
    // Handle any error states
    const {
        searchTerm,
        results,
        loading,
        error,
        handleSearch,
        updateSearchTerm,
        searchMeta,
        carouselPosition
    } = useSearchPoems({ selectedEras });

    // --- Apply Filters to Search Results ---
    const filteredResults = useMemo(() => {
        if (!results || results.length === 0) return [];

        let filtered = [...results];

        // 1. Filter by length (line count)
        if (maxLength < 150) {
            filtered = filtered.filter(poem => {
                const lineCount = poem.lines ? poem.lines.length : 0;
                return lineCount <= maxLength;
            });
        }

        // 2. Filter by era (multi-select, based on author birth year)
        if (selectedEras.length > 0) {
            filtered = filterPoemsByEras(filtered, selectedEras);
        }

        // 3. Filter by language (currently only English is available)
        // Future: Add language detection or filter based on poem metadata
        // For now, all poems from PoetryDB are in English

        // 4. Filter by Creative Canvas designs (future feature)
        // if (onlyMyDesigns) {
        //     filtered = filtered.filter(poem => hasUserDesign(poem));
        // }

        return filtered;
    }, [results, maxLength, selectedEras]);
    // ---------------------------------------

    // Bepaal search state gebaseerd op hook
    const getSearchState = () => {
        if (loading) return 'searching';
        if (searchMeta.hasResults) return 'results';
        if (error) return 'error';
        return 'idle';
    };

    const searchState = getSearchState();

    // Handle canvas navigation from search results
    const handleNavigateToCanvas = (poemData) => {
        try {
            // Validate that we have the navigation function
            if (!navigateToCanvas) {
                throw new Error('Navigation function not available');
            }

            navigateToCanvas(poemData, {source: 'search'});
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                poemData: poemData,
            });
            // TODO: Show user-friendly error message (toast/notification)
            alert('Er ging iets mis bij het openen van het gedicht in de canvas. Probeer het opnieuw.');
        }
    };

    // Handle recording page navigation from search results (Declameer button)
    const handleNavigateToRecording = (poemData) => {
        if (!poemData) return;

        try {
            // Navigate to recording page with poem data in state
            navigate('/spreekgevel', {
                state: {
                    selectedPoem: poemData,
                    source: 'search'
                }
            });
        } catch (error) {
            // Fallback: navigate without state
            navigate('/spreekgevel');
        }
    };


    return (
        <div className={styles.homePage}>
            {/* Conditionally render the animation */}
            {showAnimation && (
                <WelcomeAnimation
                    videoUrl={WELCOME_ANIMATION_URL}
                    onAnimationEnd={handleAnimationEnd}
                />
            )}

            {/* Hero Section - Text Container P2 */}
            <div className={styles.heroSection}>
                <div className={styles.heroContainer}>
                    <h1 className={styles.heroHeading}>
                        Ontketen je creativiteit met poëzie
                    </h1>
                    <p className={styles.heroParagraph}>
                        Duik in een wereld waar poëzie en architectuur samenkomen.<br/>
                        Ontdek, neem op en personaliseer je poëtische uitingen als nooit tevoren.
                    </p>
                </div>
            </div>

            {/* Main Search Section */}
            <div className={styles.searchSection}>
                {/* ZOEK GEDICHTEN CTA Header */}
                <div className={styles.searchCTAContainer}>
                    <div className={styles.searchCTA}>
                        <div className={styles.searchCTATagline}>
                            ZOEK GEDICHTEN
                        </div>
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M10.5 3C14.0899 3 17 5.91015 17 9.5C17 11.11 16.4105 12.5816 15.4424 13.7111L20.7071 18.9759C21.0976 19.3664 21.0976 19.9995 20.7071 20.39C20.3525 20.7446 19.7894 20.7796 19.3945 20.4949L19.2929 20.39L14.0281 15.1253C12.8986 16.0935 11.5085 16.625 10 16.625C6.41015 16.625 3.5 13.7149 3.5 10.125C3.5 6.53515 6.41015 3.625 10 3.625L10.5 3ZM10.5 5.5C7.73858 5.5 5.5 7.73858 5.5 10.5C5.5 13.2614 7.73858 15.5 10.5 15.5C13.2614 15.5 15.5 13.2614 15.5 10.5C15.5 7.73858 13.2614 5.5 10.5 5.5Z"
                                fill="currentColor"/>
                        </svg>
                    </div>
                </div>

                {/* Search Container with Filter Bar and Search Bar */}
                <div className={styles.searchContainer}>
                    {/* Filter Bar - paginabrede oranje bar met filters */}
                    <div className={styles.filterBarContainer}>
                        <div className={styles.filterBar}>
                            <div className={styles.filterContainer}>
                                {/* Language Filter */}
                                <div className={styles.filterItem}>
                                    <FilterDropdown
                                        type="language"
                                        value={language}
                                        onChange={setLanguage}
                                    />
                                </div>

                                {/* Length Filter - uitklapbaar met slider */}
                                <div className={styles.filterItem}>
                                    <FilterDropdownSlider
                                        value={maxLength}
                                        onChange={setMaxLength}
                                        label="Lengte"
                                    />
                                </div>

                                {/* Era Filter (Multi-select) */}
                                <div className={styles.filterItem}>
                                    <FilterDropdown
                                        type="era"
                                        value={selectedEras}
                                        onChange={setSelectedEras}
                                    />
                                </div>

                                {/* Creative Canvas Filter (disabled mock-up) */}
                                <div className={styles.filterItem} onClick={handleComingSoonClick}>
                                    <FilterToggle
                                        checked={onlyMyDesigns}
                                        onChange={setOnlyMyDesigns}
                                        label="Canvas"
                                        disabled={true}
                                        tooltipText="Binnenkort beschikbaar"
                                    />
                                </div>

                                {/* Meer Filters - toekomstige uitbreiding */}
                                <div className={styles.filterItemAdvanced} onClick={handleComingSoonClick}>
                                    <span className={styles.filterTextAdvanced}>Meer Filters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <SearchErrorBoundary>
                        <SearchBar
                            onSearch={handleSearch}
                            searchTerm={searchTerm}
                            onSearchTermChange={updateSearchTerm}
                        />
                    </SearchErrorBoundary>
                </div>

                {/* Search Results Area - alleen zichtbaar bij search */}
                {searchState !== 'idle' && (
                    <div className={styles.searchResultsArea}>
                        {searchState === 'searching' && (
                            <SearchLoadingState/>
                        )}

                        {searchState === 'results' && (
                            <SearchErrorBoundary>
                                <SearchResults
                                    results={filteredResults}
                                    // onOpenFocusStudio={handleOpenFocusStudio}
                                    searchTerm={searchTerm}
                                    hideSeriesNavigation={false}
                                    initialIndex={carouselPosition}
                                    onNavigateToCanvas={handleNavigateToCanvas}
                                    onNavigateToRecording={handleNavigateToRecording}
                                />
                            </SearchErrorBoundary>
                        )}

                        {searchState === 'error' && (
                            <div className={styles.searchError}>
                                <p>{error}</p>
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* USP Section - altijd zichtbaar */}
            <div className={styles.uspSection}>
                <div className={styles.uspContainer}>
                    <div className={styles.uspColumn}>
                        <div className={styles.uspContent}>
                            <div className={styles.uspHeading}>
                                <h3>Ontdek Poezie Als Nooit Tevoren</h3>
                            </div>
                            <p>Zoek direct hierboven of ga naar geavanceerd zoeken voor uitgebreide gedichten inspiratie</p>
                        </div>
                    </div>

                    <div className={styles.uspColumn}>
                        <div className={styles.uspContent}>
                            <div className={styles.uspHeading}>
                                <h3>Hardop: Spreek jouw favoriete gedicht in</h3>
                            </div>
                            <p>Leg je voordrachten vast en deel je unieke stem, of laat iemand jouw gedicht voordragen</p>
                        </div>
                    </div>

                    <div className={styles.uspColumn}>
                        <div className={styles.uspContent}>
                            <div className={styles.uspHeading}>
                                <h3>Pas jouw poëzie-ervaring aan</h3>
                            </div>
                            <p>Voeg visuele elementen toe om je poëzie echt van jou te maken en bekijk ze op een gevel naar keuze</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gedichten van de Dag - met ref voor scroll-naar-sectie */}
            <div ref={dailyPoemsSectionRef}>
                <DailyPoems/>
            </div>

            {/* Footer - altijd onderaan */}
            <Footer/>
        </div>

    );
}

/**
 * Main HomePage export, wrapped in the DailyPoemsProvider.
 * This ensures all children have access to the shared daily poems state.
 */
export function HomePage() {
    return (
        <DailyPoemsProvider>
            <HomePageContent />
        </DailyPoemsProvider>
    );
}