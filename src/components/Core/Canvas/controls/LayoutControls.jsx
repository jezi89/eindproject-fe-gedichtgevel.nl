 // src/components/Core/Canvas/components/controls/LayoutControls.jsx

import React from "react";
import styles from "../CanvasControls.module.scss";
import optimizationStyles from "../OptimizationControls.module.scss";

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
  globalSkewX,
  globalSkewY,
  perspX,
  perspY,
  perspFreeMode,
  hasSelection,
  isSelectAll,

  // Handlers
  onLineHeightMultiplierChange,
  onResetLineHeight,
  onTextAlignChange,
  onViewportToggle,
  onResetViewport,
  onSkewXChange,
  onSkewYChange,
  onPerspXChange,
  onPerspYChange,
  onPerspFreeModeChange,
  onResetPerspCorners,
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
        {/* Tekst Optimalisatie - Prominent bovenaan */}

        <div className={optimizationStyles.optimizationContainer}>
          <div className={optimizationStyles.optimizationHeader}>
            <input
              type="checkbox"
              id="textOptimization"
              checked={isOptimizationEnabled}
              onChange={(e) => setIsOptimizationEnabled(e.target.checked)}
              className={optimizationStyles.optimizationCheckbox}
            />
            <label
              htmlFor="textOptimization"
              className={optimizationStyles.optimizationTitle}
            >
              <span>✨ Scherper Tekst</span>
              <span>(Print Kwaliteit)</span>
            </label>
          </div>
          <div className={optimizationStyles.optimizationDescription}>
            Zet dit AAN voor haarscherpe export.
            <br />
            <em>(Standaard uit voor betere performance)</em>
          </div>
        </div>

        {/* Line Height */}
        <div className={styles.controlGroup}>
          <label htmlFor="lineHeightMultiplier">Regelhoogte (verhouding)</label>
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
        {!hasSelection || isSelectAll ? (
          <div className={styles.controlGroup}>
            <label htmlFor="skewX">Horizontale Skew</label>
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
            <label htmlFor="lineSkewX">Horizontale Skew (Selectie)</label>
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
        {!hasSelection || isSelectAll ? (
          <div className={styles.controlGroup}>
            <label htmlFor="skewY">Verticale Skew</label>
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
            <label htmlFor="lineSkewY">Verticale Skew (Selectie)</label>
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

        {/* Perspectief (PerspectiveMesh — echte projectie met verdwijnpunt) */}
        <div className={styles.controlGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={!!perspFreeMode}
              onChange={(e) => onPerspFreeModeChange(e.target.checked)}
            />
            <span>Vrij verslepen (4 hoeken)</span>
          </label>
          <span className={styles.hintText}>
            {perspFreeMode
              ? "Sleep de vier blauwe hoekpunten op het canvas naar de randen van de gevel."
              : "Of gebruik de sliders hieronder voor een symmetrische kanteling."}
          </span>
        </div>

        {perspFreeMode ? (
          <div className={styles.controlGroup}>
            <button
              type="button"
              onClick={() => onResetPerspCorners && onResetPerspCorners()}
            >
              ↺ Hoeken terugzetten (recht)
            </button>
          </div>
        ) : (
          <>
            <div className={styles.controlGroup}>
              <label htmlFor="perspX">
                Perspectief horizontaal{" "}
                <span className={styles.hintText}>
                  (gedicht draait van je af)
                </span>
              </label>
              <input
                className={styles.fullWidthRange}
                type="range"
                id="perspX"
                min={-45}
                max={45}
                step={1}
                value={perspX || 0}
                onChange={(e) => onPerspXChange(parseFloat(e.target.value))}
              />
              <div className={styles.valueRow}>
                <span>{(perspX || 0).toFixed(0)}°</span>
                <button
                  type="button"
                  className={styles.iconResetButton}
                  onClick={() => onPerspXChange(0)}
                  title="Reset horizontaal perspectief"
                >
                  ↺
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label htmlFor="perspY">Perspectief verticaal</label>
              <input
                className={styles.fullWidthRange}
                type="range"
                id="perspY"
                min={-45}
                max={45}
                step={1}
                value={perspY || 0}
                onChange={(e) => onPerspYChange(parseFloat(e.target.value))}
              />
              <div className={styles.valueRow}>
                <span>{(perspY || 0).toFixed(0)}°</span>
                <button
                  type="button"
                  className={styles.iconResetButton}
                  onClick={() => onPerspYChange(0)}
                  title="Reset verticaal perspectief"
                >
                  ↺
                </button>
              </div>
            </div>
          </>
        )}

        {(perspFreeMode || perspX !== 0 || perspY !== 0) && (
          <div className={styles.controlGroup}>
            <span className={styles.hintText}>
              In perspectief-modus is tekst op het canvas niet aanklikbaar;
              gebruik de sliders/hoeken en de panelen om te stylen.
            </span>
          </div>
        )}

        {/* Camera Control */}
        <div className={styles.controlGroup}>
          <label>
            Camera Control{" "}
            <span className={styles.hintText}>
              (&lt;Edit/Select Mode&gt; C key+Drag/scroll)
            </span>
          </label>
          <div className={styles.cameraButtons}>
            <button
              className={
                viewportDragEnabled || isTempCameraControlActive
                  ? styles.active
                  : ""
              }
              onClick={() => onViewportToggle(true)}
            >
              Aan
            </button>
            <button
              className={
                !viewportDragEnabled && !isTempCameraControlActive
                  ? styles.active
                  : ""
              }
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

        {/* Line Height */}
      </div>
    </div>
  );
}
