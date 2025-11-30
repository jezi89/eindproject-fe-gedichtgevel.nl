/**
 * CarouselArrows Component
 * Intelligent carousel navigation arrows with dynamic positioning
 * Handles complex scroll boundaries and collapse reset behavior
 * Extracted from SearchResults for better separation of concerns
 */

import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from './Carrousel.module.scss';
import ArrowLeft from '@/assets/icons/arrow-left.svg?react';
import ArrowRight from '@/assets/icons/arrow-right.svg?react';

// CarouselArrows component definition
export const CarouselArrows = memo(({
                                        onPrevious,
                                        onNext,
                                        hasMultiple,
                                        allowDynamicPositioning = false,
                                        hasAnyExpanded = false,
                                        searchResultsRef = null,
                                        onCollapseEvent = null,
                                        canvasMode = false,
                                        className = '',
                                        isOverlay = false
                                    }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [dynamicPosition, setDynamicPosition] = useState(0);
    const [positioningMode, setPositioningMode] = useState('static'); // 'static', 'dynamic', 'hanging'
    const [shouldTrackScroll, setShouldTrackScroll] = useState(false);
    const lastScrollY = useRef(window.scrollY);
    const navbarHeight = useRef(60); // Approximate navbar height

    if (!hasMultiple) return null;

    // Calculate static position for collapsed state
    const calculateStaticPosition = useCallback(() => {
        if (!searchResultsRef?.current) {
            return 0;
        }

        const searchResults = searchResultsRef.current;

        // Voor canvas mode: gebruik searchResultsArea als referentie
        if (canvasMode) {
            // Zoek naar searchResultsArea in de parent hierarchy
            let searchResultsArea = searchResults.closest('[class*="searchResultsArea"]');
            if (!searchResultsArea) {
                // Fallback: zoek binnen huidige container
                searchResultsArea = searchResults.querySelector('[class*="searchResultsArea"]') || searchResults;
            }

            const areaRect = searchResultsArea.getBoundingClientRect();
            const arrowHeight = 80; // Arrow button hoogte uit CSS

            // Bereken positie: bovenkant area + helft van minimum card hoogte (450px) - halve arrow hoogte
            const targetPosition = window.scrollY + areaRect.top + (450 / 2) - (arrowHeight / 2);
            return targetPosition;
        }

        // Voor HomePage: betere berekening voor statische arrows
        if (allowDynamicPositioning) {
            // Gebruik resultsList maar verbeter de berekening
            const resultsList = searchResults.querySelector('[class*="resultsList"]');

            if (resultsList) {
                const listRect = resultsList.getBoundingClientRect();
                const arrowHeight = 80; // Arrow button hoogte

                // Voor homepage: neem eerste 225px van de lijst (helft van 450px min-height)
                const targetY = listRect.top + 225 - (arrowHeight / 2);
                return window.scrollY + targetY;
            }
        }

        // FALLBACK: zoek searchResultsArea voor beide modes
        let searchResultsArea = searchResults.closest('[class*="searchResultsArea"]');
        if (!searchResultsArea) {
            searchResultsArea = document.querySelector('[class*="searchResultsArea"]') || searchResults;
        }

        const areaRect = searchResultsArea.getBoundingClientRect();
        const arrowHeight = 80;

        // Gebruik 225px offset (helft van 450px min-height) vanaf bovenkant area
        const fallbackPosition = window.scrollY + areaRect.top + 225 - (arrowHeight / 2);
        return fallbackPosition;
    }, [searchResultsRef, allowDynamicPositioning, canvasMode]);

    // Calculate positioning mode based on expanded state
    useEffect(() => {
        if (!allowDynamicPositioning) {
            setPositioningMode('static');
            setShouldTrackScroll(false);
            return;
        }

        if (hasAnyExpanded) {
            setPositioningMode('dynamic');
            setShouldTrackScroll(true);
        } else {
            setPositioningMode('static');
            setShouldTrackScroll(false);

            // Calculate proper static position for collapsed state
            const staticPos = calculateStaticPosition();
            setDynamicPosition(staticPos);
        }
    }, [allowDynamicPositioning, hasAnyExpanded, calculateStaticPosition]);

    // Initial position calculation on mount and search results change
    useEffect(() => {
        if (searchResultsRef?.current && positioningMode === 'static') {
            // Small delay to ensure DOM is fully rendered and animations settle
            setTimeout(() => {
                const staticPos = calculateStaticPosition();
                setDynamicPosition(staticPos);
            }, 200); // Slightly longer delay for layout stability
        }
    }, [searchResultsRef, positioningMode, calculateStaticPosition]);

    // Reset to static position on any collapse event
    useEffect(() => {
        if (onCollapseEvent) {
            setPositioningMode('static');
            setShouldTrackScroll(false);

            // Calculate new static position
            const staticPos = calculateStaticPosition();
            setDynamicPosition(staticPos);

            // Resume dynamic tracking after transition if still expanded
            setTimeout(() => {
                if (hasAnyExpanded && allowDynamicPositioning) {
                    setPositioningMode('dynamic');
                    setShouldTrackScroll(true);
                }
            }, 300); // Wait for collapse transition
        }
    }, [onCollapseEvent, hasAnyExpanded, allowDynamicPositioning, calculateStaticPosition]);

    // Calculate arrow position with boundary constraints
    const calculateArrowPosition = useCallback(() => {
        if (!searchResultsRef?.current || !shouldTrackScroll) {
            return 0;
        }

        const searchResults = searchResultsRef.current;
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollY + (viewportHeight / 2) - navbarHeight.current;

        // Find resultsList for boundary calculations
        const resultsList = searchResults.querySelector('.resultsList');

        if (!resultsList) {
            return viewportCenter;
        }

        // UPPER BOUNDARY: Huidige statische positie (niet hoger dan dit)
        const staticPosition = calculateStaticPosition();
        const upperBound = staticPosition;

        // LOWER BOUNDARY: 50vh - navbar vanaf onderkant resultsList
        const listBottom = resultsList.offsetTop + resultsList.offsetHeight;
        const lowerBound = listBottom - (viewportHeight * 0.5) + navbarHeight.current;

        // Dynamic positioning: viewport center binnen boundaries
        setPositioningMode('dynamic');

        // Clamp position tussen upper en lower boundaries
        const clampedPosition = Math.max(upperBound, Math.min(viewportCenter, lowerBound));

        return clampedPosition;
    }, [searchResultsRef, shouldTrackScroll, calculateStaticPosition]);

    // Scroll handler with dynamic positioning
    useEffect(() => {
        if (!shouldTrackScroll) return;

        let scrollTimeout;
        const handleScroll = () => {
            // Brief hide during scroll for smooth visual
            setIsVisible(false);

            // Calculate new position
            const newPosition = calculateArrowPosition();
            setDynamicPosition(newPosition);

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsVisible(true);
            }, 100); // Shorter delay for dynamic positioning
        };

        window.addEventListener('scroll', handleScroll, {passive: true});

        // Initial position calculation
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [shouldTrackScroll, calculateArrowPosition]);

    // Navigation handlers
    const handleNavigation = useCallback((direction) => {
        if (direction === 'prev') {
            onPrevious();
        } else {
            onNext();
        }
    }, [onPrevious, onNext]);

    // Calculate container style based on positioning mode
    const containerStyle = useMemo(() => {
        const baseStyle = {};

        // Alleen dynamic/hanging positioning heeft custom top position nodig
        // Static en canvas mode gebruiken nu CSS centering
        if (positioningMode === 'dynamic' || positioningMode === 'hanging') {
            if (dynamicPosition > 0) {
                baseStyle.top = `${dynamicPosition}px`;
            }
        }

        return baseStyle;
    }, [dynamicPosition, positioningMode]);

    const containerClasses = useMemo(() => {
        const classes = [styles.arrowsContainer];
        if (className) classes.push(className);

        if (isVisible) {
            classes.push(styles.arrowsVisible);
        } else {
            classes.push(styles.arrowsHidden);
        }

        // Canvas mode gets fixed positioning regardless of other logic
        if (canvasMode) {
            classes.push(styles.arrowsCanvasMode);
        } else if (positioningMode === 'dynamic') {
            classes.push(styles.arrowsDynamic);
        } else if (positioningMode === 'hanging') {
            classes.push(styles.arrowsHanging);
        } else {
            classes.push(styles.arrowsStatic);
        }

        return classes.join(' ');
    }, [isVisible, positioningMode, canvasMode]);

    return (
        <div
            className={containerClasses}
            style={containerStyle}
        >
            <button
                className={`${styles.arrowButton} ${isOverlay ? styles.overlayArrow : styles.homeArrow}`}
                onClick={() => handleNavigation('prev')}
                aria-label="Vorig gedicht"
            >
                {isOverlay ? '‹' : <ArrowLeft />}
            </button>
            <button
                className={`${styles.arrowButton} ${isOverlay ? styles.overlayArrow : styles.homeArrow}`}
                onClick={() => handleNavigation('next')}
                aria-label="Volgend gedicht"
            >
                {isOverlay ? '›' : <ArrowRight />}
            </button>
        </div>
    );
});
