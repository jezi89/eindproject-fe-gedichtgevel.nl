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
                                     onLineSkewXChange, // <-- NIEUW
                                     skewY,
                                     onSkewYChange,
                                     onLineSkewYChange, // <-- NIEUW
                                     onLineTextAlignChange, // <-- NIEUW

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

                                     // Image quality props
                                     imageQualityMode,
                                     setImageQualityMode,

                                     // Text Background Props
                                     textMaterial,
                                     onTextMaterialChange,
                                     textPadding,
                                     onTextPaddingChange,
                                     textEffectMode,
                                     setTextEffectMode,
                                     textEffectParams,
                                     setTextEffectParams,

                                     totalLineCount = 0, // <-- NIEUW
                                     onResetAllText, // <-- NIEUW: Reset alle tekst edits
                                     onToggleLayoutPosition, // <-- NIEUW: Wissel layout positie
                                     layoutPosition, // <-- NIEUW: Voor dropdown positioning
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
    const [materialSectionOpen, setMaterialSectionOpen] = useState(false); // <-- RESTORED

    const [colorSubsectionOpen, setColorSubsectionOpen] = useState(false);

    const selectionCount = selectedLines.size;
    const hasSelection = selectionCount > 0;
    // Check of alles geselecteerd is (behalve titel/auteur die -1/-2 zijn)
    // We tellen alleen de positieve indices voor "Select All" logica van regels
    const selectedLineIndices = Array.from(selectedLines).filter(i => i >= 0);
    const isSelectAll = totalLineCount > 0 && selectedLineIndices.length === totalLineCount;

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
    const displayedLetterSpacing = useMemo(() => {
        if (!hasSelection) return letterSpacing;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.letterSpacing ?? letterSpacing;
    }, [hasSelection, selectedLines, lineOverrides, letterSpacing]);

    // Bepaal welke lettergrootte getoond wordt voor geselecteerde regel
    const displayedFontSize = useMemo(() => {
        if (!hasSelection) return fontSize;
        const firstIndex = Array.from(selectedLines)[0];
        return lineOverrides[firstIndex]?.fontSize ?? fontSize;
    }, [hasSelection, selectedLines, lineOverrides, fontSize]);

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

    // NIEUW: Bepaal displayed Skew & Align
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

    // NIEUW: Wrapped Handlers
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

            {/* NIEUW: Selection Indicator - Compact Design */}
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
                isSelectAll={isSelectAll} // <-- NIEUW
                selectionCount={selectionCount}
                letterSpacing={letterSpacing} // <-- NIEUW
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
                layoutPosition={layoutPosition} // <-- NIEUW
            />

            <LayoutControls
                lineHeightMultiplier={lineHeightMultiplier}
                fontSize={fontSize}
                isSelectAll={isSelectAll} // <-- NIEUW
                hasSelection={hasSelection} // <-- NIEUW
                textAlign={displayedTextAlign} // <-- Updated
                viewportDragEnabled={viewportDragEnabled}
                isOptimizationEnabled={isOptimizationEnabled}
                skewX={displayedSkewX} // <-- Updated
                skewY={displayedSkewY} // <-- Updated
                globalSkewX={skewX} // <-- NIEUW
                globalSkewY={skewY} // <-- NIEUW
                onLineHeightMultiplierChange={onLineHeightMultiplierChange}
                onResetLineHeight={onResetLineHeight}
                onTextAlignChange={handleTextAlignInput} // <-- Updated
                onViewportToggle={onViewportToggle}
                onResetViewport={onResetViewport}
                onSkewXChange={handleSkewXInput} // <-- Updated
                onSkewYChange={handleSkewYInput} // <-- Updated
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