 // src/components/Core/Canvas/components/controls/LayoutControls.jsx

import React from "react";
import styles from "../Canvas.module.scss"; // Updated import path

export default function LayoutControls({
                                           // State & Derived Values
                                           lineHeightMultiplier,
                                           fontSize,
                                           textAlign,
                                           viewportDragEnabled,
                                           isTempCameraControlActive, // For C-key state
                                           isOptimizationEnabled,
                                           skewX,
                                           skewY,
                                           globalSkewX, // <-- NIEUW
                                           globalSkewY, // <-- NIEUW
                                           hasSelection, // <-- NIEUW
                                           isSelectAll, // <-- NIEUW

                                           // Handlers
                                           onLineHeightMultiplierChange,
                                           onResetLineHeight,
                                           onTextAlignChange,
                                           onViewportToggle,
                                           onResetViewport,
                                           onSkewXChange,
                                           onSkewYChange,
                                           setIsOptimizationEnabled,

                                           // Section visibility
                                           layoutSectionOpen,
                                           setLayoutSectionOpen,
                                       }) {
    return (
        <div className={styles.controlSection}>
            <button
                className={styles.sectionHeader}
                onClick={() => setLayoutSectionOpen(!layoutSectionOpen)}
            >
                <h3>📐 Layout & Positie</h3>
                <span
                    className={`${styles.sectionToggle} ${
                        !layoutSectionOpen ? styles.collapsed : ""
                    }`}
                >
					▼
				</span>
            </button>

            <div
                className={`${styles.sectionContent} ${
                    !layoutSectionOpen ? styles.collapsed : ""
                }`}
            >
                {/* Line Height */}
                <div className={styles.controlGroup}>
                    <label htmlFor="lineHeightMultiplier">
                        Regelhoogte (verhouding)
                    </label>
                    <input
                        className={styles.fullWidthRange}
                        type="range"
                        id="lineHeightMultiplier"
                        min={1.0}
                        max={2.5}
                        step={0.01}
                        value={lineHeightMultiplier}
                        onChange={(e) =>
                            onLineHeightMultiplierChange(parseFloat(e.target.value))
                        }
                    />
                    <div className={styles.valueRow}>
                        <span>{lineHeightMultiplier.toFixed(2)}×</span>
                        <span>{Math.round(fontSize * lineHeightMultiplier)}px</span>
                    </div>
                    <div className={styles.controlRow}>
                        <button
                            type="button"
                            className={styles.iconResetButton}
                            onClick={onResetLineHeight}
                        >
                            ↺
                        </button>
                    </div>
                </div>

                {/* Text Alignment */}
                <div className={styles.controlRow}>
                    <label>Uitlijning</label>
                    <div className={styles.buttonGroup}>
                        <button
                            className={textAlign === "left" ? styles.active : ""}
                            onClick={() => onTextAlignChange("left")}
                        >
                            Links
                        </button>
                        <button
                            className={textAlign === "center" ? styles.active : ""}
                            onClick={() => onTextAlignChange("center")}
                        >
                            Mid.
                        </button>
                        <button
                            className={textAlign === "right" ? styles.active : ""}
                            onClick={() => onTextAlignChange("right")}
                        >
                            Rechts
                        </button>
                    </div>
                </div>

                {/* Horizontale Skew */}
                {(!hasSelection || isSelectAll) ? (
                    <div className={styles.controlGroup}>
                        <label htmlFor="skewX">
                            Horizontale Skew
                        </label>
                        <input
                            className={styles.fullWidthRange}
                            type="range"
                            id="skewX"
                            min={-45}
                            max={45}
                            step={0.1}
                            value={skewX || 0}
                            onChange={(e) => onSkewXChange(parseFloat(e.target.value))}
                        />
                        <div className={styles.valueRow}>
                            <span>{(skewX || 0).toFixed(1)}°</span>
                            <button
                                type="button"
                                className={styles.iconResetButton}
                                onClick={() => onSkewXChange(0)}
                                title="Reset horizontale skew"
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.controlGroup}>
                        <label htmlFor="lineSkewX">
                            Horizontale Skew (Selectie)
                        </label>
                        <input
                            className={styles.fullWidthRange}
                            type="range"
                            id="lineSkewX"
                            min={-45}
                            max={45}
                            step={0.1}
                            value={skewX || 0}
                            onChange={(e) => onSkewXChange(parseFloat(e.target.value))}
                        />
                        <div className={styles.valueRow}>
                            <span>
                                {(skewX || 0).toFixed(1)}°
                                <span className={styles.deltaValue}>
                                    ({(skewX - globalSkewX).toFixed(1) > 0 ? "+" : ""}
                                    {(skewX - globalSkewX).toFixed(1)}°)
                                </span>
                            </span>
                            <button
                                type="button"
                                className={styles.iconResetButton}
                                onClick={() => onSkewXChange(globalSkewX)}
                                title="Reset naar globale skew"
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                )}

                {/* Verticale Skew */}
                {(!hasSelection || isSelectAll) ? (
                    <div className={styles.controlGroup}>
                        <label htmlFor="skewY">
                            Verticale Skew
                        </label>
                        <input
                            className={styles.fullWidthRange}
                            type="range"
                            id="skewY"
                            min={-45}
                            max={45}
                            step={0.1}
                            value={skewY || 0}
                            onChange={(e) => onSkewYChange(parseFloat(e.target.value))}
                        />
                        <div className={styles.valueRow}>
                            <span>{(skewY || 0).toFixed(1)}°</span>
                            <button
                                type="button"
                                className={styles.iconResetButton}
                                onClick={() => onSkewYChange(0)}
                                title="Reset verticale skew"
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.controlGroup}>
                        <label htmlFor="lineSkewY">
                            Verticale Skew (Selectie)
                        </label>
                        <input
                            className={styles.fullWidthRange}
                            type="range"
                            id="lineSkewY"
                            min={-45}
                            max={45}
                            step={0.1}
                            value={skewY || 0}
                            onChange={(e) => onSkewYChange(parseFloat(e.target.value))}
                        />
                        <div className={styles.valueRow}>
                            <span>
                                {(skewY || 0).toFixed(1)}°
                                <span className={styles.deltaValue}>
                                    ({(skewY - globalSkewY).toFixed(1) > 0 ? "+" : ""}
                                    {(skewY - globalSkewY).toFixed(1)}°)
                                </span>
                            </span>
                            <button
                                type="button"
                                className={styles.iconResetButton}
                                onClick={() => onSkewYChange(globalSkewY)}
                                title="Reset naar globale skew"
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                )}

                {/* Camera Control */}
                <div className={styles.controlGroup}>
                    <label>
                        Camera Control <span className={styles.hintText}>(&lt;Edit/Select Mode&gt; C key+Drag/scroll)</span>
                    </label>
                    <div className={styles.cameraButtons}>
                        <button
                            className={viewportDragEnabled || isTempCameraControlActive ? styles.active : ""}
                            onClick={() => onViewportToggle(true)}
                        >
                            Aan
                        </button>
                        <button
                            className={!viewportDragEnabled && !isTempCameraControlActive ? styles.active : ""}
                            onClick={() => onViewportToggle(false)}
                        >
                            Uit
                        </button>
                    </div>
                </div>

                {/* Camera Reset */}
                <div className={styles.controlGroup}>
                    <label>
                        Camera Reset <span className={styles.hintText}>(R key)</span>
                    </label>
                    <button
                        className={styles.resetCameraButton}
                        onClick={onResetViewport}
                        title="Reset camera naar midden van achtergrond"
                    >
                        🎯 Reset Camera
                    </button>
                </div>

                {/* Tekst Optimalisatie */}
                <div className={`${styles.controlRow} ${styles.optimizationToggle}`}>
                    <input
                        type="checkbox"
                        id="textOptimization"
                        checked={isOptimizationEnabled}
                        onChange={(e) => setIsOptimizationEnabled(e.target.checked)}
                    />
                    <label htmlFor="textOptimization">
                        🚀 Toggle scherpere tekst aan
                        <br/>
                        (must voor high-res displays)
                    </label>
                </div>
            </div>
        </div>
    );
}
