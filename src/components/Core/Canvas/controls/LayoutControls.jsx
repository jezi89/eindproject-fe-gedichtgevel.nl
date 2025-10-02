// src/components/Core/Canvas/components/controls/LayoutControls.jsx

import React from "react";
import styles from "../../Canvas.module.scss"; // Updated import path

export default function LayoutControls({
	// State & Derived Values
	lineHeightMultiplier,
	fontSize,
	textAlign,
	viewportDragEnabled,
	isOptimizationEnabled,
	skewX,
	skewY,
	skewZ,
	global3DSettings,
	autoZPreview,

	// Handlers
	onLineHeightMultiplierChange,
	onResetLineHeight,
	onTextAlignChange,
	onViewportToggle,
	onResetViewport,
	setIsOptimizationEnabled,
	onSkewXChange,
	onSkewYChange,
	onSkewZChange,
	onGlobal3DSettingChange,

	// Auto-Z Handlers & State
	setAutoZPreview,
	lineTransforms,
	onLineTransformChange,
	originalZValues,
	setOriginalZValues,

	// Section visibility
	layoutSectionOpen,
	setLayoutSectionOpen,
	sceneSetupOpen,
	setSceneSetupOpen,
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
							Midden
						</button>
						<button
							className={textAlign === "right" ? styles.active : ""}
							onClick={() => onTextAlignChange("right")}
						>
							Rechts
						</button>
					</div>
				</div>

				{/* Camera Control */}
				<div className={styles.controlGroup}>
					<label>
						Camera Control <span className={styles.hintText}>(Ctrl+Drag)</span>
					</label>
					<div className={styles.cameraButtons}>
						<button
							className={viewportDragEnabled ? styles.active : ""}
							onClick={() => onViewportToggle(true)}
						>
							Aan
						</button>
						<button
							className={!viewportDragEnabled ? styles.active : ""}
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
						🚀 Geoptimaliseerde Modus Actief
						<br />
						(Scherpere tekst op high-res displays)
					</label>
				</div>

				{/* Skew Controls */}
				<div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
					<label htmlFor="skewX">Horizontale scheefstand</label>
					<div className={styles.lineControls}>
						<input
							type="range"
							id="skewX"
							min="-45"
							max="45"
							value={skewX}
							onChange={(e) => onSkewXChange(Number(e.target.value))}
						/>
						<span>{skewX}°</span>
					</div>
				</div>

				<div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
					<label htmlFor="skewY">Verticale scheefstand</label>
					<div className={styles.lineControls}>
						<input
							type="range"
							id="skewY"
							min="-45"
							max="45"
							value={skewY}
							onChange={(e) => onSkewYChange(Number(e.target.value))}
						/>
						<span>{skewY}°</span>
					</div>
				</div>

				<div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
					<label htmlFor="skewZ">Z-as scheefstand (3D effect)</label>
					<div className={styles.lineControls}>
						<input
							type="range"
							id="skewZ"
							min="-45"
							max="45"
							value={skewZ}
							onChange={(e) => onSkewZChange(Number(e.target.value))}
						/>
						<span>{skewZ}°</span>
					</div>
				</div>

				{/* NEW: Scène Setup Subpanel - Groups skew + global perspective + Auto-Z */}
				<div className={styles.subsection}>
					<button
						className={styles.subsectionHeader}
						onClick={() => setSceneSetupOpen(!sceneSetupOpen)}
					>
						<span>📐 Scène Setup</span>
						<span
							className={`${styles.sectionToggle} ${
								!sceneSetupOpen ? styles.collapsed : ""
							}`}
						>
							▼
						</span>
					</button>

					<div
						className={`${styles.subsectionContent} ${
							!sceneSetupOpen ? styles.collapsed : ""
						}`}
					>
						{/* Auto-Z Preview Toggle - GLOBAL (all lines, no selection required) */}
						<div
							className={`${styles.controlRow} ${styles.optimizationToggle}`}
						>
							<input
								type="checkbox"
								id="auto-z-preview"
								checked={autoZPreview}
								onChange={(e) => {
									const isEnabled = e.target.checked;
									setAutoZPreview(isEnabled);

									// Global: Apply to all potential lines (0-19 for poems)
									const maxLines = 20;
									const allLines = Array.from(
										{ length: maxLines },
										(_, i) => i
									);

									if (isEnabled) {
										// Store original Z values for ALL lines
										const originals = new Map();
										allLines.forEach((lineIndex) => {
											// Use lineTransforms directly (no getSelectedTransformValue, as it's global)
											const currentZ = lineTransforms?.[lineIndex]?.z ?? 0;
											originals.set(lineIndex, currentZ);
										});
										setOriginalZValues(originals);

										// Apply preview Z=50px to ALL lines
										allLines.forEach((lineIndex) => {
											if (onLineTransformChange) {
												onLineTransformChange(lineIndex, "z", 50);
											}
										});
									} else {
										// Restore original Z values for ALL lines
										if (originalZValues.size > 0) {
											originalZValues.forEach((originalZ, lineIndex) => {
												if (onLineTransformChange) {
													onLineTransformChange(lineIndex, "z", originalZ);
												}
											});
											setOriginalZValues(new Map());
										}
									}
								}}
							/>
							<label htmlFor="auto-z-preview">
								🔍 Auto-Z Preview (Globaal)
								<br />
								<span className={styles.hintText}>
									Activeert 3D previews voor alle regels
								</span>
								<br />
								<span className={styles.hintText}>
									(Z=50px tijdelijk, geen selectie nodig)
								</span>
							</label>
						</div>

						{/* Global Perspective (moved here for better grouping) */}
						<div
							className={`${styles.controlRow} ${styles.verticalControlRow}`}
						>
							<label htmlFor="global-perspective">Perspective</label>
							<div className={styles.lineControls}>
								<input
									type="range"
									id="global-perspective"
									min="500"
									max="2000"
									value={global3DSettings?.perspective || 1000}
									onChange={(e) =>
										onGlobal3DSettingChange?.(
											"perspective",
											Number(e.target.value)
										)
									}
								/>
								<span>{global3DSettings?.perspective || 1000}px</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
