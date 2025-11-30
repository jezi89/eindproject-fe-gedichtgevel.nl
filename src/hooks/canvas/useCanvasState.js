// src/hooks/canvas/useCanvasState.js

import { useState, useEffect, useRef, useMemo } from "react";
import { useSelection } from "./useSelection";
import { useFontManager } from "./useFontManager";
import { usePexels } from "./usePexels";
import { usePersistedState, PERSISTED_KEYS } from "./usePersistedState";
import { useFlickr } from "./useFlickr";
import { IMAGE_QUALITY_MODE } from "../../utils/imageOptimization";

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

	// Image Quality Mode State (session-only, not persisted)
	const [imageQualityMode, setImageQualityMode] = useState(IMAGE_QUALITY_MODE.AUTO);

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

    // Text Material State (Global)
    const [textMaterial, setTextMaterial] = useState(null); // URL of texture
    const [textPadding, setTextPadding] = useState(20);

    // Text Effect State (Global)
    const [textEffectMode, setTextEffectMode] = useState('none'); // 'none', 'painted', 'raised', 'engraved'
    const [textEffectParams, setTextEffectParams] = useState({
        opacity: 0.8, // For Painted
        blur: 0.5,    // For Painted
        distance: 2,  // For Raised/Engraved
        depth: 2,     // For Engraved
    });

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
	const [skewX, setSkewX] = usePersistedState(
		PERSISTED_KEYS.SKEW_X,
		0
	);
	const [skewY, setSkewY] = usePersistedState(
		PERSISTED_KEYS.SKEW_Y,
		0
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
		imageQualityMode,
		setImageQualityMode,

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

		// Background
        backgroundImage,
        setBackgroundImage,
        textMaterial, // <-- RESTORED
        setTextMaterial, // <-- RESTORED
        textPadding, // <-- RESTORED
        setTextPadding, // <-- RESTORED
        textEffectMode,
        setTextEffectMode,
        textEffectParams,
        setTextEffectParams,
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
		poemOffset,
		setPoemOffset,
		moveMode,
		setMoveMode,
		userHasAdjusted,
		setUserHasAdjusted,



		// Calculated Styles
		effectiveStyles,
	};
}
