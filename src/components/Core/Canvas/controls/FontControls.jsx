// src/components/Core/Canvas/components/controls/FontControls.jsx

import React from "react";
import styles from "../Canvas.module.scss"; // Updated import path

export default function FontControls({
                                         // State & Derived Values
                                         availableFonts,
                                         displayedFontFamily,
                                         fontWeight,
                                         fontStyle,
                                         fontSize,
                                         hasSelection,
                                         selectionCount,
                                         displayedFontSize,
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
                    <select
                        id="fontFamily"
                        value={displayedFontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value)}
                        style={{width: "100%", padding: "4px"}}
                    >
                        {availableFonts.map((font) => (
                            <option key={font.name} value={font.value}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Font Style Controls (Bold/Italic) */}
                <div className={styles.controlRow}>
                    <label>Tekststijl</label>
                    <div className={styles.buttonGroup}>
                        <button
                            className={fontWeight === "bold" ? styles.active : ""}
                            onClick={() =>
                                onFontWeightChange(fontWeight === "bold" ? "normal" : "bold")
                            }
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
                        >
                            <em>I</em>
                        </button>
                    </div>
                </div>

                {/* Font Size - Global */}
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

                {/* Font Size - Selection (conditional) */}
                {hasSelection && (
                    <div
                        className={`${styles.controlRow} ${styles.verticalControlRow}`}
                    >
                        <label htmlFor="lineFontSize">
                            Lettergrootte ({selectionCount}{" "}
                            {selectionCount === 1 ? "regel" : "regels"})
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
                            <span>{displayedFontSize}px</span>
                        </div>
                    </div>
                )}

                {/* Letter Spacing */}
                <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
                    <label htmlFor="letterSpacing">
                        {hasSelection
                            ? `Afstand (${selectionCount} ${
                                selectionCount === 1 ? "regel" : "regels"
                            })`
                            : "Letterafstand"}
                    </label>
                    <div className={styles.lineControls}>
                        <input
                            type="range"
                            id="letterSpacing"
                            min="-5"
                            max="15"
                            value={`${displayedLetterSpacing}`}
                            onChange={(e) => {
                                const newSpacing = Number(e.target.value);
                                if (hasSelection) {
                                    onLineLetterSpacingChange(newSpacing);
                                } else {
                                    onLetterSpacingChange(newSpacing);
                                }
                            }}
                        />
                        <span>{displayedLetterSpacing}px</span>
                    </div>
                </div>

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
                                <input
                                    type="color"
                                    id="fillColor"
                                    value={displayedColor}
                                    onChange={(e) => handleColorInput(e.target.value)}
                                    onFocus={() => onColorPickerActiveChange?.(true)}
                                    onBlur={() => onColorPickerActiveChange?.(false)}
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
                                <input
                                    type="color"
                                    id="titleColor"
                                    value={effectiveTitleColor}
                                    onChange={(e) => {
                                        console.log(
                                            "🔴 TITLE onChange triggered! Value:",
                                            e.target.value
                                        );
                                        onTitleColorChange(e.target.value);
                                    }}
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
                                <input
                                    type="color"
                                    id="authorColor"
                                    value={effectiveAuthorColor}
                                    onChange={(e) => onAuthorColorChange(e.target.value)}
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
