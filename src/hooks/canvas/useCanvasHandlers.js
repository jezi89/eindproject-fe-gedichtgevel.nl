import {useCallback, useEffect} from "react";
import { useSearchParams } from "react-router";
import {getPoemById} from "@/data/canvas/testdata";
import {
    handleFontSizeChangeUtil,
    handleLineHeightChangeUtil,
    resetLineHeightUtil,
} from "@/utils/canvas/lineHeightUtils";
import {getGeoDataByCity} from "@/data/canvas/cityGeoData";
import fontMetadata from "../../data/font-metadata.json";


export function useCanvasHandlers({ canvasState, currentPoem: poemData = null }) {
    // Access current poem data for Alt-A functionality
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get("poemId");
    // Use provided poemData first, fallback to URL-based lookup
    const currentPoem = poemData || (poemId ? getPoemById(poemId) : null);

    const {
        handleSelect,
        clearSelection,
        selectAll,
        viewportDragEnabled,
        setViewportDragEnabled,
        fontSize,
        setFontSize,
        setLineHeight,
        lineHeightMultiplier,
        setLineHeightMultiplier,
        userHasAdjusted,
        setUserHasAdjusted,

        // Hierarchical color system
        titleColorOverride,
        setTitleColorOverride,
        authorColorOverride,
        setAuthorColorOverride,

        lineOverrides,
        setPendingFontFamily,
        loadFont,
        selectedLines, // Required for per-line logic
        setLineOverrides,
        searchPhotos, // Pexels free image search
        searchPhotosByGeo, // Flickr geo-based search
        searchPhotosByText, // Flickr text search
        getCollectionPhotos,
        setBackgroundImage,
        goToNextPage,
        goToPrevPage,
        searchContext,
        setSearchContext,
        goToNextFlickrPage,
        goToPrevFlickrPage,
        flickrPhotos,
        clearFlickrPhotos,
        setPhotoGridVisible,
    } = canvasState;

    const handleLineSelect = useCallback(
        (index, event) => {
            handleSelect(index, event);
        },
        [handleSelect]
    );

    // Apply color to all selected lines (including title/author sync)
    const handleLineColorChange = useCallback(
        (color) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {...newOverrides[index], fillColor: color};
                    });
                    return newOverrides;
                });

                // Sync title/author overrides for consistency
                if (selectedLines.has(-2)) {
                    setTitleColorOverride(color);
                }
                if (selectedLines.has(-1)) {
                    setAuthorColorOverride(color);
                }
            }
        },
        [selectedLines, setLineOverrides, setTitleColorOverride, setAuthorColorOverride]
    );

    // Reset style for all selected lines (including title/author sync)
    const handleResetSelectedLines = useCallback(() => {
        if (selectedLines.size > 0) {
            setLineOverrides((prev) => {
                const newOverrides = {...prev};
                selectedLines.forEach((index) => {
                    delete newOverrides[index];
                });
                return newOverrides;
            });

            // Reset title/author overrides for consistency
            if (selectedLines.has(-2)) {
                setTitleColorOverride(null);
            }
            if (selectedLines.has(-1)) {
                setAuthorColorOverride(null);
            }

            clearSelection();
        }
    }, [selectedLines, setLineOverrides, setTitleColorOverride, setAuthorColorOverride, clearSelection]);

    // Viewport control
    const handleViewportToggle = useCallback(
        (enabled) => {
            setViewportDragEnabled(enabled);
        },
        [setViewportDragEnabled]
    );

    // Color picker active state
    const handleColorPickerActiveChange = useCallback(
        (isActive) => {
            canvasState.setIsColorPickerActive(isActive);
        },
        [canvasState]
    );

    const handleFontSizeChange = useCallback(
        (newSize) =>
            handleFontSizeChangeUtil(newSize, {
                userHasAdjusted,
                lineHeightMultiplier,
                setFontSize,
                setLineHeight,
            }),
        [userHasAdjusted, lineHeightMultiplier, setFontSize, setLineHeight]
    );

    const handleLineHeightChange = useCallback(
        (newHeight) =>
            handleLineHeightChangeUtil(newHeight, {
                userHasAdjusted,
                setUserHasAdjusted,
                setLineHeight,
                fontSize,
                setLineHeightMultiplier,
            }),
        [
            userHasAdjusted,
            setUserHasAdjusted,
            setLineHeight,
            fontSize,
            setLineHeightMultiplier,
        ]
    );

    const handleResetLineHeight = useCallback(
        () =>
            resetLineHeightUtil({
                currentFontSize: fontSize,
                setLineHeight,
                setLineHeightMultiplier,
                setUserHasAdjusted,
            }),
        [fontSize, setLineHeight, setLineHeightMultiplier, setUserHasAdjusted]
    );

    const handleLineHeightMultiplierChange = useCallback(
        (newMultiplier) => {
            if (!userHasAdjusted) setUserHasAdjusted(true);
            setLineHeightMultiplier(newMultiplier);
            setLineHeight(fontSize * newMultiplier);
        },
        [
            userHasAdjusted,
            setUserHasAdjusted,
            setLineHeightMultiplier,
            setLineHeight,
            fontSize,
        ]
    );

    const handleLineLetterSpacingChange = useCallback(
        (spacing) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            letterSpacing: spacing,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // Font style handlers
    const handleFontWeightChange = useCallback(
        (weight) => {
            canvasState.setFontWeight(weight);
        },
        [canvasState]
    );

    const handleFontStyleChange = useCallback(
        (style) => {
            canvasState.setFontStyle(style);
        },
        [canvasState]
    );

    // Skew handlers (2D transformations)
    const handleSkewXChange = useCallback(
        (value) => {
            canvasState.setSkewX(value);
        },
        [canvasState]
    );

    const handleSkewYChange = useCallback(
        (value) => {
            canvasState.setSkewY(value);
        },
        [canvasState]
    );

    // NIEUW: Line-specific Skew Handlers
    const handleLineSkewXChange = useCallback(
        (value) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            skewX: value,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    const handleLineSkewYChange = useCallback(
        (value) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            skewY: value,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // NIEUW: Line-specific Text Align Handler
    const handleLineTextAlignChange = useCallback(
        (align) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            textAlign: align,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    const handleLineFontSizeChange = useCallback(
        (size) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            fontSize: size,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // Hierarchical color system handlers
    const handleTitleColorChange = useCallback(
        (color) => {
            setTitleColorOverride(color);
            // Sync naar lineOverrides voor consistentie
            setLineOverrides(prev => ({
                ...prev,
                [-2]: {...prev[-2], fillColor: color}
            }));
        },
        [setTitleColorOverride, setLineOverrides]
    );

    const handleAuthorColorChange = useCallback(
        (color) => {
            setAuthorColorOverride(color);
            // Sync naar lineOverrides voor consistentie
            setLineOverrides(prev => ({
                ...prev,
                [-1]: {...prev[-1], fillColor: color}
            }));
        },
        [setAuthorColorOverride, setLineOverrides]
    );

    const handleResetTitleColor = useCallback(() => {
        setTitleColorOverride(null);
        // Ook uit lineOverrides verwijderen
        setLineOverrides(prev => {
            const newOverrides = {...prev};
            if (newOverrides[-2]) {
                const {fillColor, ...rest} = newOverrides[-2];
                if (Object.keys(rest).length === 0) {
                    delete newOverrides[-2];
                } else {
                    newOverrides[-2] = rest;
                }
            }
            return newOverrides;
        });
    }, [setTitleColorOverride, setLineOverrides]);

    const handleResetAuthorColor = useCallback(() => {
        setAuthorColorOverride(null);
        // Ook uit lineOverrides verwijderen
        setLineOverrides(prev => {
            const newOverrides = {...prev};
            if (newOverrides[-1]) {
                const {...rest} = newOverrides[-1];
                if (Object.keys(rest).length === 0) {
                    delete newOverrides[-1];
                } else {
                    newOverrides[-1] = rest;
                }
            }
            return newOverrides;
        });
    }, [setAuthorColorOverride, setLineOverrides]);

    const handleSyncAllColorsToGlobal = useCallback(() => {
        // Count existing overrides for confirmation
        const titleOverride = titleColorOverride !== null;
        const authorOverride = authorColorOverride !== null;
        const lineColorOverrides = Object.values(lineOverrides).filter(
            (override) => override.fillColor
        ).length;

        const totalOverrides =
            (titleOverride ? 1 : 0) + (authorOverride ? 1 : 0) + lineColorOverrides;

        if (totalOverrides === 0) {
            return;
        }

        if (!confirm(`Reset ${totalOverrides} color override${totalOverrides === 1 ? "" : "s"}?`)) {
            return;
        }

        // Reset title and author to global color
        setTitleColorOverride(null);
        setAuthorColorOverride(null);

        // Reset all line overrides to only keep non-color properties
        setLineOverrides((prev) => {
            const newOverrides = {...prev};
            Object.keys(newOverrides).forEach((index) => {
                const override = {...newOverrides[index]};
                delete override.fillColor; // Remove color override

                // If no other overrides remain, remove the entire entry
                if (Object.keys(override).length === 0) {
                    delete newOverrides[index];
                } else {
                    newOverrides[index] = override;
                }
            });
            return newOverrides;
        });
    }, [
        titleColorOverride,
        authorColorOverride,
        lineOverrides,
        setTitleColorOverride,
        setAuthorColorOverride,
        setLineOverrides,
    ]);

    const handleSyncAllFontsToGlobal = useCallback(() => {
        // Count existing font overrides for confirmation
        const lineFontOverrides = Object.values(lineOverrides).filter(
            (override) => override.fontFamily
        ).length;

        if (lineFontOverrides === 0) {
            return;
        }

        if (!confirm(`Reset ${lineFontOverrides} font override${lineFontOverrides === 1 ? "" : "s"}?`)) {
            return;
        }

        // Reset all line font overrides to only keep non-font properties
        let allLinesReset = true;
        setLineOverrides((prev) => {
            const newOverrides = {...prev};
            Object.keys(newOverrides).forEach((index) => {
                const override = {...newOverrides[index]};
                delete override.fontFamily; // Remove font override

                // If no other overrides remain, remove the entire entry
                if (Object.keys(override).length === 0) {
                    delete newOverrides[index];
                } else {
                    newOverrides[index] = override;
                    allLinesReset = false; // Still has other overrides
                }
            });
            return newOverrides;
        });

        // If all lines are reset, set global font to Cormorant Garamond
        if (allLinesReset) {
            loadFont("Cormorant Garamond");
            setPendingFontFamily("Cormorant Garamond");
        }
    }, [lineOverrides, setLineOverrides, loadFont, setPendingFontFamily]);

    const handleFontFamilyChange = useCallback(
        (newFontFamily) => {
            loadFont(newFontFamily);

            // Check if current weight is valid for new font
            const availableWeights = fontMetadata[newFontFamily] || ['400', '700'];
            const currentWeight = canvasState.fontWeight;

            if (!availableWeights.includes(currentWeight)) {
                 const newWeight = availableWeights.includes('400') ? '400' : availableWeights[0];
                 canvasState.setFontWeight(newWeight);
            }

            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            fontFamily: newFontFamily,
                        };
                    });
                    return newOverrides;
                });
            } else {
                setPendingFontFamily(newFontFamily);
            }
        },
        [loadFont, setPendingFontFamily, selectedLines, setLineOverrides, canvasState]
    );

    const handleSearchBackground = useCallback(
        (query) => {
            searchPhotos(query);
            setSearchContext({
                type: "pexels_search",
                query: query,
                source: "pexels",
            });
        },
        [searchPhotos, setSearchContext]
    );

    const handleSetBackground = useCallback(
        (imageData) => {
            if (typeof imageData === 'string') {
                const normalizedData = {
                    url: imageData,
                    thumbnail: imageData,
                    photographer: 'Unknown',
                    source: 'custom',
                    width: null,
                    height: null
                };
                setBackgroundImage(normalizedData);
            } else {
                setBackgroundImage(imageData);
            }
        },
        [setBackgroundImage]
    );

    const handleCitySearch = useCallback(
        (city) => {
            const geoData = getGeoDataByCity(city);
            if (geoData) {
                searchPhotosByGeo(
                    {...geoData, city, tags: "gevel,facade,architecture"},
                    true
                );
                setSearchContext({
                    type: "flickr_city",
                    query: city,
                    source: "flickr",
                });
            } else {
                clearFlickrPhotos();
                setSearchContext({
                    type: "flickr_city",
                    query: city,
                    source: "flickr",
                });
            }
        },
        [searchPhotosByGeo, clearFlickrPhotos, setSearchContext]
    );

    const handlePremiumSearch = useCallback(
        (query) => {
            searchPhotosByText(query);
            setSearchContext({
                type: "flickr_text",
                query: query,
                source: "flickr",
            });
        },
        [searchPhotosByText, setSearchContext]
    );

    const handleNextPage = useCallback(() => {
        if (flickrPhotos && flickrPhotos.length > 0) {
            goToNextFlickrPage();
        } else {
            goToNextPage();
        }
    }, [flickrPhotos, goToNextFlickrPage, goToNextPage]);

    const handlePrevPage = useCallback(() => {
        if (flickrPhotos && flickrPhotos.length > 0) {
            goToPrevFlickrPage();
        } else {
            goToPrevPage();
        }
    }, [flickrPhotos, goToPrevFlickrPage, goToPrevPage]);

    const handleResetToCollection = useCallback(() => {
        clearFlickrPhotos();
        getCollectionPhotos();
        setSearchContext({
            type: "collection",
            query: "",
            source: "pexels",
        });
    }, [clearFlickrPhotos, getCollectionPhotos, setSearchContext]);

    const handleOpenPhotoGrid = useCallback(() => {
        setPhotoGridVisible(true);
    }, [setPhotoGridVisible]);

    const {moveMode} = canvasState;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                clearSelection();
            }

            if (event.altKey && event.key === "a") {
                event.preventDefault();
                if (currentPoem?.lines) {
                    canvasState.selectAllIncludingTitleAuthor(currentPoem.lines.length);
                }
            }

            if (
                event.key.toLowerCase() === "c" &&
                moveMode === "edit" &&
                !viewportDragEnabled
            ) {
                setViewportDragEnabled(true);
            }
        };

        const handleKeyUp = (event) => {
            if (
                event.key.toLowerCase() === "c" &&
                moveMode === "edit" &&
                viewportDragEnabled
            ) {
                setViewportDragEnabled(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [
        viewportDragEnabled,
        clearSelection,
        selectAll,
        currentPoem,
        setViewportDragEnabled,
        moveMode,
        canvasState.selectAllIncludingTitleAuthor,
    ]);


    return {
        handleLineSelect,
        handleLineColorChange,
        handleLineLetterSpacingChange,
        handleLineFontSizeChange, // <-- NIEUW: fontSize handler
        handleResetSelectedLines, // <-- Hernoemd voor duidelijkheid
        handleViewportToggle,
        handleColorPickerActiveChange,
        handleFontSizeChange,
        handleLineHeightChange,
        handleResetLineHeight,
        handleLineHeightMultiplierChange,

        // Hierarchical color system handlers
        handleTitleColorChange,
        handleAuthorColorChange,
        handleResetTitleColor,
        handleResetAuthorColor,
        handleSyncAllColorsToGlobal,
        handleSyncAllFontsToGlobal,
        handleFontFamilyChange, // <-- Exporteer de nieuwe handlerv

        // Font style handlers
        handleFontWeightChange,
        handleFontStyleChange,

        // Skew handlers
        handleSkewXChange,
        handleSkewYChange,
        handleLineSkewXChange, // <-- EXPORT
        handleLineSkewYChange, // <-- EXPORT
        handleLineTextAlignChange, // <-- EXPORT

        handleSearchBackground,
        handlePremiumSearch, // <-- NEW: Export premium search handler
        handleSetBackground,
        handleNextPage, // <-- Exporteren
        handlePrevPage, // <-- Exporteren
        handleCitySearch, // <-- Exporteer de nieuwe handler
        handleResetToCollection, // <-- NEW: Export reset handler
        handleOpenPhotoGrid, // <-- NEW: Export open photo grid handler
    };
}
