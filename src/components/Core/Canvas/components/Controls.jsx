// src/pages/CanvasPage/Controls.jsx

import React, { useState, useMemo, useEffect } from "react";
import styles from "../Canvas.module.scss";
import BackgroundControls from "./controls/BackgroundControls";
import FontControls from "./controls/FontControls";
import LayoutControls from "./controls/LayoutControls";
import Transform3DControls from "./controls/Transform3DControls";
import { useAuthContext } from "@/context/auth/AuthContext";

export default function Controls({
	toggle, // <-- NEW: For collapsing the panel
	fontSize,
	onFontSizeChange,
	fillColor,
	onFillColorChange,
	letterSpacing,
	onLetterSpacingChange,
	lineHeightMultiplier,
	onLineHeightMultiplierChange,
	onLineLetterSpacingChange, // <-- DEZE ONTBRAK!
	onLineFontSizeChange, // <-- NIEUW: Voor fontSize van geselecteerde regels
	onResetLineHeight,
	textAlign,
	onTextAlignChange,
	onLineColorChange,
	handleResetSelectedLines, // <-- Hernoemde handler
	viewportDragEnabled,
	onViewportToggle,
	onColorPickerActiveChange,

	// Hierarchical color system properties
	effectiveTitleColor,
	effectiveAuthorColor,
	hasTitleColorOverride,
	hasAuthorColorOverride,
	onTitleColorChange,
	onAuthorColorChange,
	onResetTitleColor,
	onResetAuthorColor,

	fontFamily,
	onFontFamilyChange,
	availableFonts,

	// Font style props
	fontWeight,
	onFontWeightChange,
	fontStyle,
	onFontStyleChange,

	// Skew props
	skewX,
	onSkewXChange,
	skewY,
	onSkewYChange,
	skewZ,
	onSkewZChange,

	// Pexels background props
	isLoading,
	error,
	onSearch, // Dit wordt onze handleSearchBackground
	onCitySearch, // Wordt handleCitySearch
	onPremiumSearch, // NEW: Premium Flickr text search
	onResetToCollection, // New prop for resetting to collection
	onOpenPhotoGrid, // New prop to open floating photo grid
	onResetViewport, // NEW: For resetting the camera

	// We hebben deze ook nodig om de juiste 'value' te tonen
	selectedLines,
	lineOverrides,

	// NEW: Hover freeze state for timer indicator
	hoverFreezeActive,

	// Text optimization props
	isOptimizationEnabled,
	setIsOptimizationEnabled,

	// 3D transformation props
	lineTransforms,
	global3DSettings,
	onLineTransformChange,
	onGlobal3DSettingChange,
	onResetLineTransform,
	getSelectedTransformValues,
	handleSelectedTransformChange,
}) {
	const { user } = useAuthContext();

	const [query, setQuery] = useState("");
	const [isFreeSearchVisible, setIsFreeSearchVisible] = useState(false);
	const [selectedAnwbCity, setSelectedAnwbCity] = useState("");
	const [selectedCapital, setSelectedCapital] = useState("");

	// Search option states
	const [useCustomTerm, setUseCustomTerm] = useState(false);
	const [usePremiumSearch, setUsePremiumSearch] = useState(false);

	// Set premium search to true by default for authenticated users
	useEffect(() => {
		if (user) {
			setUsePremiumSearch(true);
		}
	}, [user]);

	// Collapsible section states
	const [backgroundSectionOpen, setBackgroundSectionOpen] = useState(true);
	const [fontSectionOpen, setFontSectionOpen] = useState(true);
	const [layoutSectionOpen, setLayoutSectionOpen] = useState(true);
	const [transform3DSectionOpen, setTransform3DSectionOpen] = useState(false);
	const [sceneSetupOpen, setSceneSetupOpen] = useState(true); // NEW: For Scène Setup subpanel
	const [colorSubsectionOpen, setColorSubsectionOpen] = useState(false);
	// NEW: Auto-Z Preview state for intuitive 3D activation
	const [autoZPreview, setAutoZPreview] = useState(false);
	const [originalZValues, setOriginalZValues] = useState(new Map());

	const selectionCount = selectedLines.size;
	const hasSelection = selectionCount > 0;
	const singleSelectedLineIndex =
		selectionCount === 1 ? Array.from(selectedLines)[0] : null;

	// Bepaal welke kleur getoond wordt - nu met multi-selectie support
	const displayedColor = useMemo(() => {
		if (selectionCount === 0) {
			// Geen selectie → globale kleur
			return fillColor;
		} else if (selectionCount === 1) {
			// Single selectie → kleur van die regel
			const lineIndex = Array.from(selectedLines)[0];
			return lineOverrides[lineIndex]?.fillColor ?? fillColor;
		} else {
			// Multi-selectie → zoek gemeenschappelijke kleur
			const selectedIndices = Array.from(selectedLines);
			const colors = selectedIndices.map((index) => {
				// Voor titel (-2) en auteur (-1), gebruik effectieve kleuren
				if (index === -2) return effectiveTitleColor;
				if (index === -1) return effectiveAuthorColor;
				// Voor gedichtregels, gebruik lineOverrides of fallback naar fillColor
				return lineOverrides[index]?.fillColor ?? fillColor;
			});

			// Check of alle kleuren hetzelfde zijn
			const uniqueColors = [...new Set(colors)];
			if (uniqueColors.length === 1) {
				// Alle geselecteerde regels hebben dezelfde kleur
				return uniqueColors[0];
			} else {
				// Mixed colors → gebruik eerste kleur (of kan mixed state indicator zijn)
				return colors[0];
			}
		}
	}, [
		selectionCount,
		selectedLines,
		lineOverrides,
		fillColor,
		effectiveTitleColor,
		effectiveAuthorColor,
	]);

	// Bepaal welke letterafstand getoond wordt
	const displayedLetterSpacing =
		singleSelectedLineIndex !== null
			? lineOverrides[singleSelectedLineIndex]?.letterSpacing ?? letterSpacing
			: letterSpacing;

	// Bepaal welke lettergrootte getoond wordt voor geselecteerde regel
	const displayedFontSize =
		singleSelectedLineIndex !== null
			? lineOverrides[singleSelectedLineIndex]?.fontSize ?? fontSize
			: fontSize;

	// ✅ CORRECT: Bepaal hier welk lettertype getoond wordt
	const displayedFontFamily =
		singleSelectedLineIndex !== null
			? lineOverrides[singleSelectedLineIndex]?.fontFamily ?? fontFamily
			: fontFamily;

	// De handleColorInput functie wordt weer simpel
	const handleColorInput = (color) => {
		if (hasSelection) {
			onLineColorChange(color);
		} else {
			onFillColorChange(color);
		}
	};

	const handleSearchClick = () => {
		if (query.trim()) {
			// Determine final query with prefix if needed
			let finalQuery;
			if (useCustomTerm) {
				// User wants exact search term
				finalQuery = query.trim();
			} else {
				// Add appropriate prefix based on search engine
				if (user && usePremiumSearch) {
					// Flickr: Use Dutch "gevels in" prefix
					finalQuery = `gevels in ${query.trim()}`;
				} else {
					// Pexels: Use English "facades in" for better results
					finalQuery = `facades in ${query.trim()}`;
				}
			}

			// Switch between Pexels and Flickr based on premium checkbox
			if (user && usePremiumSearch) {
				// Premium search: use Flickr with text search
				onPremiumSearch(finalQuery);
			} else {
				// Standard search: use Pexels
				onSearch(finalQuery);
			}

			// Open grid after short delay to allow API call to start
			setTimeout(() => {
				onOpenPhotoGrid();
			}, 100);
		}
	};

	const handleReset3DTransforms = () => {
		selectedLines.forEach((lineIndex) => {
			onResetLineTransform?.(lineIndex);
		});
	};

	const handleDropdownSearch = (e, dropdownType) => {
		const city = e.target.value;
		if (city) {
			// Reset andere dropdown
			if (dropdownType === "anwb") {
				setSelectedCapital("");
				setSelectedAnwbCity(city);
			} else {
				setSelectedAnwbCity("");
				setSelectedCapital(city);
			}

			// Verberg vrij zoeken balk bij dropdown selectie
			setIsFreeSearchVisible(false);

			// Zoek EN open modal
			onCitySearch(city);
			onOpenPhotoGrid();
		}
	};

	return (
		<div className={styles.controlsWrapper}>
			<div className={styles.panelHeader}>
				<h2>Styling Controls</h2>
				<button
					onClick={toggle}
					className={styles.closeButton}
					aria-label="Collapse Controls"
				>
					✕
				</button>
			</div>

			<BackgroundControls
				query={query}
				setQuery={setQuery}
				isFreeSearchVisible={isFreeSearchVisible}
				setIsFreeSearchVisible={setIsFreeSearchVisible}
				selectedAnwbCity={selectedAnwbCity}
				setSelectedAnwbCity={setSelectedAnwbCity}
				selectedCapital={selectedCapital}
				setSelectedCapital={setSelectedCapital}
				isLoading={isLoading}
				error={error}
				hoverFreezeActive={hoverFreezeActive}
				useCustomTerm={useCustomTerm}
				setUseCustomTerm={setUseCustomTerm}
				usePremiumSearch={usePremiumSearch}
				setUsePremiumSearch={setUsePremiumSearch}
				onSearch={onSearch}
				onOpenPhotoGrid={onOpenPhotoGrid}
				onCitySearch={onCitySearch}
				onResetToCollection={onResetToCollection}
				handleSearchClick={handleSearchClick}
				handleDropdownSearch={handleDropdownSearch}
				backgroundSectionOpen={backgroundSectionOpen}
				setBackgroundSectionOpen={setBackgroundSectionOpen}
			/>

			<FontControls
				availableFonts={availableFonts}
				displayedFontFamily={displayedFontFamily}
				fontWeight={fontWeight}
				fontStyle={fontStyle}
				fontSize={fontSize}
				hasSelection={hasSelection}
				selectionCount={selectionCount}
				displayedFontSize={displayedFontSize}
				displayedLetterSpacing={displayedLetterSpacing}
				displayedColor={displayedColor}
				effectiveTitleColor={effectiveTitleColor}
				hasTitleColorOverride={hasTitleColorOverride}
				effectiveAuthorColor={effectiveAuthorColor}
				hasAuthorColorOverride={hasAuthorColorOverride}
				onFontFamilyChange={onFontFamilyChange}
				onFontWeightChange={onFontWeightChange}
				onFontStyleChange={onFontStyleChange}
				onFontSizeChange={onFontSizeChange}
				onLineFontSizeChange={onLineFontSizeChange}
				onLetterSpacingChange={onLetterSpacingChange}
				onLineLetterSpacingChange={onLineLetterSpacingChange}
				handleColorInput={handleColorInput}
				onColorPickerActiveChange={onColorPickerActiveChange}
				handleResetSelectedLines={handleResetSelectedLines}
				onTitleColorChange={onTitleColorChange}
				onResetTitleColor={onResetTitleColor}
				onAuthorColorChange={onAuthorColorChange}
				onResetAuthorColor={onResetAuthorColor}
				fontSectionOpen={fontSectionOpen}
				setFontSectionOpen={setFontSectionOpen}
				colorSubsectionOpen={colorSubsectionOpen}
				setColorSubsectionOpen={setColorSubsectionOpen}
			/>

			<LayoutControls
				lineHeightMultiplier={lineHeightMultiplier}
				fontSize={fontSize}
				textAlign={textAlign}
				viewportDragEnabled={viewportDragEnabled}
				isOptimizationEnabled={isOptimizationEnabled}
				skewX={skewX}
				skewY={skewY}
				skewZ={skewZ}
				global3DSettings={global3DSettings}
				autoZPreview={autoZPreview}
				onLineHeightMultiplierChange={onLineHeightMultiplierChange}
				onResetLineHeight={onResetLineHeight}
				onTextAlignChange={onTextAlignChange}
				onViewportToggle={onViewportToggle}
				onResetViewport={onResetViewport}
				setIsOptimizationEnabled={setIsOptimizationEnabled}
				onSkewXChange={onSkewXChange}
				onSkewYChange={onSkewYChange}
				onSkewZChange={onSkewZChange}
				onGlobal3DSettingChange={onGlobal3DSettingChange}
				setAutoZPreview={setAutoZPreview}
				lineTransforms={lineTransforms}
				onLineTransformChange={onLineTransformChange}
				originalZValues={originalZValues}
				setOriginalZValues={setOriginalZValues}
				layoutSectionOpen={layoutSectionOpen}
				setLayoutSectionOpen={setLayoutSectionOpen}
				sceneSetupOpen={sceneSetupOpen}
				setSceneSetupOpen={setSceneSetupOpen}
			/>

			<Transform3DControls
				hasSelection={hasSelection}
				selectionCount={selectionCount}
				getSelectedTransformValues={getSelectedTransformValues}
				handleSelectedTransformChange={handleSelectedTransformChange}
				handleReset3DTransforms={handleReset3DTransforms}
				transform3DSectionOpen={transform3DSectionOpen}
				setTransform3DSectionOpen={setTransform3DSectionOpen}
				global3DSettings={global3DSettings}
				onGlobal3DSettingChange={onGlobal3DSettingChange}
			/>
		</div>
	);
}