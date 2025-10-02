/**
 * useHeightCalculation Hook
 * Manages all height calculation logic for expandable poems
 * Extracted from PoemResultItem to reduce complexity
 */

import {useEffect, useMemo, useState} from 'react';
import {calculateExpandedHeight, clearCarouselCache, createResizeHandler, getCarouselPoemHeight, getResponsiveLayout} from '@/utils/poemHeightCalculator';

/**
 * Custom hook for managing poem height calculations
 * @param {Object} poem - The poem object
 * @param {number} index - Poem index in list
 * @param {Array} allPoems - All poems in carousel/list
 * @param {string} navigationDirection - Navigation direction for carousel
 * @param {Object} expandablePreview - Preview info from createExpandablePreview
 * @param {Object} preCalculatedHeight - Pre-calculated height if available
 * @returns {Object} Height calculation info and screen layout
 */
export const useHeightCalculation = (
    poem,
    index,
    allPoems,
    navigationDirection,
    expandablePreview,
    preCalculatedHeight = null
) => {
    // Screen layout state
    const [screenLayout, setScreenLayout] = useState(() => getResponsiveLayout());

    // Carousel height state
    const [carouselHeightInfo, setCarouselHeightInfo] = useState(null);

    // Loading state for async height calculations
    const [isLoadingHeight, setIsLoadingHeight] = useState(false);

    // Responsive layout updates
    useEffect(() => {
        const handleResize = createResizeHandler(() => {
            setScreenLayout(getResponsiveLayout());
            clearCarouselCache(); // Clear cache on resize
        });

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Direct height calculation for single results or non-expandable poems
    const directHeightCalculation = useMemo(() => {
        // Guard against invalid input
        if (!poem || !poem.lines || !Array.isArray(poem.lines)) return null;
        if (poem.lines.length <= 4) return null;
        if (!expandablePreview?.isExpandable) return null;

        const cardWidth = screenLayout.cardWidth || 570;

        // For single result: direct calculation
        if (!allPoems || allPoems.length <= 1) {
            return calculateExpandedHeight(poem, window.innerWidth, cardWidth, true);
        }

        // For carousel: will be handled asynchronously
        return null;
    }, [poem, screenLayout, allPoems, expandablePreview]);

    // Async height loading for carousel
    useEffect(() => {
        // Guard against invalid input
        if (!poem || !poem.lines || !Array.isArray(poem.lines)) return;

        // Skip if not expandable or not in carousel mode
        if (poem.lines.length <= 4) return;
        if (!expandablePreview?.isExpandable) return;
        if (!allPoems || allPoems.length <= 1) return;

        const loadCarouselHeight = async () => {
            setIsLoadingHeight(true);
            try {
                const heightInfo = await getCarouselPoemHeight(
                    poem,
                    index,
                    allPoems,
                    navigationDirection || 'initial',
                    window.innerWidth,
                    screenLayout.cardWidth || 570
                );
                setCarouselHeightInfo(heightInfo);
            } catch (error) {
                console.error('Error loading carousel height:', error);
                // Fallback to direct calculation
                const fallback = calculateExpandedHeight(
                    poem,
                    window.innerWidth,
                    screenLayout.cardWidth || 570,
                    false
                );
                setCarouselHeightInfo(fallback);
            } finally {
                setIsLoadingHeight(false);
            }
        };

        loadCarouselHeight();
    }, [poem, index, allPoems, navigationDirection, screenLayout, expandablePreview]);

    // Combine all height info sources
    const finalHeightInfo = (() => {
        if (!expandablePreview?.isExpandable) {
            return null;
        }

        const heightInfo = preCalculatedHeight || carouselHeightInfo || directHeightCalculation;
        return heightInfo ? {...heightInfo, canExpand: true} : null;
    })();

    return {
        screenLayout,
        finalHeightInfo,
        isLoadingHeight,
        carouselHeightInfo,
        directHeightCalculation
    };
};

