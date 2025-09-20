// src/hooks/canvas/useCanvasState.js

import { useState, useEffect, useRef, useMemo } from "react";
import { useSelection } from "./useSelection";
import { useFontManager } from "./useFontManager";
import { usePexels } from "./usePexels";
import { usePersistedState, PERSISTED_KEYS } from "./usePersistedState";
import { useFlickr } from "./useFlickr";

export function useCanvasState() {
	// Refs
	const viewportRef = useRef(null);
	const contentRef = useRef(null);

	// Drag-and-Drop State
	const [poemOffset, setPoemOffset] = useState({ x: 170, y: 0 });
	const [moveMode, setMoveMode] = useState("edit");

	// UI State
	const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
	const [lineOverrides, setLineOverrides] = useState({});
	const [isColorPickerActive, setIsColorPickerActive] = useState(false);
	const [photoGridVisible, setPhotoGridVisible] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [xySlidersVisible, setXySlidersVisible] = useState(true);
	const [highlightVisible, setHighlightVisible] = useState(true);

	// Text Optimization State
	const [isOptimizationEnabled, setIsOptimizationEnabled] = usePersistedState(
		PERSISTED_KEYS.OPTIMIZATION_ENABLED,
		false
	);

	const selection = useSelection();
	const { fontStatus, loadFont, availableFonts } = useFontManager();

	// Text Styling State
	const [currentFontFamily, setCurrentFontFamily] = useState("Lato");
	const [pendingFontFamily, setPendingFontFamily] = useState(null);

	// Background State
	const [backgroundImage, setBackgroundImage] = usePersistedState(
		PERSISTED_KEYS.BACKGROUND_IMAGE,
		null
	);

	const pexels = usePexels(setBackgroundImage);
	const flickr = useFlickr();

	const [searchContext, setSearchContext] = useState({
		type: "collection",
		query: "",
		source: "pexels",
	});

	useEffect(() => {
		if (pendingFontFamily && fontStatus[pendingFontFamily] === "loaded") {
			setCurrentFontFamily(pendingFontFamily);
			setPendingFontFamily(null);
		}
	}, [pendingFontFamily, fontStatus]);

	// Core Text Styling State
	const [fontSize, setFontSize] = useState(20);
	const [fillColor, setFillColor] = useState("#000000");
	const [letterSpacing, setLetterSpacing] = useState(0);
	const [lineHeight, setLineHeight] = useState(20 * 1.5);
	const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.5);
	const [textAlign, setTextAlign] = useState("center");
	const [fontWeight, setFontWeight] = useState("normal");
	const [fontStyle, setFontStyle] = useState("normal");
	// Skew state (container-level - BEHOUDEN)
	const [skewX, setSkewX] = useState(0);
	const [skewY, setSkewY] = useState(0);
	const [skewZ, setSkewZ] = useState(0);

	// 3D transformation state (per-text level - NIEUW)
	const [lineTransforms, setLineTransforms] = useState({}); // lineIndex -> Transform3D properties
	const [global3DSettings, setGlobal3DSettings] = useState({
		perspective: 1000,
		depthSorting: true,
		lightingEnabled: false,
		// Enhanced per-text controls
		defaultPivotMode: "center", // 'center', 'top', 'bottom'
		// Gevel realism settings
		gevelPreset: "none", // 'none', 'brick', 'stone', 'metal', 'glass', 'wood'
		globalLighting: {
			enabled: false,
			direction: { x: 0, y: 0, z: 1 },
			intensity: 1.0,
			ambient: 0.3,
		},
		material: {
			blendMode: "normal",
		},
	});
	const [userHasAdjusted, setUserHasAdjusted] = useState(false);

	// Hierarchical color system
	const [titleColorOverride, setTitleColorOverride] = useState(null);
	const [authorColorOverride, setAuthorColorOverride] = useState(null);

	const effectiveTitleColor = useMemo(
		() => titleColorOverride || fillColor,
		[titleColorOverride, fillColor]
	);
	const effectiveAuthorColor = useMemo(
		() => authorColorOverride || fillColor,
		[authorColorOverride, fillColor]
	);
	const hasTitleColorOverride = useMemo(
		() => titleColorOverride !== null,
		[titleColorOverride]
	);
	const hasAuthorColorOverride = useMemo(
		() => authorColorOverride !== null,
		[authorColorOverride]
	);

	// Auto-sync lineOverrides naar titleColorOverride/authorColorOverride
	useEffect(() => {
		const titleLineOverride = lineOverrides[-2]?.fillColor;
		const authorLineOverride = lineOverrides[-1]?.fillColor;

		// Sync alleen als er daadwerkelijk een override is en deze verschilt
		if (titleLineOverride && titleLineOverride !== titleColorOverride) {
			setTitleColorOverride(titleLineOverride);
		}
		if (authorLineOverride && authorLineOverride !== authorColorOverride) {
			setAuthorColorOverride(authorLineOverride);
		}
	}, [lineOverrides, titleColorOverride, authorColorOverride]);

	// Calculate effective styles for rendering
	const effectiveStyles = useMemo(() => {
		const isEnabled = isOptimizationEnabled;
		const styles = {
			resolution: isEnabled ? 2.0 : 1.0,
			antialias: isEnabled,
			roundPixels: !isEnabled,
			fontSize: fontSize,
			letterSpacing: letterSpacing,
			lineHeight: lineHeight,
		};

		// Text optimization styles calculated

		return styles;
	}, [isOptimizationEnabled, fontSize, letterSpacing, lineHeight]);

	return {
		// Refs
		viewportRef,
		contentRef,

		// UI State
		...selection,
		clearSelection: selection.clearSelection,
		selectAllIncludingTitleAuthor: selection.selectAllIncludingTitleAuthor,
		viewportDragEnabled,
		setViewportDragEnabled,
		lineOverrides,
		setLineOverrides,
		isColorPickerActive,
		setIsColorPickerActive,
		photoGridVisible,
		setPhotoGridVisible,
		isDragging,
		setIsDragging,
		xySlidersVisible,
		setXySlidersVisible,
		highlightVisible,
		setHighlightVisible,
		isOptimizationEnabled,
		setIsOptimizationEnabled,

		// Font State
		currentFontFamily,
		setCurrentFontFamily,
		pendingFontFamily,
		setPendingFontFamily,
		fontStatus,
		loadFont,
		availableFonts,
		fontFamily: currentFontFamily,

		// Pexels/Flickr State
		...pexels,
		...flickr,

		// Background State
		backgroundImage,
		setBackgroundImage,
		searchContext,
		setSearchContext,

		// Text Styling State
		fontSize,
		setFontSize,
		fillColor,
		setFillColor,
		letterSpacing,
		setLetterSpacing,
		titleColorOverride,
		setTitleColorOverride,
		authorColorOverride,
		setAuthorColorOverride,
		effectiveTitleColor,
		effectiveAuthorColor,
		hasTitleColorOverride,
		hasAuthorColorOverride,
		lineHeight,
		setLineHeight,
		lineHeightMultiplier,
		setLineHeightMultiplier,
		textAlign,
		setTextAlign,
		fontWeight,
		setFontWeight,
		fontStyle,
		setFontStyle,
		skewX,
		setSkewX,
		skewY,
		setSkewY,
		skewZ,
		setSkewZ,
		poemOffset,
		setPoemOffset,
		moveMode,
		setMoveMode,
		userHasAdjusted,
		setUserHasAdjusted,

		// 3D transformation state
		lineTransforms,
		setLineTransforms,
		global3DSettings,
		setGlobal3DSettings,

		// Calculated Styles
		effectiveStyles,
	};
}
