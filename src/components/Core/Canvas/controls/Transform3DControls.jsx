import React from "react";
import styles from "../Canvas.module.scss"; // Updated import path
import {MultiSelectSlider} from "./MultiSelectSlider.jsx";

export default function Transform3DControls({
                                                // State & Derived Values
                                                hasSelection,
                                                selectionCount,

                                                // 3D Helper Functions
                                                getSelectedTransformValues,
                                                handleSelectedTransformChange,
                                                handleReset3DTransforms,

                                                // Section visibility
                                                transform3DSectionOpen,
                                                setTransform3DSectionOpen,

                                                // Global 3D Settings
                                                global3DSettings,
                                                onGlobal3DSettingChange,
                                            }) {
    const getSingleValue = (property, defaultValue) => {
        if (!hasSelection) {
            return defaultValue;
        }
        const values = getSelectedTransformValues(property, defaultValue);
        return values.length > 0 ? values[0] : defaultValue;
    };

    // Add console warnings in development mode when required props are missing
    if (process.env.NODE_ENV === "development") {
        if (!hasSelection && !global3DSettings) {
            console.warn(
                "Transform3DControls: global3DSettings prop is missing for global mode"
            );
        }
        if (!hasSelection && !onGlobal3DSettingChange) {
            console.warn(
                "Transform3DControls: onGlobal3DSettingChange prop is missing for global mode"
            );
        }
    }

    return (
        <div className={styles.controlSection}>
            <button
                className={styles.sectionHeader}
                onClick={() => setTransform3DSectionOpen(!transform3DSectionOpen)}
            >
                <h3>🎭 3D Transformaties</h3>
                <span
                    className={`${styles.sectionToggle} ${
                        !transform3DSectionOpen ? styles.collapsed : ""
                    }`}
                >
					▼
				</span>
            </button>

            <div
                className={`${styles.sectionContent} ${
                    !transform3DSectionOpen ? styles.collapsed : ""
                }`}
            >
                {/* Info over 3D vs Container Skew */}
                <div className={styles.infoBox}>
                    <p className={styles.infoText}>
                        <strong>Container Skew:</strong> Hele gedicht scheef (hierboven)
                        <br/>
                        <strong>3D Transform:</strong> Individuele regels in 3D ruimte
                    </p>
                </div>

                {/* Per-line 3D controls (alleen als er selectie is) */}
                {hasSelection && (
                    <div className={styles.transform3DControls}>
                        <h4>
                            Enhanced Per-Text Controls ({selectionCount} regel
                            {selectionCount > 1 ? "s" : ""})
                        </h4>

                        {selectionCount > 1 ? (
                            <MultiSelectSlider
                                label="Per-Line Rotation"
                                min="-180"
                                max="180"
                                step="1"
                                values={getSelectedTransformValues("rotationZ", 0)}
                                onChange={(value, isRelative) =>
                                    handleSelectedTransformChange("rotationZ", value, isRelative)
                                }
                                unit="°"
                            />
                        ) : (
                            <div
                                className={`${styles.controlRow} ${styles.verticalControlRow}`}
                            >
                                <label
                                    htmlFor="transform3D-rotZ"
                                    title="Rotates selected text lines around their pivot point. Use with pivot settings for different effects."
                                >
                                    Per-Line Rotation ℹ️
                                </label>
                                <div className={styles.lineControls}>
                                    <input
                                        type="range"
                                        id="transform3D-rotZ"
                                        min="-180"
                                        max="180"
                                        step="1"
                                        value={getSingleValue("rotationZ", 0)}
                                        onChange={(e) =>
                                            handleSelectedTransformChange(
                                                "rotationZ",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                    <span>{getSingleValue("rotationZ", 0)}°</span>
                                </div>
                            </div>
                        )}

                        {selectionCount > 1 ? (
                            <MultiSelectSlider
                                label="Per-Line Scale"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                values={getSelectedTransformValues("uniformScale", 1)}
                                onChange={(value, isRelative) =>
                                    handleSelectedTransformChange(
                                        "uniformScale",
                                        value,
                                        isRelative
                                    )
                                }
                                unit="x"
                            />
                        ) : (
                            <div
                                className={`${styles.controlRow} ${styles.verticalControlRow}`}
                            >
                                <label
                                    htmlFor="transform3D-scale"
                                    title="Resizes selected text lines. Combines with 3D perspective for realistic depth effects."
                                >
                                    Per-Line Scale ℹ️
                                </label>
                                <div className={styles.lineControls}>
                                    <input
                                        type="range"
                                        id="transform3D-scale"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={getSingleValue("uniformScale", 1)}
                                        onChange={(e) =>
                                            handleSelectedTransformChange(
                                                "uniformScale",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                    <span>{getSingleValue("uniformScale", 1).toFixed(1)}x</span>
                                </div>
                            </div>
                        )}

                        {/* Pivot point selection */}
                        <div className={styles.controlGroup}>
                            <label title="Sets the anchor point for rotations and scaling. Top/Bottom create different visual effects.">
                                Pivot Point ℹ️
                            </label>
                            <div className={styles.buttonGroup}>
                                <button
                                    className={
                                        getSingleValue("pivotMode", "center") === "top"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        handleSelectedTransformChange("pivotMode", "top")
                                    }
                                >
                                    Top
                                </button>
                                <button
                                    className={
                                        getSingleValue("pivotMode", "center") === "center"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        handleSelectedTransformChange("pivotMode", "center")
                                    }
                                >
                                    Center
                                </button>
                                <button
                                    className={
                                        getSingleValue("pivotMode", "center") === "bottom"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        handleSelectedTransformChange("pivotMode", "bottom")
                                    }
                                >
                                    Bottom
                                </button>
                            </div>
                        </div>

                        {selectionCount > 1 ? (
                            <MultiSelectSlider
                                label="Z-diepte"
                                min="-200"
                                max="200"
                                step="1"
                                values={getSelectedTransformValues("z", 0)}
                                onChange={(value, isRelative) =>
                                    handleSelectedTransformChange("z", value, isRelative)
                                }
                                unit="px"
                            />
                        ) : (
                            <div
                                className={`${styles.controlRow} ${styles.verticalControlRow}`}
                            >
                                <label
                                    htmlFor="transform3D-z"
                                    title="Moves text forward/backward in 3D space. Positive values bring text forward, negative pushes back."
                                >
                                    Z-diepte ℹ️
                                </label>
                                <div className={styles.lineControls}>
                                    <input
                                        type="range"
                                        id="transform3D-z"
                                        min="-200"
                                        max="200"
                                        value={getSingleValue("z", 0)}
                                        onChange={(e) =>
                                            handleSelectedTransformChange("z", Number(e.target.value))
                                        }
                                    />
                                    <span>{getSingleValue("z", 0)}px</span>
                                </div>
                            </div>
                        )}

                        {selectionCount > 1 ? (
                            <MultiSelectSlider
                                label="3D Perspective"
                                min="-45"
                                max="45"
                                step="1"
                                values={getSelectedTransformValues("rotationY", 0)}
                                onChange={(value, isRelative) =>
                                    handleSelectedTransformChange("rotationY", value, isRelative)
                                }
                                unit="°"
                            />
                        ) : (
                            <div
                                className={`${styles.controlRow} ${styles.verticalControlRow}`}
                            >
                                <label
                                    htmlFor="transform3D-rotY"
                                    title="Tilts text in 3D space to create perspective effects. Essential for realistic gevel effects."
                                >
                                    3D Perspective ℹ️
                                </label>
                                <div className={styles.lineControls}>
                                    <input
                                        type="range"
                                        id="transform3D-rotY"
                                        min="-45"
                                        max="45"
                                        value={getSingleValue("rotationY", 0)}
                                        onChange={(e) =>
                                            handleSelectedTransformChange(
                                                "rotationY",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                    <span>{getSingleValue("rotationY", 0)}°</span>
                                </div>
                            </div>
                        )}

                        {/* Per-line lighting controls */}
                        <div className={styles.controlGroup}>
                            <div className={styles.controlRow}>
                                <input
                                    type="checkbox"
                                    id="per-line-lighting-enabled"
                                    checked={getSingleValue("lighting.enabled", false)}
                                    onChange={(e) =>
                                        handleSelectedTransformChange(
                                            "lighting.enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label htmlFor="per-line-lighting-enabled">
                                    Enable Fine-grained Lighting (per regel)
                                </label>
                            </div>
                        </div>

                        {getSingleValue("lighting.enabled", false) && (
                            <>
                                {/* Per-line lighting intensity */}
                                {selectionCount > 1 ? (
                                    <MultiSelectSlider
                                        label="Per-Line Light Intensity"
                                        min="0.1"
                                        max="2"
                                        step="0.1"
                                        values={getSelectedTransformValues("lighting.intensity", 1)}
                                        onChange={(value, isRelative) =>
                                            handleSelectedTransformChange(
                                                "lighting.intensity",
                                                value,
                                                isRelative
                                            )
                                        }
                                        unit=""
                                    />
                                ) : (
                                    <div
                                        className={`${styles.controlRow} ${styles.verticalControlRow}`}
                                    >
                                        <label htmlFor="per-line-lighting-intensity">
                                            Per-Line Light Intensity
                                        </label>
                                        <div className={styles.lineControls}>
                                            <input
                                                type="range"
                                                id="per-line-lighting-intensity"
                                                min="0.1"
                                                max="2"
                                                step="0.1"
                                                value={getSingleValue("lighting.intensity", 1)}
                                                onChange={(e) =>
                                                    handleSelectedTransformChange(
                                                        "lighting.intensity",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                            <span>
												{getSingleValue("lighting.intensity", 1).toFixed(1)}
											</span>
                                        </div>
                                    </div>
                                )}

                                {/* Per-line ambient light */}
                                {selectionCount > 1 ? (
                                    <MultiSelectSlider
                                        label="Per-Line Ambient Light"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        values={getSelectedTransformValues("lighting.ambient", 0.3)}
                                        onChange={(value, isRelative) =>
                                            handleSelectedTransformChange(
                                                "lighting.ambient",
                                                value,
                                                isRelative
                                            )
                                        }
                                        unit=""
                                    />
                                ) : (
                                    <div
                                        className={`${styles.controlRow} ${styles.verticalControlRow}`}
                                    >
                                        <label htmlFor="per-line-lighting-ambient">
                                            Per-Line Ambient Light
                                        </label>
                                        <div className={styles.lineControls}>
                                            <input
                                                type="range"
                                                id="per-line-lighting-ambient"
                                                min="0.1"
                                                max="1"
                                                step="0.1"
                                                value={getSingleValue("lighting.ambient", 0.3)}
                                                onChange={(e) =>
                                                    handleSelectedTransformChange(
                                                        "lighting.ambient",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                            <span>
												{getSingleValue("lighting.ambient", 0.3).toFixed(1)}
											</span>
                                        </div>
                                    </div>
                                )}

                                {/* Warning when both global and per-line lighting are enabled */}
                                {(global3DSettings?.globalLighting?.enabled || false) && (
                                    <div className={styles.infoBox}>
                                        <p className={styles.infoText} style={{color: "#ff9800"}}>
                                            ⚠️ Het kan dat sommige regels al minimale/maximale
                                            lichtintensiteit ambient light hebben als je finegrained
                                            met global lighting combineert
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Reset button */}
                        <div className={styles.controlRow}>
                            <button
                                type="button"
                                className={styles.iconResetButton}
                                onClick={handleReset3DTransforms}
                                title="Reset All 3D Effects"
                            >
                                ↺
                            </button>
                            {" "}
                        </div>
                    </div>
                )}

                {/* Gevel Realism Effects */}
                {!hasSelection && (
                    <div className={styles.gevelEffects}>
                        <h5>Gevel Realism Effects</h5>
                        <div className={styles.infoBox}>
                            <p className={styles.infoText}>
                                Deze effecten zijn alleen beschikbaar als er geen regels
                                geselecteerd zijn.
                            </p>
                        </div>

                        {/* Global lighting simulation */}
                        <div className={styles.controlGroup}>
                            <div className={styles.controlRow}>
                                <input
                                    type="checkbox"
                                    id="global-lighting-enabled"
                                    checked={global3DSettings?.globalLighting?.enabled || false}
                                    onChange={(e) =>
                                        onGlobal3DSettingChange(
                                            "globalLighting.enabled",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label
                                    htmlFor="global-lighting-enabled"
                                    title="Simulates how light falls on 3D text surfaces. Works best with 3D transformations applied."
                                >
                                    Enable Global Lighting ℹ️
                                </label>
                            </div>
                        </div>

                        {(global3DSettings?.globalLighting?.enabled || false) && (
                            <>
                                {/* Global lighting intensity */}
                                <div
                                    className={`${styles.controlRow} ${styles.verticalControlRow}`}
                                >
                                    <label
                                        htmlFor="global-lighting-intensity"
                                        title="Controls how bright the lighting effect is. Higher values create stronger highlights and shadows."
                                    >
                                        Global Light Intensity ℹ️
                                    </label>
                                    <div className={styles.lineControls}>
                                        <input
                                            type="range"
                                            id="global-lighting-intensity"
                                            min="0.1"
                                            max="2"
                                            step="0.1"
                                            value={global3DSettings?.globalLighting?.intensity || 1}
                                            onChange={(e) =>
                                                onGlobal3DSettingChange(
                                                    "globalLighting.intensity",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                        <span>
											{(
                                                global3DSettings?.globalLighting?.intensity || 1
                                            ).toFixed(1)}
										</span>
                                    </div>
                                </div>

                                {/* Global ambient light */}
                                <div
                                    className={`${styles.controlRow} ${styles.verticalControlRow}`}
                                >
                                    <label
                                        htmlFor="global-lighting-ambient"
                                        title="Base lighting level that affects all surfaces. Higher values reduce contrast, lower values increase shadows."
                                    >
                                        Global Ambient Light ℹ️
                                    </label>
                                    <div className={styles.lineControls}>
                                        <input
                                            type="range"
                                            id="global-lighting-ambient"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={global3DSettings?.globalLighting?.ambient || 0.3}
                                            onChange={(e) =>
                                                onGlobal3DSettingChange(
                                                    "globalLighting.ambient",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                        <span>
											{(
                                                global3DSettings?.globalLighting?.ambient || 0.3
                                            ).toFixed(1)}
										</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Material blend modes */}
                        <div className={styles.controlGroup}>
                            <label title="Changes how text colors mix with the background. Requires colored background and text to be visible.">
                                Material Blend Mode ℹ️
                            </label>
                            <select
                                value={global3DSettings?.material?.blendMode || "normal"}
                                onChange={(e) =>
                                    onGlobal3DSettingChange("material.blendMode", e.target.value)
                                }
                                style={{width: "100%", padding: "4px"}}
                                title="Select how text blends with background colors"
                            >
                                <option
                                    value="normal"
                                    title="Standard rendering, natural appearance"
                                >
                                    Normal
                                </option>
                                <option
                                    value="multiply"
                                    title="Darkens text, creates shadows - good for carved stone effect"
                                >
                                    Multiply (Darker)
                                </option>
                                <option
                                    value="overlay"
                                    title="Increases contrast, weathered texture - good for stone carving"
                                >
                                    Overlay (Contrast)
                                </option>
                                <option
                                    value="screen"
                                    title="Lightens text, creates highlights - good for polished metal"
                                >
                                    Screen (Lighter)
                                </option>
                                <option
                                    value="add"
                                    title="Creates glow effects - good for backlit glass or neon"
                                >
                                    Add (Glow)
                                </option>
                            </select>
                        </div>

                        {/* Gevel preset configurations */}
                        <div className={styles.controlGroup}>
                            <label
                                title="Pre-configured combinations of lighting and blend modes that simulate text on architectural surfaces. Works best with colored backgrounds and 3D transformations.">
                                Gevel Presets ℹ️
                            </label>
                            <div className={styles.infoBox} style={{marginBottom: "8px"}}>
                                <p
                                    className={styles.infoText}
                                    style={{fontSize: "12px", margin: 0}}
                                >
                                    Quick material effects for architectural surfaces. Hover
                                    buttons for details.
                                </p>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button
                                    className={
                                        global3DSettings?.gevelPreset === "brick"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        onGlobal3DSettingChange("gevelPreset", "brick")
                                    }
                                    title="Dark, shadowed text like carved into brick"
                                >
                                    🧱 Brick
                                </button>
                                <button
                                    className={
                                        global3DSettings?.gevelPreset === "stone"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        onGlobal3DSettingChange("gevelPreset", "stone")
                                    }
                                    title="Weathered, textured appearance like stone carving"
                                >
                                    🪨 Stone
                                </button>
                                <button
                                    className={
                                        global3DSettings?.gevelPreset === "metal"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        onGlobal3DSettingChange("gevelPreset", "metal")
                                    }
                                    title="Bright, reflective text like polished metal lettering"
                                >
                                    ⚙️ Metal
                                </button>
                                <button
                                    className={
                                        global3DSettings?.gevelPreset === "glass"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() =>
                                        onGlobal3DSettingChange("gevelPreset", "glass")
                                    }
                                    title="Translucent, glowing text like etched or backlit glass"
                                >
                                    🪟 Glass
                                </button>
                                <button
                                    className={
                                        global3DSettings?.gevelPreset === "wood"
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() => onGlobal3DSettingChange("gevelPreset", "wood")}
                                    title="Natural, warm text like carved or painted wood"
                                >
                                    🪵 Wood
                                </button>
                            </div>

                            {/* Show current preset info */}
                            {global3DSettings?.gevelPreset && (
                                <div
                                    className={styles.infoBox}
                                    style={{marginTop: "8px", background: "#e8f5e8"}}
                                >
                                    <p
                                        className={styles.infoText}
                                        style={{fontSize: "12px", margin: 0, color: "#2e7d32"}}
                                    >
                                        ✓ Active:{" "}
                                        {global3DSettings.gevelPreset.charAt(0).toUpperCase() +
                                            global3DSettings.gevelPreset.slice(1)}{" "}
                                        preset applied
                                    </p>
                                </div>
                            )}

                            {/* Reset preset button */}
                            {global3DSettings?.gevelPreset && (
                                <div className={styles.controlRow} style={{marginTop: "8px"}}>
                                    <button
                                        type="button"
                                        onClick={() => onGlobal3DSettingChange("gevelPreset", null)}
                                        title="Clear Gevel Preset"
                                        style={{
                                            width: "100%",
                                            padding: "6px 12px",
                                            background: "#f5f5f5",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            color: "#666",
                                        }}
                                    >
                                        Clear Preset
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
