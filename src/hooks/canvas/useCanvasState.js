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
	const appRef = useRef(null);

	// Drag-and-Drop State - PERSISTENT
	const [poemOffset, setPoemOffset] = usePersistedState(
		PERSISTED_KEYS.POEM_OFFSET,
		{ x: 170, y: 0 }
	);
	// moveMode should always start as "edit" - do NOT persist to avoid mode confusion
	const [moveMode, setMoveMode] = useState("edit");

	// UI State
	const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
	const [lineOverrides, setLineOverrides] = usePersistedState(
		PERSISTED_KEYS.LINE_OVERRIDES,
		{}
	);
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

	// Text Styling State - PERSISTENT
	const [currentFontFamily, setCurrentFontFamily] = usePersistedState(
		PERSISTED_KEYS.FONT_FAMILY,
		"Lato"
	);
	const [pendingFontFamily, setPendingFontFamily] = useState(null);

	// Background State
	const [backgroundImage, setBackgroundImage, clearBackgroundImage] = usePersistedState(
		PERSISTED_KEYS.BACKGROUND_IMAGE,
		null
	);

	const pexels = usePexels();
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

	// Core Text Styling State - PERSISTENT
	const [fontSize, setFontSize] = usePersistedState(
		PERSISTED_KEYS.FONT_SIZE,
		20
	);
	const [fillColor, setFillColor] = usePersistedState(
		PERSISTED_KEYS.FILL_COLOR,
		"#000000"
	);
	const [letterSpacing, setLetterSpacing] = usePersistedState(
		PERSISTED_KEYS.LETTER_SPACING,
		0
	);
	const [lineHeight, setLineHeight] = usePersistedState(
		PERSISTED_KEYS.LINE_HEIGHT,
		30
	);
	const [lineHeightMultiplier, setLineHeightMultiplier] = usePersistedState(
		PERSISTED_KEYS.LINE_HEIGHT_MULTIPLIER,
		1.5
	);
	const [textAlign, setTextAlign] = usePersistedState(
		PERSISTED_KEYS.TEXT_ALIGN,
		"center"
	);
	const [fontWeight, setFontWeight] = usePersistedState(
		PERSISTED_KEYS.FONT_WEIGHT,
		"normal"
	);
	const [fontStyle, setFontStyle] = usePersistedState(
		PERSISTED_KEYS.FONT_STYLE,
		"normal"
	);
	// Skew state (container-level) - PERSISTENT
	const [skewX, setSkewX] = usePersistedState(PERSISTED_KEYS.SKEW_X, 0);
	const [skewY, setSkewY] = usePersistedState(PERSISTED_KEYS.SKEW_Y, 0);
	const [skewZ, setSkewZ] = usePersistedState(PERSISTED_KEYS.SKEW_Z, 0);

	// 3D transformation state (per-text level) - PERSISTENT
	const [lineTransforms, setLineTransforms] = usePersistedState(
		PERSISTED_KEYS.LINE_TRANSFORMS,
		{}
	);
	const [global3DSettings, setGlobal3DSettings] = usePersistedState(
		PERSISTED_KEYS.GLOBAL_3D_SETTINGS,
		{
			perspective: 1000,
			depthSorting: true,
			lightingEnabled: false,
			defaultPivotMode: "center",
			gevelPreset: "none",
			globalLighting: {
				enabled: false,
				direction: { x: 0, y: 0, z: 1 },
				intensity: 1.0,
				ambient: 0.3,
			},
			material: {
				blendMode: "normal",
			},
		}
	);
	const [userHasAdjusted, setUserHasAdjusted] = useState(false);

	// Hierarchical color system - PERSISTENT
	const [titleColorOverride, setTitleColorOverride] = usePersistedState(
		PERSISTED_KEYS.TITLE_COLOR_OVERRIDE,
		null
	);
	const [authorColorOverride, setAuthorColorOverride] = usePersistedState(
		PERSISTED_KEYS.AUTHOR_COLOR_OVERRIDE,
		null
	);

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
		appRef,

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
		clearBackgroundImage,
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
