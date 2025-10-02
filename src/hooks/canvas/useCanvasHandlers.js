// src/hooks/canvas/useCanvasHandlers.js

import {useCallback, useEffect} from "react";
import {useSearchParams} from "react-router";
// Import paths aangepast voor hoofdproject
import {getPoemById} from "@/data/canvas/testdata";
import {
    handleFontSizeChangeUtil,
    handleLineHeightChangeUtil,
    resetLineHeightUtil,
} from "@/utils/canvas/lineHeightUtils";
import {getGeoDataByCity} from "@/data/canvas/cityGeoData";
import {Transform3D} from "@/utils/canvas/Transform3D.js";


export function useCanvasHandlers(canvasState, poemData = null) {
    // Access current poem data for Alt-A functionality
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get("poemId");
    // Use provided poemData first, fallback to URL-based lookup
    const currentPoem = poemData || (poemId ? getPoemById(poemId) : null);

    const {
        handleSelect, // <-- Nieuwe handler uit useSelection
        clearSelection, // <-- Nieuwe handler uit useSelection
        selectAll, // <-- NEW: Add selectAll function
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

        lineOverrides, // <-- DEZE TOEVOEGEN
        setPendingFontFamily, // <-- De nieuwe setter
        loadFont, // <-- Nieuw, van de font manager
        selectedLines, // <-- Belangrijk voor per-regel logica
        setLineOverrides,
        searchPhotos, // <-- Pexels voor vrije zoekopdrachten
        searchPhotosByGeo, // <-- NIEUW: Onze Flickr specialist
        searchPhotosByText, // <-- NIEUW: Flickr text-only search
        getCollectionPhotos,
        setBackgroundImage, // <-- van useCanvasState
        goToNextPage, // <-- Nieuw van usePexels
        goToPrevPage, // <-- Nieuw van usePexels
        searchContext, // <-- Nieuwe search context state
        setSearchContext, // <-- Nieuwe search context setter
        goToNextFlickrPage, // <-- NIEUW
        goToPrevFlickrPage, // <-- NIEUW: Voor vorige pagina
        flickrPhotos, // <-- NIEUW: om te checken welke bron actief is
        clearFlickrPhotos, // <-- NIEUW: om Flickr te resetten
        setPhotoGridVisible, // <-- van useCanvasState

        // 3D transformation state
        lineTransforms,
        setLineTransforms,
        global3DSettings,
        setGlobal3DSettings,
    } = canvasState;

    // Line selection handler is nu een simpele doorgever
    const handleLineSelect = useCallback(
        (index, event) => {
            handleSelect(index, event);
        },
        [handleSelect]
    );

    // Past kleur toe op ALLE geselecteerde regels (inclusief titel/auteur sync)
    const handleLineColorChange = useCallback(
        (color) => {
            console.log('🎨 handleLineColorChange called with color:', color, 'selectedLines:', Array.from(selectedLines));
            if (selectedLines.size > 0) {
                // Update lineOverrides voor alle geselecteerde regels
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        console.log('🎨 Setting color override for line', index, ':', color);
                        newOverrides[index] = {...newOverrides[index], fillColor: color};
                    });
                    console.log('🎨 New lineOverrides:', newOverrides);
                    return newOverrides;
                });

                // NIEUW: Sync titel/auteur overrides voor bidirectionele consistentie
                if (selectedLines.has(-2)) {
                    console.log('🎯 Syncing title color to titleColorOverride:', color);
                    setTitleColorOverride(color);
                }
                if (selectedLines.has(-1)) {
                    console.log('🎯 Syncing author color to authorColorOverride:', color);
                    setAuthorColorOverride(color);
                }
            }
        },
        [selectedLines, setLineOverrides, setTitleColorOverride, setAuthorColorOverride]
    );

    // Reset de stijl voor ALLE geselecteerde regels (inclusief titel/auteur sync)
    const handleResetSelectedLines = useCallback(() => {
        if (selectedLines.size > 0) {
            // Reset lineOverrides voor alle geselecteerde regels
            setLineOverrides((prev) => {
                const newOverrides = {...prev};
                selectedLines.forEach((index) => {
                    // Verwijder de hele override voor de geselecteerde regel
                    // Simpeler dan individuele properties verwijderen
                    delete newOverrides[index];
                });
                return newOverrides;
            });

            // NIEUW: Reset titel/auteur overrides voor bidirectionele consistentie
            if (selectedLines.has(-2)) {
                console.log('🎯 Resetting title color override');
                setTitleColorOverride(null);
            }
            if (selectedLines.has(-1)) {
                console.log('🎯 Resetting author color override');
                setAuthorColorOverride(null);
            }

            clearSelection(); // Deselecteer na het resetten
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
            console.log('🎨 Color picker active state changed to:', isActive);
            canvasState.setIsColorPickerActive(isActive);
        },
        [canvasState]
    );

    // Font size, line height, etc. blijven hetzelfde...
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

    // Skew handlers
    const handleSkewXChange = useCallback(
        (skewX) => {
            canvasState.setSkewX(skewX);
        },
        [canvasState]
    );

    const handleSkewYChange = useCallback(
        (skewY) => {
            canvasState.setSkewY(skewY);
        },
        [canvasState]
    );

    const handleSkewZChange = useCallback(
        (skewZ) => {
            canvasState.setSkewZ(skewZ);
        },
        [canvasState]
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
            console.log("🎯 handleTitleColorChange called with:", color);
            setTitleColorOverride(color);
            // Sync naar lineOverrides voor consistentie
            setLineOverrides(prev => ({
                ...prev,
                [-2]: {...prev[-2], fillColor: color}
            }));
            console.log("🎯 setTitleColorOverride called");
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
            alert("Er zijn geen kleur overrides om te resetten.");
            return;
        }

        // Simple confirmation dialog
        const confirmMessage =
            `Dit zal ${totalOverrides} kleur override${
                totalOverrides === 1 ? "" : "s"
            } verwijderen:\n\n` +
            (titleOverride ? "• Titel kleur override\n" : "") +
            (authorOverride ? "• Auteur kleur override\n" : "") +
            (lineColorOverrides > 0
                ? `• ${lineColorOverrides} gedichtregels kleur override${
                    lineColorOverrides === 1 ? "" : "s"
                }\n`
                : "") +
            "\nAlle kleuren zullen de globale kleur volgen. Doorgaan?";

        if (!confirm(confirmMessage)) {
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
            alert("Er zijn geen lettertype overrides om te resetten.");
            return;
        }

        // Simple confirmation dialog
        const confirmMessage =
            `Dit zal ${lineFontOverrides} lettertype override${
                lineFontOverrides === 1 ? "" : "s"
            } verwijderen:\n\n` +
            `• ${lineFontOverrides} gedichtregels lettertype override${
                lineFontOverrides === 1 ? "" : "s"
            }\n\n` +
            "Alle regels zullen het globale lettertype volgen. Doorgaan?";

        if (!confirm(confirmMessage)) {
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
            // Taak 1: Zorg dat het lettertype geladen wordt (dit gebeurt altijd)
            loadFont(newFontFamily);

            // 2. Leg de 'intentie' van de gebruiker vast
            if (selectedLines.size > 0) {
                // Pas de override toe op de geselecteerde regels
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
                // Zet het lettertype in de wachtrij voor de globale stijl
                setPendingFontFamily(newFontFamily);
            }
        },
        [loadFont, setPendingFontFamily, selectedLines, setLineOverrides]
    );

    // NIEUWE HANDLERS
    const handleSearchBackground = useCallback(
        (query) => {
            searchPhotos(query);
            // Update search context voor Pexels vrij zoeken
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
            // Normalize: if string provided, convert to proper object structure
            if (typeof imageData === 'string') {
                console.log('⚠️ handleSetBackground: Converting string to object:', imageData);
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
                // Already an object, use as-is
                setBackgroundImage(imageData);
            }
        },
        [setBackgroundImage]
    );

    const handleCitySearch = useCallback(
        (city) => {
            const geoData = getGeoDataByCity(city);
            if (geoData) {
                // We geven nu een object mee, inclusief de stadsnaam voor de tags
                searchPhotosByGeo(
                    {...geoData, city, tags: "gevel,facade,architecture"},
                    true
                );
                // Update search context voor Flickr stad zoeken
                setSearchContext({
                    type: "flickr_city",
                    query: city,
                    source: "flickr",
                });
            } else {
                // Geen Pexels fallback meer - toon lege resultaten
                clearFlickrPhotos();
                // Update search context voor niet gevonden stad
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
            // Update search context voor Flickr text search
            setSearchContext({
                type: "flickr_text",
                query: query,
                source: "flickr",
            });
        },
        [searchPhotosByText, setSearchContext]
    );

    // --- NIEUWE HANDLERS VOOR PAGINERING ---
    const handleNextPage = useCallback(() => {
        // Als er flickr foto's zijn, gebruik de flickr paginering
        if (flickrPhotos && flickrPhotos.length > 0) {
            goToNextFlickrPage();
        } else {
            goToNextPage();
        }
    }, [flickrPhotos, goToNextFlickrPage, goToNextPage]);

    const handlePrevPage = useCallback(() => {
        // Switch tussen Flickr en Pexels paginering
        if (flickrPhotos && flickrPhotos.length > 0) {
            goToPrevFlickrPage();
        } else {
            goToPrevPage();
        }
    }, [flickrPhotos, goToPrevFlickrPage, goToPrevPage]);

    // NEW: Handler to reset to default collection
    const handleResetToCollection = useCallback(() => {
        // Eerst Flickr photos wissen
        clearFlickrPhotos();

        // Dan Pexels collection laden
        getCollectionPhotos();

        // Update search context naar collection
        setSearchContext({
            type: "collection",
            query: "",
            source: "pexels",
        });
    }, [clearFlickrPhotos, getCollectionPhotos, setSearchContext]);

    // NEW: Handler to open photo grid
    const handleOpenPhotoGrid = useCallback(() => {
        setPhotoGridVisible(true);
    }, [setPhotoGridVisible]);

    // Get moveMode from canvasState for CTRL+drag logic
    const {moveMode} = canvasState;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                clearSelection(); // <-- Gebruik de nieuwe clearSelection functie
            }

            // NEW: Alt-A select all functionality
            if (event.altKey && event.key === "a") {
                event.preventDefault(); // Prevent browser Alt-A behavior
                if (currentPoem?.lines) {
                    selectAll(currentPoem.lines.length);
                }
            }

            // CTRL key in Edit mode enables viewport dragging
            if (
                (event.ctrlKey || event.metaKey) &&
                moveMode === "edit" &&
                !viewportDragEnabled
            ) {
                console.log("CTRL pressed in edit mode - enabling viewport drag");
                setViewportDragEnabled(true);
            }
        };

        const handleKeyUp = (event) => {
            // CTRL key release in Edit mode disables viewport dragging
            if (
                !(event.ctrlKey || event.metaKey) &&
                moveMode === "edit" &&
                viewportDragEnabled
            ) {
                console.log("CTRL released in edit mode - disabling viewport drag");
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
        moveMode, // Add moveMode as dependency
    ]);

    // 3D transformation handlers
    const handleLineTransformChange = useCallback(
        (lineIndex, property, value) => {
            setLineTransforms((prev) => {
                const currentTransform = prev[lineIndex] || {};

                // Handle nested properties (e.g., "lighting.enabled")
                if (property.includes(".")) {
                    const [parentProp, childProp] = property.split(".");
                    return {
                        ...prev,
                        [lineIndex]: {
                            ...currentTransform,
                            [parentProp]: {
                                ...currentTransform[parentProp],
                                [childProp]: value,
                            },
                        },
                    };
                }

                // Handle special cases
                if (property === "pivotMode") {
                    // Update pivot coordinates based on mode
                    const pivotCoords = {
                        top: {pivotX: 0.5, pivotY: 0},
                        center: {pivotX: 0.5, pivotY: 0.5},
                        bottom: {pivotX: 0.5, pivotY: 1},
                    };

                    return {
                        ...prev,
                        [lineIndex]: {
                            ...currentTransform,
                            pivotMode: value,
                            ...pivotCoords[value],
                        },
                    };
                }

                if (property === "uniformScale") {
                    // Update both scaleX and scaleY
                    return {
                        ...prev,
                        [lineIndex]: {
                            ...currentTransform,
                            uniformScale: value,
                            scaleX: value,
                            scaleY: value,
                        },
                    };
                }

                if (property === "gevelPreset") {
                    // Apply gevel preset using Transform3D class
                    const {Transform3D} = require("../../utils/Transform3D");
                    const transform = new Transform3D(currentTransform);
                    transform.applyGevelPreset(value);

                    return {
                        ...prev,
                        [lineIndex]: {
                            ...currentTransform,
                            ...transform,
                            gevelPreset: value,
                        },
                    };
                }

                // Default case: simple property update
                return {
                    ...prev,
                    [lineIndex]: {
                        ...currentTransform,
                        [property]: value,
                    },
                };
            });

            console.log(
                `🎭 Enhanced 3D Transform: Line ${lineIndex} ${property} = ${value}`
            );
        },
        [setLineTransforms]
    );

    const handleGlobal3DSettingChange = useCallback(
        (property, value) => {
            setGlobal3DSettings((prev) => {
                // Handle Gevel preset application
                if (property === "gevelPreset") {
                    const presets = {
                        brick: {
                            // Darker, more shadowed text like carved into brick
                            globalLighting: {enabled: true, intensity: 0.8, ambient: 0.4},
                            material: {blendMode: "multiply"}, // Darkens text, creates shadow effect
                        },
                        stone: {
                            // Weathered, textured appearance like stone carving
                            globalLighting: {enabled: true, intensity: 0.9, ambient: 0.3},
                            material: {blendMode: "overlay"}, // Enhances contrast, stone-like texture
                        },
                        metal: {
                            // Bright, reflective text like polished metal lettering
                            globalLighting: {enabled: true, intensity: 1.2, ambient: 0.2},
                            material: {blendMode: "screen"}, // Brightens text, metallic shine
                        },
                        glass: {
                            // Translucent, glowing text like etched or backlit glass
                            globalLighting: {enabled: true, intensity: 0.6, ambient: 0.6},
                            material: {blendMode: "add"}, // Creates glow effect, glass-like transparency
                        },
                        wood: {
                            // Natural, warm text like carved or painted wood
                            globalLighting: {enabled: true, intensity: 0.7, ambient: 0.5},
                            material: {blendMode: "normal"}, // Natural appearance with subtle lighting
                        },
                    };

                    // Handle preset clearing
                    if (value === null) {
                        console.log("🏗️ Clearing Gevel preset");

                        // Show notification for clearing
                        if (typeof window !== "undefined" && window.document) {
                            const notification = document.createElement("div");
                            notification.textContent = "Gevel preset cleared";
                            notification.style.cssText = `
								position: fixed;
								top: 20px;
								right: 20px;
								background: #ff9800;
								color: white;
								padding: 12px 20px;
								border-radius: 4px;
								font-family: Arial, sans-serif;
								font-size: 14px;
								z-index: 10000;
								box-shadow: 0 2px 8px rgba(0,0,0,0.2);
								transition: opacity 0.3s ease;
							`;

                            document.body.appendChild(notification);

                            setTimeout(() => {
                                notification.style.opacity = "0";
                                setTimeout(() => {
                                    if (notification.parentNode) {
                                        notification.parentNode.removeChild(notification);
                                    }
                                }, 300);
                            }, 2000);
                        }

                        return {
                            ...prev,
                            gevelPreset: null,
                            // Reset to default lighting and material settings
                            globalLighting: {enabled: false, intensity: 1.0, ambient: 0.3},
                            material: {blendMode: "normal"},
                        };
                    }

                    const preset = presets[value];
                    if (preset) {
                        console.log(`🏗️ Applying Gevel preset: ${value}`, preset);

                        // Add visual feedback - show a temporary notification
                        if (typeof window !== "undefined" && window.document) {
                            // Create a temporary notification element
                            const notification = document.createElement("div");
                            notification.textContent = `Applied ${
                                value.charAt(0).toUpperCase() + value.slice(1)
                            } preset`;
                            notification.style.cssText = `
								position: fixed;
								top: 20px;
								right: 20px;
								background: #4CAF50;
								color: white;
								padding: 12px 20px;
								border-radius: 4px;
								font-family: Arial, sans-serif;
								font-size: 14px;
								z-index: 10000;
								box-shadow: 0 2px 8px rgba(0,0,0,0.2);
								transition: opacity 0.3s ease;
							`;

                            document.body.appendChild(notification);

                            // Remove notification after 2 seconds
                            setTimeout(() => {
                                notification.style.opacity = "0";
                                setTimeout(() => {
                                    if (notification.parentNode) {
                                        notification.parentNode.removeChild(notification);
                                    }
                                }, 300);
                            }, 2000);
                        }

                        return {
                            ...prev,
                            ...preset,
                            gevelPreset: value, // Store the active preset name
                        };
                    }
                    return prev;
                }

                // Handle nested properties (e.g., "globalLighting.enabled")
                if (property.includes(".")) {
                    const [parentProp, childProp] = property.split(".");
                    return {
                        ...prev,
                        [parentProp]: {
                            ...prev[parentProp],
                            [childProp]: value,
                        },
                    };
                }

                // Handle simple properties
                return {
                    ...prev,
                    [property]: value,
                };
            });

            console.log(`🌍 Global 3D: ${property} = ${value}`);
        },
        [setGlobal3DSettings]
    );

    const handleResetLineTransform = useCallback(
        (lineIndex) => {
            setLineTransforms((prev) => {
                const newTransforms = {...prev};
                delete newTransforms[lineIndex];
                return newTransforms;
            });

            console.log(`🔄 Reset 3D transform for line ${lineIndex}`);
        },
        [setLineTransforms]
    );

    const handleResetAllTransforms = useCallback(() => {
        setLineTransforms({});
        console.log("🔄 Reset all 3D transforms");
    }, [setLineTransforms]);

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
        handleSkewZChange,

        handleSearchBackground,
        handlePremiumSearch, // <-- NEW: Export premium search handler
        handleSetBackground,
        handleNextPage, // <-- Exporteren
        handlePrevPage, // <-- Exporteren
        handleCitySearch, // <-- Exporteer de nieuwe handler
        handleResetToCollection, // <-- NEW: Export reset handler
        handleOpenPhotoGrid, // <-- NEW: Export open photo grid handler

        // 3D transformation handlers
        handleLineTransformChange,
        handleGlobal3DSettingChange,
        handleResetLineTransform,
        handleResetAllTransforms,
    };
}
