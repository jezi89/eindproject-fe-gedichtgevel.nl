// TODO useSearchLayout.js hook werking checken en testen
/**
 * useSearchLayout Hook
 * Manages layout state and responsive behavior for search results
 * Extracted from SearchResults for better separation of concerns
 */

import {useState, useEffect, useCallback, useMemo} from 'react';
import {
    getLayoutClass,
    getVisibleResults,
    getActualIndex,
    isCarouselMode,
    getIndicesToCalculate,
    mapVisibleIndices,
    getIsDesktop
} from '@/utils/searchLayoutUtils';

export const useSearchLayout = (results, currentIndex) => {
    const [isDesktop, setIsDesktop] = useState(() => getIsDesktop());

    // Derived values
    const resultCount = results?.length || 0;
    const hasMultiple = resultCount > 1;
    const isCarousel = isCarouselMode(resultCount);

    // Handle responsive updates
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(getIsDesktop());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Layout calculations
    const layoutClass = getLayoutClass(resultCount, isDesktop);

    const visibleResults = useMemo(() => {
        return getVisibleResults(results, currentIndex, resultCount, isDesktop, isCarousel);
    }, [results, currentIndex, resultCount, isDesktop, isCarousel]);

    const visibleIndices = useMemo(() => {
        return mapVisibleIndices(visibleResults, currentIndex, resultCount, isCarousel);
    }, [visibleResults, currentIndex, resultCount, isCarousel]);

    // Helper function to get actual index from display index
    const getActualIndexFromDisplay = useCallback((displayIndex) => {
        return getActualIndex(displayIndex, currentIndex, resultCount, isCarousel);
    }, [currentIndex, resultCount, isCarousel]);

    // Calculate indices that need height pre-calculation
    const indicesToCalculate = useMemo(() => {
        return getIndicesToCalculate(
            results,
            currentIndex,
            resultCount,
            isCarousel,
            isDesktop,
            getVisibleResults
        );
    }, [results, currentIndex, resultCount, isCarousel, isDesktop]);

    return {
        // State
        isDesktop,

        // Derived values
        resultCount,
        hasMultiple,
        isCarousel,
        layoutClass,

        // Layout data
        visibleResults,
        visibleIndices,
        indicesToCalculate,

        // Helper functions
        getActualIndexFromDisplay
    };
};

export default useSearchLayout;