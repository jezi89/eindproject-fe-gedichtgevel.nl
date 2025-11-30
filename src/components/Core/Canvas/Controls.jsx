// src/pages/CanvasPage/Controls.jsx

import React, {useState, useMemo, useEffect} from "react";
import styles from "./Canvas.module.scss";
import BackgroundControls from "./controls/BackgroundControls.jsx";
import FontControls from "./controls/FontControls.jsx";
import LayoutControls from "./controls/LayoutControls.jsx";
import MaterialControls from "./controls/MaterialControls.jsx";
import ImageQualityControls from "./controls/ImageQualityControls.jsx";

import {useAuthContext} from "@/context/auth/AuthContext.jsx";

export default function Controls({
                                     toggle,
                                     qualityOverlay,
                                     fontSize,
                                     onFontSizeChange,
                                     fillColor,
                                     onFillColorChange,
                                     letterSpacing,
                                     onLetterSpacingChange,
                                     lineHeightMultiplier,
                                     onLineHeightMultiplierChange,
                                     onLineLetterSpacingChange,
                                     onLineFontSizeChange,
                                     onResetLineHeight,
                                     textAlign,
                                     onTextAlignChange,
                                     onLineColorChange,
                                     handleResetSelectedLines,
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
                                     fontWeight,
                                     onFontWeightChange,
                                     fontStyle,
                                     onFontStyleChange,
                                     skewX,
                                     onSkewXChange,
                                     onLineSkewXChange,
                                     skewY,
                                     onSkewYChange,
                                     onLineSkewYChange,
                                     onLineTextAlignChange,
                                     isLoading,
                                     error,
                                     onSearch,
                                     onCitySearch,
                                     onPremiumSearch,
                                     onResetToCollection,
                                     onOpenPhotoGrid,
                                     onResetViewport,
                                     selectedLines,
                                     lineOverrides,
                                     hoverFreezeActive,
                                     isOptimizationEnabled,
                                     setIsOptimizationEnabled,
                                     imageQualityMode,
                                     setImageQualityMode,
                                     textMaterial,
                                     onTextMaterialChange,
                                     textPadding,
                                     onTextPaddingChange,
                                     textEffectMode,
                                     setTextEffectMode,
                                     textEffectParams,
                                     setTextEffectParams,
                                     totalLineCount = 0,
                                     onResetAllText,
                                     onToggleLayoutPosition,
                                     layoutPosition,
                                 }) {
    const {user} = useAuthContext();

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
    const [qualitySectionOpen, setQualitySectionOpen] = useState(true);
    const [materialSectionOpen, setMaterialSectionOpen] = useState(false);

    const [colorSubsectionOpen, setColorSubsectionOpen] = useState(false);

    const selectionCount = selectedLines.size;
    const hasSelection = selectionCount > 0;
    // Check if everything is selected (except title/author which are -1/-2)
    // We only count positive indices for "Select All" line logic
    const selectedLineIndices = Array.from(selectedLines).filter(i => i >= 0);
    const isSelectAll = totalLineCount > 0 && selectedLineIndices.length === totalLineCount;

    const singleSelectedLineIndex =
        selectionCount === 1 ? Array.from(selectedLines)[0] : null;

    // Determine which color is displayed - now with multi-selection support
    const displayedColor = useMemo(() => {
        if (selectionCount === 0) {
            // No selection → global color
            return fillColor;
        } else if (selectionCount === 1) {
            // Single selection → color of that line
            const lineIndex = Array.from(selectedLines)[0];
            return lineOverrides[lineIndex]?.fillColor ?? fillColor;
        } else {
            // Multi-selection → find common color
            const selectedIndices = Array.from(selectedLines);
            const colors = selectedIndices.map((index) => {
                // For title (-2) and author (-1), use effective colors
                if (index === -2) return effectiveTitleColor;
                if (index === -1) return effectiveAuthorColor;
                // For poem lines, use lineOverrides or fallback to fillColor
                return lineOverrides[index]?.fillColor ?? fillColor;
            });

            // Check if all colors are the same
            const uniqueColors = [...new Set(colors)];
            if (uniqueColors.length === 1) {
                // All selected lines have the same color
                return uniqueColors[0];
            } else {
                // Mixed colors → use first color (or could be mixed state indicator)
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

    // Determine which letter spacing is displayed
    const displayedLetterSpacing = useMemo(() => {
        if (!hasSelection) return letterSpacing;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.letterSpacing ?? letterSpacing;
    }, [hasSelection, selectedLines, lineOverrides, letterSpacing]);

    // Determine which font size is displayed for selected line
    const displayedFontSize = useMemo(() => {
        if (!hasSelection) return fontSize;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.fontSize ?? fontSize;
    }, [hasSelection, selectedLines, lineOverrides, fontSize]);

    // Determine which font family is displayed
    const displayedFontFamily =
        singleSelectedLineIndex !== null
            ? lineOverrides[singleSelectedLineIndex]?.fontFamily ?? fontFamily
            : fontFamily;

    const handleColorInput = (color) => {
        if (hasSelection) {
            onLineColorChange(color);
        } else {
            onFillColorChange(color);
        }
    };

    // Determine displayed Skew & Align
    const displayedSkewX = useMemo(() => {
        if (!hasSelection) return skewX;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.skewX ?? skewX;
    }, [hasSelection, selectedLines, lineOverrides, skewX]);

    const displayedSkewY = useMemo(() => {
        if (!hasSelection) return skewY;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.skewY ?? skewY;
    }, [hasSelection, selectedLines, lineOverrides, skewY]);

    const displayedTextAlign = useMemo(() => {
        if (!hasSelection) return textAlign;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.textAlign ?? textAlign;
    }, [hasSelection, selectedLines, lineOverrides, textAlign]);

    // Wrapped handlers for skew and text align
    const handleSkewXInput = (val) => {
        if (hasSelection) onLineSkewXChange(val);
        else onSkewXChange(val);
    };

    const handleSkewYInput = (val) => {
        if (hasSelection) onLineSkewYChange(val);
        else onSkewYChange(val);
    };

    const handleTextAlignInput = (val) => {
        if (hasSelection) onLineTextAlignChange(val);
        else onTextAlignChange(val);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2>Styling Controls</h2>
                    {qualityOverlay}
                    <button
                        onClick={onToggleLayoutPosition}
                        className={styles.layoutToggleButton}
                        title="Wissel paneel positie (Links/Rechts)"
                        style={{ marginTop: '2px' }} // Visual alignment
                    >
                        ⇄
                    </button>
                </div>
                <button
                    onClick={toggle}
                    className={styles.closeButton}
                    aria-label="Collapse Controls"
                >
                    ✕
                </button>
            </div>

            {/* Selection Indicator - Compact Design */}
            {hasSelection && (
                <div className={styles.selectionIndicator}>
                    <div className={styles.selectionInfo}>
                        <span className={styles.selectionIcon}>✏️</span>
                        <span className={styles.selectionText}>
                            {selectionCount} {selectionCount === 1 ? 'regel' : 'regels'} geselecteerd
                        </span>
                    </div>
                    <button
                        onClick={handleResetSelectedLines}
                        className={styles.resetSelectionButton}
                        title="Reset selectie naar standaard waarden"
                    >
                        Reset Selectie
                    </button>
                </div>
            )}

            {/* Global Reset Button */}
            <button
                onClick={() => {
                    if (window.confirm("Weet je zeker dat je alle tekstbewerkingen wilt resetten? Dit kan niet ongedaan worden gemaakt.")) {
                        if (onResetAllText) onResetAllText();
                        if (onResetViewport) onResetViewport();
                    }
                }}
                className={styles.globalResetButton}
                title="Reset alle tekstbewerkingen en camera"
            >
                🔄 Reset Alles
            </button>

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

            {/* Material & Background Controls */}
            <MaterialControls
                textMaterial={textMaterial}
                onTextMaterialChange={onTextMaterialChange}
                textPadding={textPadding}
                onTextPaddingChange={onTextPaddingChange}
                textEffectMode={textEffectMode}
                setTextEffectMode={setTextEffectMode}
                textEffectParams={textEffectParams}
                setTextEffectParams={setTextEffectParams}
                isOpen={materialSectionOpen} // Using existing state or need to restore it?
                setIsOpen={setMaterialSectionOpen} // Need to check if this state exists
            />
            <FontControls
                availableFonts={availableFonts}
                displayedFontFamily={displayedFontFamily}
                fontWeight={fontWeight}
                fontStyle={fontStyle}
                fontSize={fontSize}
                hasSelection={hasSelection}
                isSelectAll={isSelectAll}
                selectionCount={selectionCount}
                letterSpacing={letterSpacing}
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
                layoutPosition={layoutPosition}
            />

            <LayoutControls
                lineHeightMultiplier={lineHeightMultiplier}
                fontSize={fontSize}
                isSelectAll={isSelectAll}
                hasSelection={hasSelection}
                textAlign={displayedTextAlign}
                viewportDragEnabled={viewportDragEnabled}
                isOptimizationEnabled={isOptimizationEnabled}
                skewX={displayedSkewX}
                skewY={displayedSkewY}
                globalSkewX={skewX}
                globalSkewY={skewY}
                onLineHeightMultiplierChange={onLineHeightMultiplierChange}
                onResetLineHeight={onResetLineHeight}
                onTextAlignChange={handleTextAlignInput}
                onViewportToggle={onViewportToggle}
                onResetViewport={onResetViewport}
                onSkewXChange={handleSkewXInput}
                onSkewYChange={handleSkewYInput}
                setIsOptimizationEnabled={setIsOptimizationEnabled}
                layoutSectionOpen={layoutSectionOpen}
                setLayoutSectionOpen={setLayoutSectionOpen}
            />

            <ImageQualityControls
                imageQualityMode={imageQualityMode}
                setImageQualityMode={setImageQualityMode}
                qualitySectionOpen={qualitySectionOpen}
                setQualitySectionOpen={setQualitySectionOpen}
            />
        </div>
    );
}