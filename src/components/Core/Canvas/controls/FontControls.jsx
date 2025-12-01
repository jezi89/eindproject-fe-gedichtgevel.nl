import React, { useState, useEffect, useRef } from "react";
import styles from "../Canvas.module.scss";
import { getFontPreviewUrl } from "../../../../hooks/canvas/useFontManager";
import fontMetadata from "../../../../data/font-metadata.json";
import ColorPicker from './ColorPicker';

const getWeightLabel = (weight) => {
    const labels = {
        100: 'Thin',
        200: 'Extra Light',
        300: 'Light',
        400: 'Normal',
        500: 'Medium',
        600: 'Semi Bold',
        700: 'Bold',
        800: 'Extra Bold',
        900: 'Black'
    };
    return labels[weight] || '';
};

// Helper component for individual font options with lazy preview loading
const FontOption = ({ font, onSelect, isSelected }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const url = getFontPreviewUrl(font.value);
        if (url) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            link.onload = () => setIsLoaded(true);
            document.head.appendChild(link);
            // We don't remove the link to keep the font available
        }
    }, [font.value]);

    return (
        <div
            className={`${styles.fontOption} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(font.value)}
            style={{ 
                fontFamily: isLoaded ? font.value : 'inherit',
                opacity: isLoaded ? 1 : 0.7 
            }}
            title={font.label}
        >
            {font.label}
        </div>
    );
};

import { createPortal } from "react-dom";

const CustomFontSelect = ({ value, onChange, options, layoutPosition }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);

    // Update position when opening
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                const rect = triggerRef.current.getBoundingClientRect();
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                
                // Determine direction based on layoutPosition or space available
                // For now, simple logic: if swapped (right side), align right edge.
                
                let left = rect.left;
                if (layoutPosition === 'swapped') {
                    // Align right edge of dropdown with right edge of trigger
                    // But since the dropdown is wider (300px), we need to adjust
                    // rect.right - 300px
                    left = rect.right - 300; 
                }

                setDropdownPosition({
                    top: rect.bottom + scrollTop,
                    left: left,
                    width: rect.width
                });
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true); // Capture scroll to handle parent scrolling

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        }
    }, [isOpen, layoutPosition]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target)) {
                // Check if click is inside the portal content (which is not a child in DOM tree but is in React tree? 
                // No, for Portal we need a specific check or just rely on the fact that the portal is at body level)
                // Actually, checking if target is closest to .optionsList might be needed if we don't stop propagation.
                // But simpler: if it's not the trigger, close it. 
                // Wait, if we click inside the dropdown, we don't want to close immediately unless an option is selected.
                // The dropdown content is in a portal, so `triggerRef.current.contains` will return false.
                
                // We can check if the click target is inside the dropdown by ID or class
                if (!event.target.closest(`.${styles.optionsList}`)) {
                     setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Find current label
    const currentLabel = options.flatMap(g => g.fonts).find(f => f.value === value)?.label || value;

    return (
        <div className={styles.customSelect}>
            <button 
                ref={triggerRef}
                className={styles.selectTrigger} 
                onClick={() => setIsOpen(!isOpen)}
                style={{ fontFamily: value }}
            >
                {currentLabel}
                <span className={styles.arrow}>▼</span>
            </button>

            {isOpen && createPortal(
                <div 
                    className={styles.optionsList}
                    style={{
                        position: 'absolute',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        // width: '300px', // Defined in CSS
                        zIndex: 9999 // Ensure it's on top of everything
                    }}
                >
                    {options.map((group) => (
                        <div key={group.label} className={styles.optGroup}>
                            <div className={styles.groupLabel}>{group.label}</div>
                            {group.fonts.map((font) => (
                                <FontOption 
                                    key={font.value} 
                                    font={font} 
                                    onSelect={(val) => {
                                        onChange(val);
                                        setIsOpen(false);
                                    }}
                                    isSelected={font.value === value}
                                />
                            ))}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default function FontControls({
                                         // State & Derived Values
                                         availableFonts,
                                         displayedFontFamily,
                                         fontWeight,
                                         fontStyle,
                                         fontSize,
                                         hasSelection,
                                         isSelectAll,
                                         selectionCount,
                                         displayedFontSize,
                                         letterSpacing,
                                         displayedLetterSpacing,

                                         // Color System State
                                         displayedColor,
                                         effectiveTitleColor,
                                         hasTitleColorOverride,
                                         effectiveAuthorColor,
                                         hasAuthorColorOverride,

                                         // Handlers
                                         onFontFamilyChange,
                                         onFontWeightChange,
                                         onFontStyleChange,
                                         onFontSizeChange,
                                         onLineFontSizeChange,
                                         onLetterSpacingChange,
                                         onLineLetterSpacingChange,

                                         // Color System Handlers
                                         handleColorInput,
                                         onColorPickerActiveChange,
                                         handleResetSelectedLines,
                                         onTitleColorChange,
                                         onResetTitleColor,
                                         onAuthorColorChange,
                                         onResetAuthorColor,

                                         // Section visibility
                                         fontSectionOpen,
                                         setFontSectionOpen,
                                         colorSubsectionOpen,
                                         setColorSubsectionOpen,
                                         layoutPosition, // <-- Received from Controls
                                     }) {
    return (
        <div className={styles.controlSection}>
            <button
                className={styles.sectionHeader}
                onClick={() => setFontSectionOpen(!fontSectionOpen)}
            >
                <h3>✒️ Font & Stijl</h3>
                <span
                    className={`${styles.sectionToggle} ${
                        !fontSectionOpen ? styles.collapsed : ""
                    }`}
                >
					▼
				</span>
            </button>

            <div
                className={`${styles.sectionContent} ${
                    !fontSectionOpen ? styles.collapsed : ""
                }`}
            >
                {/* Font Family */}
                <div className={styles.controlRow}>
                    <label htmlFor="fontFamily">Lettertype</label>
                    <CustomFontSelect
                        value={displayedFontFamily}
                        onChange={onFontFamilyChange}
                        options={availableFonts}
                        layoutPosition={layoutPosition}
                    />
                </div>

                {/* Font Style Controls (Bold/Italic + Weight) */}
                <div className={styles.controlRow}>
                    <label>Tekststijl</label>
                    <div className={styles.buttonGroup} style={{ flexWrap: 'wrap', gap: '4px' }}>
                        <button
                            className={fontWeight === "bold" || fontWeight === "700" ? styles.active : ""}
                            onClick={() =>
                                onFontWeightChange(fontWeight === "bold" || fontWeight === "700" ? "normal" : "bold")
                            }
                            title="Snel Vetgedrukt (700)"
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            className={fontStyle === "italic" ? styles.active : ""}
                            onClick={() =>
                                onFontStyleChange(
                                    fontStyle === "italic" ? "normal" : "italic"
                                )
                            }
                            title="Cursief"
                        >
                            <em>I</em>
                        </button>
                        
                        {/* Specific Weight Dropdown */}
                        <select
                            value={fontWeight === "bold" ? "700" : (fontWeight === "normal" ? "400" : fontWeight)}
                            onChange={(e) => onFontWeightChange(e.target.value)}
                            className={styles.weightSelect}
                            style={{ width: 'auto', flex: 1, minWidth: '60px', fontFamily: 'var(--font-family-section-heading)' }}
                            title="Specifieke dikte (100-900)"
                        >
                            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => {
                                const weightStr = weight.toString();
                                // Check availability
                                const availableWeights = fontMetadata[displayedFontFamily] || ['400', '700']; // Default fallback
                                const isAvailable = availableWeights.includes(weightStr);
                                
                                return (
                                    <option 
                                        key={weight} 
                                        value={weightStr}
                                        disabled={!isAvailable}
                                        style={{ color: isAvailable ? 'inherit' : '#aaa' }}
                                    >
                                        {weight} ({getWeightLabel(weight)}) {isAvailable ? '' : '(N/A)'}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Font Size Controls */}
                {(!hasSelection || isSelectAll) ? (
                    // Global Font Size
                    <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
                        <label htmlFor="fontSize">Lettergrootte</label>
                        <div className={styles.lineControls}>
                            <input
                                type="range"
                                id="fontSize"
                                min="6"
                                max="120"
                                value={fontSize}
                                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                            />
                            <span>{fontSize}px</span>
                        </div>
                    </div>
                ) : (
                    // Selection Font Size (Relative Display)
                    <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
                        <label htmlFor="lineFontSize">
                            Lettergrootte ({selectionCount} {selectionCount === 1 ? "regel" : "regels"})
                        </label>
                        <div className={styles.lineControls}>
                            <input
                                type="range"
                                id="lineFontSize"
                                min="6"
                                max="120"
                                value={displayedFontSize}
                                onChange={(e) => onLineFontSizeChange(Number(e.target.value))}
                            />
                            <span>
                                {displayedFontSize}px
                                <span className={styles.deltaValue}>
                                    ({displayedFontSize - fontSize > 0 ? "+" : ""}
                                    {displayedFontSize - fontSize}px)
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Letter Spacing Controls */}
                {(!hasSelection || isSelectAll) ? (
                     // Global Letter Spacing
                    <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
                        <label htmlFor="letterSpacing">Letterafstand</label>
                        <div className={styles.lineControls}>
                            <input
                                type="range"
                                id="letterSpacing"
                                min="-5"
                                max="15"
                                value={displayedLetterSpacing}
                                onChange={(e) => onLetterSpacingChange(Number(e.target.value))}
                            />
                            <span>{displayedLetterSpacing}px</span>
                        </div>
                    </div>
                ) : (
                    // Selection Letter Spacing (Relative Display)
                    <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
                        <label htmlFor="lineLetterSpacing">
                            Afstand ({selectionCount} {selectionCount === 1 ? "regel" : "regels"})
                        </label>
                        <div className={styles.lineControls}>
                            <input
                                type="range"
                                id="lineLetterSpacing"
                                min="-5"
                                max="15"
                                value={displayedLetterSpacing}
                                onChange={(e) => onLineLetterSpacingChange(Number(e.target.value))}
                            />
                            <span>
                                {displayedLetterSpacing}px
                                <span className={styles.deltaValue}>
                                    ({(displayedLetterSpacing - letterSpacing) > 0 ? "+" : ""}
                                    {displayedLetterSpacing - letterSpacing}px)
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* --- KLEUR CONTROLS SUBSECTIE --- */}
                <div className={styles.subsection}>
                    <button
                        className={styles.subsectionHeader}
                        onClick={() => setColorSubsectionOpen(!colorSubsectionOpen)}
                    >
                        <span>🎨 Kleur Controls</span>
                        <span
                            className={`${styles.sectionToggle} ${
                                !colorSubsectionOpen ? styles.collapsed : ""
                            }`}
                        >
							▼
						</span>
                    </button>

                    <div
                        className={`${styles.subsectionContent} ${
                            !colorSubsectionOpen ? styles.collapsed : ""
                        }`}
                    >


                        {/* Main Color Picker met Multi-Select Support */}
                        <div
                            className={`${styles.controlRow} ${
                                hasSelection ? styles.controlColumn : ""
                            }`}
                        >
                            <label htmlFor="fillColor">
                                {hasSelection
                                    ? `Kleur (${selectionCount} ${
                                        selectionCount === 1 ? "regel" : "regels"
                                    })`
                                    : "Globale Kleur"}
                            </label>
                            <div className={styles.colorControls}>
                                <ColorPicker
                                    value={displayedColor}
                                    onChange={(val) => handleColorInput(val)}
                                    onActiveChange={onColorPickerActiveChange}
                                    title="Kies tekstkleur"
                                />
                                {hasSelection && (
                                    <div className={styles.lineControls}>
										<span className={styles.hintText}>
											{selectionCount > 1
                                                ? "Pas kleur toe op alle geselecteerde regels."
                                                : "Kleur voor de geselecteerde regel."}
										</span>
                                        <button
                                            type="button"
                                            className={styles.iconResetButton}
                                            onClick={handleResetSelectedLines}
                                            title="Reset regelkleur en letterafstand"
                                        >
                                            ↺
                                        </button>
                                        {" "}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hierarchical Title Color Control */}
                        <div className={styles.controlRow}>
                            <label htmlFor="titleColor">
                                <span className={styles.labelText}>Titel Kleur</span>
                                <span className={styles.colorIndicator}>
									{hasTitleColorOverride ? (
                                        <span
                                            title="Specifieke titel kleur actief"
                                            className={styles.overrideActive}
                                        >
											⚙️
										</span>
                                    ) : (
                                        <span
                                            title="Volgt globale kleur"
                                            className={styles.globalActive}
                                        >
											🔗
										</span>
                                    )}
								</span>
                            </label>
                            <div className={styles.colorControls}>
                                <ColorPicker
                                    value={effectiveTitleColor}
                                    onChange={(val) => onTitleColorChange(val)}
                                    onActiveChange={onColorPickerActiveChange}
                                    title={
                                        hasTitleColorOverride
                                            ? "Specifieke titel kleur"
                                            : "Klik om titel kleur aan te passen (overschrijft globaal)"
                                    }
                                />
                                {hasTitleColorOverride && (
                                    <button
                                        type="button"
                                        className={styles.resetColorButton}
                                        onClick={onResetTitleColor}
                                        title="Reset naar globale kleur"
                                    >
                                        ↺
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hierarchical Author Color Control */}
                        <div className={styles.controlRow}>
                            <label htmlFor="authorColor">
                                <span className={styles.labelText}>Auteur Kleur</span>
                                <span className={styles.colorIndicator}>
									{hasAuthorColorOverride ? (
                                        <span
                                            title="Specifieke auteur kleur actief"
                                            className={styles.overrideActive}
                                        >
											⚙️
										</span>
                                    ) : (
                                        <span
                                            title="Volgt globale kleur"
                                            className={styles.globalActive}
                                        >
											🔗
										</span>
                                    )}
								</span>
                            </label>
                            <div className={styles.colorControls}>
                                <ColorPicker
                                    value={effectiveAuthorColor}
                                    onChange={(val) => onAuthorColorChange(val)}
                                    onActiveChange={onColorPickerActiveChange}
                                    title={
                                        hasAuthorColorOverride
                                            ? "Specifieke auteur kleur"
                                            : "Klik om auteur kleur aan te passen (overschrijft globaal)"
                                    }
                                />
                                {hasAuthorColorOverride && (
                                    <button
                                        type="button"
                                        className={styles.resetColorButton}
                                        onClick={onResetAuthorColor}
                                        title="Reset naar globale kleur"
                                    >
                                        ↺
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
