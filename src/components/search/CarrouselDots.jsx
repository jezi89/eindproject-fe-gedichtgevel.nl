import {memo, useState, useRef, useEffect} from 'react';
import styles from './Carrousel.module.scss';
import {calculateIndicatorConfig, formatIndicatorElements, calculateDotNavigation, getAvailableDecades} from '@/utils/carrouselIndicatorUtils.js';

const CarouselDots = memo(({totalCount, currentIndex, onNavigate, hideSeriesNavigation = false, hideRangeIndicator = false}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const dotsContainerRef = useRef(null);
    const config = calculateIndicatorConfig(totalCount, currentIndex);

    const elements = formatIndicatorElements(config);
    const availableDecades = getAvailableDecades(totalCount);

    // Click outside handler voor dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown]);

    // Position series dropdown relative to series button
    useEffect(() => {
        if (showDropdown && dropdownRef.current && dotsContainerRef.current) {
            const seriesButton = dotsContainerRef.current.querySelector(`.${styles.seriesButton}`);
            const dropdown = dropdownRef.current;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (seriesButton) {
                const buttonRect = seriesButton.getBoundingClientRect();

                // Position dropdown below the series button
                let top = buttonRect.bottom + 8; // 8px below button
                let left = buttonRect.left; // Align with left edge of button

                // Adjust horizontal position to stay within viewport
                const dropdownWidth = 280; // min-width from CSS
                if (left + dropdownWidth > viewportWidth - 16) {
                    left = viewportWidth - dropdownWidth - 16;
                } else if (left < 16) {
                    left = 16;
                }

                // Adjust vertical position if dropdown would go below viewport
                const dropdownHeight = Math.min(350, availableDecades.length * 60 + 80); // Estimate height
                if (top + dropdownHeight > viewportHeight - 20) {
                    // Position above button instead
                    top = buttonRect.top - dropdownHeight - 8;
                    // If still doesn't fit, position at top of viewport
                    if (top < 20) {
                        top = 20;
                    }
                }

                dropdown.style.top = `${top}px`;
                dropdown.style.left = `${left}px`;
            }
        }
    }, [showDropdown, availableDecades.length]);

    // Early return NA alle hooks om React hooks error te voorkomen
    if (!config.showIndicator) return null;

    const handleDotClick = (dotIndex, isWrappedDot = false) => {
        if (onNavigate) {
            let targetIndex;

            if (isWrappedDot) {
                // Voor wrapped dots: direct naar de echte index (0, 1, 2, etc.)
                targetIndex = dotIndex;
            } else {
                // Voor normale dots: gebruik de bestaande logica
                targetIndex = calculateDotNavigation(dotIndex, config);
            }

            if (targetIndex !== null && targetIndex !== currentIndex) {
                onNavigate(targetIndex);
            }
        }
    };

    const handleDecadeClick = (decade) => {
        if (onNavigate) {
            // FEATURE 1: Auto-collapse all poems when navigating to new series
            if (typeof onNavigate === 'function') {
                // Call navigation with series change flag to trigger auto-collapse
                onNavigate(decade.startIndex, {seriesChange: true});
            } else {
                onNavigate(decade.startIndex);
            }

            // Close dropdown immediately after selection
            setShowDropdown(false);
        }
    };

    // Format range text voor wrap-around
    const formatRangeText = () => {
        if (config.currentRange.wrappedEnd !== null) {
            // Wrap-around case: toon alle 3 nummers
            const first = config.currentRange.start;
            const second = config.currentRange.end;
            const third = config.currentRange.wrappedEnd;
            return `${first}, ${second}, ${third} van ${config.totalCount}`;
        }
        // Normal case: show all 3 visible poems
        const first = config.currentRange.start;
        const second = config.currentRange.end;
        const third = config.currentRange.third;
        return `${first}, ${second}, ${third} van ${config.totalCount}`;
    };

    // Return only the indicators wrapper - no dotsContainer
    return (
        <>
            <div ref={dotsContainerRef} className={styles.indicatorWrapper}>
                {elements.map((element) => {
                    switch (element.type) {
                        case 'dot':
                            return (
                                <button
                                    key={element.key}
                                    className={`${styles.dot} ${element.active ? styles.dotActive : ''} ${element.isPlaceholder ? styles.dotPlaceholder : ''}`}
                                    onClick={() => {
                                        if (!element.isPlaceholder) {
                                            const dotIndex = parseInt(element.key.split('-')[1]);
                                            const isWrappedDot = element.key.startsWith('wrap-dot-');
                                            const isNextDot = element.key.startsWith('next-dot-');

                                            if (isWrappedDot) {
                                                // Voor wrapped dots: direct naar index (0, 1, 2)
                                                handleDotClick(dotIndex, true);
                                            } else if (isNextDot) {
                                                // Voor next decade dots: bereken echte poem index
                                                const actualPoemIndex = element.poemNumber - 1; // poemNumber is 1-based
                                                handleDotClick(actualPoemIndex, true); // Treat as direct navigation
                                            } else {
                                                // Voor normale dots binnen huidige decade
                                                handleDotClick(dotIndex, false);
                                            }
                                        }
                                    }}
                                    aria-label={`Gedicht ${element.poemNumber || element.key.split('-')[1]}`}
                                    aria-current={element.active ? 'true' : 'false'}
                                    title={`Gedicht ${element.poemNumber || ''}`}
                                    disabled={element.isPlaceholder}
                                />
                            );

                        case 'roman':
                            return (
                                <span
                                    key={element.key}
                                    className={`${styles.roman} ${element.isDecadeIndicator ? styles.romanDecade : ''}`}
                                    title={element.isDecadeIndicator ? `Tiental ${element.numeral}` : null}
                                >
                                    {element.numeral}
                                </span>
                            );

                        case 'separator':
                            return (
                                <span
                                    key={element.key}
                                    className={`${styles.separator} ${element.isDecadeSeparator ? styles.decadeSeparator : ''}`}
                                >
                                    {element.content}
                                </span>
                            );

                        default:
                            return null;
                    }
                })}

                {/* Series button - only show when not hidden and multiple decades available */}
                {!hideSeriesNavigation && availableDecades.length > 1 && (
                    <button
                        className={`${styles.seriesButton} ${showDropdown ? styles.seriesButtonActive : ''}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                        aria-label="Navigeer door gedichtenseries"
                        title="Kies een serie van gedichten"
                    >
                        <span className={styles.seriesIcon}>📚</span>
                        <span className={styles.seriesText}>Series</span>
                        <span className={`${styles.seriesArrow} ${showDropdown ? styles.seriesArrowUp : ''}`}>▼</span>
                    </button>
                )}
            </div>

            {/* Series dropdown */}
            {showDropdown && !hideSeriesNavigation && (
                <div ref={dropdownRef} className={styles.seriesDropdown}>
                    <div className={styles.seriesHeader}>
                        <h3>Gedichtenseries</h3>
                        <p>Navigeer door verschillende series van {totalCount} gedichten</p>
                    </div>
                    <div className={styles.seriesOptions}>
                        {availableDecades.map((decade, index) => {
                            const startPoem = decade.decade * 10 + 1;
                            const endPoem = Math.min((decade.decade + 1) * 10, totalCount);
                            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                            const romanNumeral = romanNumerals[index] || `${index + 1}`;

                            return (
                                <button
                                    key={decade.decade}
                                    className={styles.seriesOption}
                                    onClick={() => handleDecadeClick(decade)}
                                    title={`Ga naar serie ${romanNumeral}: gedichten ${startPoem}-${endPoem}`}
                                >
                                    <span className={styles.seriesRoman}>
                                        {romanNumeral}
                                    </span>
                                    <span className={styles.seriesRange}>
                                        ({startPoem}-{endPoem})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Range indicator - only show on homepage (when not hidden) */}
            {!hideRangeIndicator && (
                <div className={styles.rangeIndicator}>
                    {formatRangeText()}
                </div>
            )}
        </>
    );
});

CarouselDots.displayName = 'CarouselDots';

export default CarouselDots;