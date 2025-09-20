// src/pages/CanvasPage/hooks/useCanvasHandlers.js

import {useCallback, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {getPoemById} from "../../../data/testdata";
import {
    handleFontSizeChangeUtil,
    handleLineHeightChangeUtil,
    resetLineHeightUtil,
} from "../utils/lineHeightUtils";
import {getGeoDataByCity} from "../../../data/cityGeoData";

/**
 * useCanvasHandlers
 *
 * Hook that provides a comprehensive set of event handlers and utilities
 * for managing user interactions and state updates on the canvas page. This includes
 * selection logic, color and font overrides, background image search, keyboard shortcuts,
 * and responsive UI controls. Designed for a professional frontend bootcamp final project.
 *
 * @param {Object} canvasState - The current state and setters from useCanvasState.
 * @returns {Object} A collection of handler functions for use in canvas components.
 */

//TODO Keyboard shortcuts weghalen en naar dedicated hook verplaatsen

export function useCanvasHandlers(canvasState, poemData = null) {
	// Retrieve the current poem based on the URL search parameter (for Alt-A select all)
	const [searchParams] = useSearchParams();
	const poemId = searchParams.get("poemId");
	// Use provided poemData first, fallback to URL-based lookup
	const currentPoem = poemData || (poemId ? getPoemById(poemId) : null);

	// Destructure all relevant state and setters from canvasState
	const {
		handleSelect, // Handler for selecting lines
		clearSelection, // Handler for clearing selection
		selectAll, // Handler for selecting all lines
		viewportDragEnabled,
		setViewportDragEnabled,
		fontSize,
		setFontSize,
		setLineHeight,
		lineHeightMultiplier,
		setLineHeightMultiplier,
		userHasAdjusted,
		setUserHasAdjusted,
		titleColorOverride,
		setTitleColorOverride,
		authorColorOverride,
		setAuthorColorOverride,
		lineOverrides,
		setPendingFontFamily,
		loadFont,
		selectedLines,
		setLineOverrides,
		searchPhotos,
		searchPhotosByGeo,
		getCollectionPhotos,
		setBackgroundImage,
		goToNextPage,
		goToPrevPage,
		// searchContext, TODO: Check of deze prop nog nodig is
		setSearchContext,
		goToNextFlickrPage,
		flickrPhotos,
		clearFlickrPhotos,
		setPhotoGridVisible,
	} = canvasState;

	/**
	 * Handles selection of a specific line by index.
	 * @param {number} index - The index of the line to select.
	 * @param {Event} event - The triggering event.
	 */
	const handleLineSelect = useCallback(
		(index, event) => {
			handleSelect(index, event);
		},
		[handleSelect]
	);

	/**
	 * Applies a fill color override to all currently selected lines.
	 * @param {string} color - The color to apply.
	 */
	const handleLineColorChange = useCallback(
		(color) => {
			if (selectedLines.size > 0) {
				setLineOverrides((prev) => {
					const newOverrides = { ...prev };
					selectedLines.forEach((index) => {
						newOverrides[index] = { ...newOverrides[index], fillColor: color };
					});
					return newOverrides;
				});
			}
		},
		[selectedLines, setLineOverrides]
	);

	/**
	 * Resets all style overrides for the currently selected lines and clears the selection.
	 */
	const handleResetSelectedLines = useCallback(() => {
		if (selectedLines.size > 0) {
			setLineOverrides((prev) => {
				const newOverrides = { ...prev };
				selectedLines.forEach((index) => {
					delete newOverrides[index];
				});
				return newOverrides;
			});
			clearSelection();
		}
	}, [selectedLines, setLineOverrides, clearSelection]);

	/**
	 * Enables or disables viewport dragging mode.
	 * @param {boolean} enabled - Whether to enable viewport dragging.
	 */
	const handleViewportToggle = useCallback(
		(enabled) => {
			setViewportDragEnabled(enabled);
		},
		[setViewportDragEnabled]
	);

	/**
	 * Sets the active state of the color picker UI.
	 * @param {boolean} isActive - Whether the color picker is active.
	 */
	const handleColorPickerActiveChange = useCallback(
		(isActive) => {
			canvasState.setIsColorPickerActive(isActive);
		},
		[canvasState]
	);

	/**
	 * Handles changes to the global font size, updating related line height as needed.
	 * @param {number} newSize - The new font size.
	 */
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

	/**
	 * Handles changes to the global line height, updating related state as needed.
	 * @param {number} newHeight - The new line height.
	 */
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

	/**
	 * Resets the line height to its default value based on the current font size.
	 */
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

	/**
	 * Handles changes to the line height multiplier, updating line height accordingly.
	 * @param {number} newMultiplier - The new line height multiplier.
	 */
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

	/**
	 * Applies letter spacing override to all selected lines.
	 * @param {number} spacing - The letter spacing value.
	 */
	const handleLineLetterSpacingChange = useCallback(
		(spacing) => {
			if (selectedLines.size > 0) {
				setLineOverrides((prev) => {
					const newOverrides = { ...prev };
					selectedLines.forEach((index) => {
						newOverrides[String(index)] = {
							...newOverrides[String(index)],
							letterSpacing: spacing,
						};
					});
					return newOverrides;
				});
			}
		},
		[selectedLines, setLineOverrides]
	);

	/**
	 * Sets the global font weight style.
	 * @param {string} weight - The font weight (e.g., 'bold', 'normal').
	 */
	const handleFontWeightChange = useCallback(
		(weight) => {
			canvasState.setFontWeight(weight);
		},
		[canvasState]
	);

	/**
	 * Sets the global font style.
	 * @param {string} style - The font style (e.g., 'italic', 'normal').
	 */
	const handleFontStyleChange = useCallback(
		(style) => {
			canvasState.setFontStyle(style);
		},
		[canvasState]
	);

	/**
	 * Sets the skew transformation for the X axis.
	 * @param {number} skewX - The skew value for the X axis.
	 */
	const handleSkewXChange = useCallback(
		(skewX) => {
			canvasState.setSkewX(skewX);
		},
		[canvasState]
	);

	/**
	 * Sets the skew transformation for the Y axis.
	 * @param {number} skewY - The skew value for the Y axis.
	 */
	const handleSkewYChange = useCallback(
		(skewY) => {
			canvasState.setSkewY(skewY);
		},
		[canvasState]
	);

	/**
	 * Applies a font size override to all selected lines.
	 * @param {number} size - The font size to apply.
	 */
	const handleLineFontSizeChange = useCallback(
		(size) => {
			if (selectedLines.size > 0) {
				setLineOverrides((prev) => {
					const newOverrides = { ...prev };
					selectedLines.forEach((index) => {
						newOverrides[String(index)] = {
							...newOverrides[String(index)],
							fontSize: size,
						};
					});
					return newOverrides;
				});
			}
		},
		[selectedLines, setLineOverrides]
	);

	/**
	 * Sets a color override for the poem title.
	 * @param {string} color - The color to apply to the title.
	 */
	const handleTitleColorChange = useCallback(
		(color) => {
			setTitleColorOverride(color);
		},
		[setTitleColorOverride]
	);

	/**
	 * Sets a color override for the poem author.
	 * @param {string} color - The color to apply to the author.
	 */
	const handleAuthorColorChange = useCallback(
		(color) => {
			setAuthorColorOverride(color);
		},
		[setAuthorColorOverride]
	);

	/**
	 * Resets the color override for the poem title.
	 */
	const handleResetTitleColor = useCallback(() => {
		setTitleColorOverride(null);
	}, [setTitleColorOverride]);

	/**
	 * Resets the color override for the poem author.
	 */
	const handleResetAuthorColor = useCallback(() => {
		setAuthorColorOverride(null);
	}, [setAuthorColorOverride]);

	/**
	 * Synchronizes all color overrides (title, author, lines) back to the global color.
	 * Prompts the user for confirmation before resetting.
	 */
	const handleSyncAllColorsToGlobal = useCallback(() => {
		const titleOverride = titleColorOverride !== null;
		const authorOverride = authorColorOverride !== null;
		const lineColorOverrides = Object.values(lineOverrides).filter(
			(override) => override.fillColor
		).length;
		const totalOverrides =
			(titleOverride ? 1 : 0) + (authorOverride ? 1 : 0) + lineColorOverrides;
		if (totalOverrides === 0) {
			alert("There are no color overrides to reset.");
			return;
		}
		const confirmMessage =
			`This will remove ${totalOverrides} color override${
				totalOverrides === 1 ? "" : "s"
			}:\n\n` +
			(titleOverride ? "• Title color override\n" : "") +
			(authorOverride ? "• Author color override\n" : "") +
			(lineColorOverrides > 0
				? `• ${lineColorOverrides} poem line color override${
						lineColorOverrides === 1 ? "" : "s"
				  }\n`
				: "") +
			"\nAll colors will follow the global color. Continue?";
		if (!confirm(confirmMessage)) {
			return;
		}
		setTitleColorOverride(null);
		setAuthorColorOverride(null);
		setLineOverrides((prev) => {
			const newOverrides = { ...prev };
			Object.keys(newOverrides).forEach((index) => {
				const override = { ...newOverrides[index] };
				delete override.fillColor;
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

	/**
	 * Synchronizes all font family overrides for lines back to the global font family.
	 * Prompts the user for confirmation before resetting.
	 */
	const handleSyncAllFontsToGlobal = useCallback(() => {
		const lineFontOverrides = Object.values(lineOverrides).filter(
			(override) => override.fontFamily
		).length;
		if (lineFontOverrides === 0) {
			alert("There are no font family overrides to reset.");
			return;
		}
		const confirmMessage =
			`This will remove ${lineFontOverrides} font family override${
				lineFontOverrides === 1 ? "" : "s"
			}:\n\n` +
			`• ${lineFontOverrides} poem line font family override${
				lineFontOverrides === 1 ? "" : "s"
			}\n\n` +
			"All lines will follow the global font family. Continue?";
		if (!confirm(confirmMessage)) {
			return;
		}
		let allLinesReset = true;
		setLineOverrides((prev) => {
			const newOverrides = { ...prev };
			Object.keys(newOverrides).forEach((index) => {
				const override = { ...newOverrides[index] };
				delete override.fontFamily;
				if (Object.keys(override).length === 0) {
					delete newOverrides[index];
				} else {
					newOverrides[index] = override;
					allLinesReset = false;
				}
			});
			return newOverrides;
		});
		if (allLinesReset) {
			loadFont("Cormorant Garamond");
			setPendingFontFamily("Cormorant Garamond");
		}
	}, [lineOverrides, setLineOverrides, loadFont, setPendingFontFamily]);

	/**
	 * Handles font family changes, applying to selected lines or globally if none selected.
	 * @param {string} newFontFamily - The new font family to apply.
	 */
	const handleFontFamilyChange = useCallback(
		(newFontFamily) => {
			loadFont(newFontFamily);
			if (selectedLines.size > 0) {
				setLineOverrides((prev) => {
					const newOverrides = { ...prev };
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
		[loadFont, setPendingFontFamily, selectedLines, setLineOverrides]
	);

	/**
	 * Initiates a free search for background images using the Pexels API.
	 * @param {string} query - The search query string.
	 */
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

	/**
	 * Sets the background image for the canvas.
	 * @param {string} imageUrl - The URL of the image to set as background.
	 */
	const handleSetBackground = useCallback(
		(imageUrl) => {
			setBackgroundImage(imageUrl);
		},
		[setBackgroundImage]
	);

	/**
	 * Searches for city-specific background images using the Flickr API.
	 * @param {string} city - The city name to search for.
	 */
	const handleCitySearch = useCallback(
		(city) => {
			const geoData = getGeoDataByCity(city);
			if (geoData) {
				searchPhotosByGeo(
					{ ...geoData, city, tags: "gevel,facade,architecture" },
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

	/**
	 * Advances to the next page of photo results (Flickr or Pexels).
	 */
	const handleNextPage = useCallback(() => {
		if (flickrPhotos && flickrPhotos.length > 0) {
			goToNextFlickrPage();
		} else {
			goToNextPage();
		}
	}, [flickrPhotos, goToNextFlickrPage, goToNextPage]);

	/**
	 * Goes to the previous page of Pexels photo results.
	 */
	const handlePrevPage = useCallback(() => {
		if (flickrPhotos && flickrPhotos.length > 0) {
			// Not implemented for Flickr
		} else {
			goToPrevPage();
		}
	}, [flickrPhotos, goToPrevPage]);

	/**
	 * Resets the photo search to the default Pexels collection and clears Flickr results.
	 */
	const handleResetToCollection = useCallback(() => {
		clearFlickrPhotos();
		getCollectionPhotos();
		setSearchContext({
			type: "collection",
			query: "",
			source: "pexels",
		});
	}, [clearFlickrPhotos, getCollectionPhotos, setSearchContext]);

	/**
	 * Opens the floating photo grid UI.
	 */
	const handleOpenPhotoGrid = useCallback(() => {
		setPhotoGridVisible(true);
	}, [setPhotoGridVisible]);

	// Get moveMode from canvasState for CTRL+drag logic
	const { moveMode } = canvasState;

	/**
	 * Keyboard shortcut handler for selection, viewport drag, and select all.
	 * - Escape: clear selection
	 * - Alt+A: select all lines
	 * - Ctrl (in edit mode): enable viewport drag
	 */
	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				clearSelection();
			}
			if (event.altKey && event.key === "a") {
				event.preventDefault();
				if (currentPoem?.lines) {
					selectAll(currentPoem.lines.length);
				}
			}
			if (
				(event.ctrlKey || event.metaKey) &&
				moveMode === "edit" &&
				!viewportDragEnabled
			) {
				setViewportDragEnabled(true);
			}
		};
		const handleKeyUp = (event) => {
			if (
				!(event.ctrlKey || event.metaKey) &&
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
	]);

	// Return all handler functions for use in canvas components
	return {
		handleLineSelect,
		handleLineColorChange,
		handleLineLetterSpacingChange,
		handleLineFontSizeChange,
		handleResetSelectedLines,
		handleViewportToggle,
		handleColorPickerActiveChange,
		handleFontSizeChange,
		handleLineHeightChange,
		handleResetLineHeight,
		handleLineHeightMultiplierChange,
		handleTitleColorChange,
		handleAuthorColorChange,
		handleResetTitleColor,
		handleResetAuthorColor,
		handleSyncAllColorsToGlobal,
		handleSyncAllFontsToGlobal,
		handleFontFamilyChange,
		handleFontWeightChange,
		handleFontStyleChange,
		handleSkewXChange,
		handleSkewYChange,
		handleSearchBackground,
		handleSetBackground,
		handleNextPage,
		handlePrevPage,
		handleCitySearch,
		handleResetToCollection,
		handleOpenPhotoGrid,
	};
}
