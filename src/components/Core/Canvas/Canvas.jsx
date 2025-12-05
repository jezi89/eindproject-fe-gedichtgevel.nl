
import {Application, extend} from "@pixi/react";
import {Container, Graphics, Sprite, Text} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {useCallback, useEffect, useState, useRef, useMemo} from "react";
import { useNavigate } from "react-router";
import Controls from "./Controls.jsx";
import {useResponsiveCanvas} from "../../../hooks/canvas/useResponsiveCanvas";
import {IMAGE_QUALITY_MODE} from "../../../utils/imageOptimization.js";
import {useCanvasState} from "../../../hooks/canvas/useCanvasState";
import {useCanvasHandlers} from "../../../hooks/canvas/useCanvasHandlers";
import {useKeyboardShortcuts} from "../../../hooks/canvas/useKeyboardShortcuts";
import {useCanvasExport} from "../../../hooks/canvas/useCanvasExport";
import {CanvasContent} from "./CanvasContent.jsx";
import {ResponsiveLayout} from "./ResponsiveLayout.jsx";
import Navigation from "./Navigation.jsx";
import FloatingPhotoGrid from "./FloatingPhotoGrid.jsx";
import XYMoveSliders from "./XYMoveSliders.jsx";
import ShortcutFeedback from "./ShortcutFeedback.jsx";
import styles from "./CanvasLayout.module.scss";
import {debugManager} from "../../../debug/DebugManager.js";
import {useResponsiveTextPosition} from "../../../hooks/canvas/useResponsiveTextPosition";
import {clearAllPersistedState} from "../../../hooks/canvas/usePersistedState";
import { QualityStatusOverlay } from "./components/QualityStatusOverlay.jsx";

// CRITICAL: extend() MUST be called at module level, outside components
extend({Text, Container, Graphics, Sprite, Viewport});

// Main component that manages state
export default function Canvas({
                                   poemData,
                                   backgroundUrl,
                                   onSave,
                                   onBack,
                                   onToggleNavbarOverlay,
                                   savedCanvasState,
                                   currentDesignId
                               }) {
    const navigate = useNavigate();

    // Use provided poem data or fallback
    const currentPoem = poemData || {
        title: "Geen gedicht geselecteerd",
        author: "Onbekende auteur",
        lines: ["Selecteer een gedicht om te visualiseren"]
    };

    const canvasState = useCanvasState();


    // Use responsive canvas hook - MUST be called early to be available for handlers
    const layout = useResponsiveCanvas();

    // Restore canvas state from loaded design (destructive override)
    useEffect(() => {
        if (savedCanvasState) {

            // CRITICAL: Clear ALL persisted state first to ensure clean slate
            clearAllPersistedState();

            // Small delay to ensure localStorage is cleared before state updates
            setTimeout(() => {
                // Restore all serialized state properties
                if (savedCanvasState.backgroundImage !== undefined) {

                    canvasState.setBackgroundImage(savedCanvasState.backgroundImage);
                }
                if (savedCanvasState.poemOffset) canvasState.setPoemOffset(savedCanvasState.poemOffset);
                if (savedCanvasState.fontSize) canvasState.setFontSize(savedCanvasState.fontSize);
                if (savedCanvasState.fillColor) canvasState.setFillColor(savedCanvasState.fillColor);
                if (savedCanvasState.letterSpacing !== undefined) canvasState.setLetterSpacing(savedCanvasState.letterSpacing);
                if (savedCanvasState.lineHeight) canvasState.setLineHeight(savedCanvasState.lineHeight);
                if (savedCanvasState.lineHeightMultiplier) canvasState.setLineHeightMultiplier(savedCanvasState.lineHeightMultiplier);
                if (savedCanvasState.textAlign) canvasState.setTextAlign(savedCanvasState.textAlign);
                if (savedCanvasState.fontWeight) canvasState.setFontWeight(savedCanvasState.fontWeight);
                if (savedCanvasState.fontStyle) canvasState.setFontStyle(savedCanvasState.fontStyle);
                if (savedCanvasState.currentFontFamily) canvasState.setCurrentFontFamily(savedCanvasState.currentFontFamily);
                if (savedCanvasState.lineOverrides) canvasState.setLineOverrides(savedCanvasState.lineOverrides);
                if (savedCanvasState.titleColorOverride !== undefined) canvasState.setTitleColorOverride(savedCanvasState.titleColorOverride);
                if (savedCanvasState.authorColorOverride !== undefined) canvasState.setAuthorColorOverride(savedCanvasState.authorColorOverride);
                if (savedCanvasState.isOptimizationEnabled !== undefined) canvasState.setIsOptimizationEnabled(savedCanvasState.isOptimizationEnabled);
                if (savedCanvasState.skewX !== undefined) canvasState.setSkewX(savedCanvasState.skewX);
                if (savedCanvasState.skewY !== undefined) canvasState.setSkewY(savedCanvasState.skewY);
                // NOTE: moveMode is intentionally NOT restored - always start in "edit" mode for clarity
                // if (savedCanvasState.moveMode) canvasState.setMoveMode(savedCanvasState.moveMode);

            }, 50); // Small delay to ensure localStorage is cleared
        }
    }, [savedCanvasState]); // Only run when savedCanvasState changes

    const [previewState, setPreviewState] = useState('normal'); // 'normal' | 'dimmed' | 'preview'
    const [previewImage, setPreviewImage] = useState(null);

    // State for XY focus callback
    const [onXyFocusRequest, setOnXyFocusRequest] = useState(null);

    // Thumbnail hover freeze state for 5 seconds after Alt+J
    const [hoverFreezeActive, setHoverFreezeActive] = useState(false);

    // Background loading freeze state - blocks hover during image loading
    const [backgroundLoadingFreeze, setBackgroundLoadingFreeze] = useState(false);

    const [activeShortcut, setActiveShortcut] = useState(null);

    // Layout position state (standard = controls left, swapped = controls right)
    const [layoutPosition, setLayoutPosition] = useState('standard');

    const handleToggleLayoutPosition = useCallback(() => {
        setLayoutPosition(prev => prev === 'standard' ? 'swapped' : 'standard');
    }, []);

    const handleToggleUIVisibility = useCallback(() => {
        layout.toggleControls();
        layout.toggleNav();
    }, [layout]);

    useEffect(() => {
        if (backgroundUrl && !canvasState.backgroundImage) {
            canvasState.setBackgroundImage(backgroundUrl);
        }
    }, [backgroundUrl, canvasState]);

    // Timer for hover freeze
    useEffect(() => {
        if (hoverFreezeActive) {
            const timer = setTimeout(() => {
                setHoverFreezeActive(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hoverFreezeActive]);

    // Expose PixiJS app for DevTools
    useEffect(() => {
        if (canvasState.viewportRef.current?.app) {
            window.__PIXI_APP__ = canvasState.viewportRef.current.app;
        }
        return () => {
            delete window.__PIXI_APP__;
        };
    }, [canvasState.viewportRef]);

    const handlePreviewChange = useCallback(({previewMode, previewImage, hasHovered}) => {
        // Determine the correct preview state based on hasHovered
        let finalPreviewState = previewMode;
        if (previewMode === 'dimmed' && hasHovered) {
            // If grid is open but user has hovered, show preview (not dimmed)
            finalPreviewState = 'preview';
        }

        setPreviewState(finalPreviewState);
        setPreviewImage(previewImage);
    }, []);

    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    }, [onBack, navigate]);

    const handleSave = useCallback(async () => {
        if (onSave) {
            try {
                // Export canvas as image and call provided save handler
                const canvas = canvasState.viewportRef.current?.app.renderer.canvas;
                if (canvas) {
                    const dataURL = canvas.toDataURL('image/png');
                    await onSave(dataURL, currentPoem);
                }
            } catch (error) {

            }
        }
    }, [onSave, canvasState.viewportRef, currentPoem]);

    const [qualityOverlayVisible, setQualityOverlayVisible] = useState(false);
    const [currentDimensions, setCurrentDimensions] = useState(null);

    // Trigger overlay when background image changes
    useEffect(() => {
        if (canvasState.backgroundImage) {
             setQualityOverlayVisible(true);
        }
    }, [canvasState.backgroundImage]);

    // Handler for when texture is actually loaded with real dimensions
    const handleTextureLoaded = useCallback((dimensions) => {
        setCurrentDimensions(dimensions);
    }, []);

    // Trigger overlay when quality mode changes
    useEffect(() => {
        setQualityOverlayVisible(true);
    }, [canvasState.imageQualityMode]);


    // Wrapper for setting image quality mode with side effects
    const handleSetImageQualityMode = useCallback((mode) => {
        canvasState.setImageQualityMode(mode);
        // Automatically enable text optimization (Scherper Tekst) when High quality is selected
        if (mode === IMAGE_QUALITY_MODE.HIGH) {
            canvasState.setIsOptimizationEnabled(true);
        }
        setQualityOverlayVisible(true); // Ensure overlay shows on manual change
    }, [canvasState]);

    const handleCycleQuality = useCallback(() => {
        const modes = [IMAGE_QUALITY_MODE.ECO, IMAGE_QUALITY_MODE.AUTO, IMAGE_QUALITY_MODE.HIGH];
        const currentIndex = modes.indexOf(canvasState.imageQualityMode);
        // If current mode is not found (e.g. undefined), default to 0 (Eco)
        const validCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = (validCurrentIndex + 1) % modes.length;
        
        handleSetImageQualityMode(modes[nextIndex]);
    }, [canvasState.imageQualityMode, handleSetImageQualityMode]);

    const keyboardShortcuts = useKeyboardShortcuts({
        moveMode: canvasState.moveMode,
        setMoveMode: canvasState.setMoveMode,
        selectedLines: canvasState.selectedLines,
        clearSelection: canvasState.clearSelection,
        selectAll: canvasState.selectAll,
        selectAllIncludingTitleAuthor: canvasState.selectAllIncludingTitleAuthor,
        currentPoem,
        xySlidersVisible: canvasState.xySlidersVisible,
        setXySlidersVisible: canvasState.setXySlidersVisible,
        highlightVisible: canvasState.highlightVisible,
        setHighlightVisible: canvasState.setHighlightVisible,
        setHoverFreezeActive,
        setActiveShortcut,
        onToggleLayoutPosition: handleToggleLayoutPosition,
        onToggleUIVisibility: handleToggleUIVisibility,
        onToggleNav: layout.toggleNav,
        onCycleQuality: handleCycleQuality,
    });

    // Create ref for canvas container (used for html-to-image export)
    const canvasContainerRef = useRef(null);

    // Create ref for BackgroundImage component (for sprite bounds in export)
    const backgroundImageRef = useRef(null);

    // Use canvas export hook for downloading designs
    // Pass appRef, backgroundImageRef, and quality mode for PixiJS Extract API
    const {
        exportAsPNG,
        exportAsJPG,
        exportFullSpriteAsPNG,
        exportFullSpriteAsJPG,
        getExportDataUrl
    } = useCanvasExport(
        canvasContainerRef,
        canvasState.appRef,
        backgroundImageRef,
        canvasState.imageQualityMode,
        canvasState.viewportRef // Pass viewportRef
    );

    // Use canvas handlers hook - MUST be called after useCanvasExport
    const canvasHandlers = useCanvasHandlers({
        canvasState,
        currentPoem,
        currentDesignId,
        navigate,
        exportAsPNG,
        exportAsJPG,
        exportFullSpriteAsPNG,
        exportFullSpriteAsJPG,
        getExportDataUrl,
        layoutPosition
    });

    const handlers = useMemo(() => {
        return {
            ...canvasHandlers,
            onToggleLayoutPosition: handleToggleLayoutPosition,
            onToggleUIVisibility: handleToggleUIVisibility,
            onToggleNav: layout.toggleNav,
            onCycleQuality: handleCycleQuality,
        };
    }, [canvasHandlers, handleToggleLayoutPosition, handleToggleUIVisibility, layout.toggleNav, handleCycleQuality]);

    // Determine which data to show in photo gallery based on active search source
    const isFlickrActive = canvasState.searchContext?.source === 'flickr' &&
        (canvasState.isFlickrLoading || (canvasState.flickrPhotos && canvasState.flickrPhotos.length > 0));
    const photosToShow = isFlickrActive ? canvasState.flickrPhotos : canvasState.photos;
    const isLoading = canvasState.isFlickrLoading || canvasState.isLoading;
    const error = canvasState.flickrError || canvasState.error;
    const hasNextPage = isFlickrActive ? canvasState.hasNextFlickrPage : canvasState.hasNextPage;
    const hasPrevPage = isFlickrActive ? canvasState.hasPrevFlickrPage : canvasState.hasPrevPage;

    const textPosition = useResponsiveTextPosition(
        layout.canvasWidth,
        layout.canvasHeight,
        canvasState.fontSize,
        canvasState.lineHeight,
        currentPoem?.lines ?? []
    );

    const handleResetViewport = useCallback(() => {
        const viewport = canvasState.viewportRef.current;
        if (viewport) {
            viewport.animate({
                position: {x: layout.canvasWidth / 2, y: layout.canvasHeight / 2},
                scale: 1,
                time: 800,
                ease: 'easeInOutCubic',
            });
        }
    }, [canvasState.viewportRef, layout.canvasWidth, layout.canvasHeight]);

    useEffect(() => {
        debugManager.registerResetHandler(handleResetViewport);
        return () => debugManager.registerResetHandler(null);
    }, [handleResetViewport]);

    // Handle selection restoration when switching modes
    useEffect(() => {
        // When switching to line mode from edit mode with no current selection,
        // restore the previous selection if it exists
        if (canvasState.moveMode === 'line' && canvasState.selectedLines.size === 0) {
            const previousSelection = keyboardShortcuts.restorePreviousSelection();
            if (previousSelection.size > 0) {
                canvasState.restoreSelection(previousSelection);
            }
        }
    }, [canvasState.moveMode, canvasState.selectedLines.size, keyboardShortcuts, canvasState.restoreSelection]);



    const handleResetAllText = useCallback(() => {
        canvasState.setLineOverrides({});
        canvasState.clearSelection();

        canvasState.setFontSize(40);
        // Use the handler to correctly reset line height based on the new font size
        handlers.handleResetLineHeight();

        canvasState.setLetterSpacing(0);
        canvasState.setTextAlign('center');
        canvasState.setFillColor('#000000');
        canvasState.setSkewX(0);
        canvasState.setSkewY(0);
        canvasState.setFontWeight('normal');
        canvasState.setFontStyle('normal');

        handlers.handleResetTitleColor();
        handlers.handleResetAuthorColor();
        handleResetViewport();
    }, [canvasState, handlers, handleResetViewport]);

    return (
        <>
            <ResponsiveLayout
                layout={layout}
                previewState={previewState}
                layoutPosition={layoutPosition}
                onToggleLayoutPosition={handleToggleLayoutPosition}
                controls={
                    <Controls
                        qualityOverlay={
                            <QualityStatusOverlay 
                                isVisible={qualityOverlayVisible}
                                qualityMode={canvasState.imageQualityMode}
                                currentDimensions={currentDimensions}
                                onClose={() => setQualityOverlayVisible(false)}
                            />
                        }
                        layoutPosition={layoutPosition}
                        onResetAllText={handleResetAllText}
                        onToggleLayoutPosition={handleToggleLayoutPosition}
                        onResetViewport={handleResetViewport}
                        fontSize={canvasState.fontSize}
                        onFontSizeChange={handlers.handleFontSizeChange}
                        fillColor={canvasState.fillColor}
                        onFillColorChange={canvasState.setFillColor}
                        letterSpacing={canvasState.letterSpacing}
                        onLetterSpacingChange={canvasState.setLetterSpacing}
                        lineHeight={canvasState.lineHeight}
                        onLineHeightChange={handlers.handleLineHeightChange}
                        lineHeightMultiplier={canvasState.lineHeightMultiplier}
                        onLineHeightMultiplierChange={
                            handlers.handleLineHeightMultiplierChange
                        }
                        onResetLineHeight={handlers.handleResetLineHeight}
                        textAlign={canvasState.textAlign}
                        onTextAlignChange={canvasState.setTextAlign}
                        selectedLines={canvasState.selectedLines}
                        onLineColorChange={handlers.handleLineColorChange}
                        onLineLetterSpacingChange={handlers.handleLineLetterSpacingChange}
                        onLineFontSizeChange={handlers.handleLineFontSizeChange}
                        handleResetSelectedLines={handlers.handleResetSelectedLines}
                        onApplyGlobalLetterSpacing={
                            handlers.handleApplyGlobalLetterSpacing
                        }
                        lineOverrides={canvasState.lineOverrides}
                        viewportDragEnabled={canvasState.viewportDragEnabled}
                        onViewportToggle={handlers.handleViewportToggle}
                        onColorPickerActiveChange={handlers.handleColorPickerActiveChange}
                        effectiveTitleColor={canvasState.effectiveTitleColor}
                        effectiveAuthorColor={canvasState.effectiveAuthorColor}
                        hasTitleColorOverride={canvasState.hasTitleColorOverride}
                        hasAuthorColorOverride={canvasState.hasAuthorColorOverride}
                        onTitleColorChange={handlers.handleTitleColorChange}
                        onAuthorColorChange={handlers.handleAuthorColorChange}
                        onResetTitleColor={handlers.handleResetTitleColor}
                        onResetAuthorColor={handlers.handleResetAuthorColor}
                        // Deprecated: keeping for backward compatibility
                        titleColor={canvasState.titleColor}
                        authorColor={canvasState.authorColor}
                        availableFonts={canvasState.availableFonts}
                        fontFamily={canvasState.fontFamily}
                        onFontFamilyChange={handlers.handleFontFamilyChange}
                        fontWeight={canvasState.fontWeight}
                        onFontWeightChange={handlers.handleFontWeightChange}
                        fontStyle={canvasState.fontStyle}
                        onFontStyleChange={handlers.handleFontStyleChange}
                        skewX={canvasState.skewX}
                        onSkewXChange={handlers.handleSkewXChange}
                        onLineSkewXChange={handlers.handleLineSkewXChange}
                        skewY={canvasState.skewY}
                        onSkewYChange={handlers.handleSkewYChange}
                        onLineSkewYChange={handlers.handleLineSkewYChange}
                        onLineTextAlignChange={handlers.handleLineTextAlignChange}
                        photos={canvasState.photos}
                        isLoading={canvasState.isLoading}
                        error={canvasState.error}
                        onSearch={handlers.handleSearchBackground}
                        onCitySearch={handlers.handleCitySearch}
                        onPremiumSearch={handlers.handlePremiumSearch}
                        onSetBackground={handlers.handleSetBackground}
                        onNextPage={handlers.handleNextPage}
                        onPrevPage={handlers.handlePrevPage}
                        hasNextPage={canvasState.hasNextPage}
                        hasPrevPage={canvasState.hasPrevPage}
                        onResetToCollection={handlers.handleResetToCollection}
                        onOpenPhotoGrid={handlers.handleOpenPhotoGrid}
                        poemOffset={canvasState.poemOffset}
                        setPoemOffset={canvasState.setPoemOffset}
                        hoverFreezeActive={hoverFreezeActive} // Pass hover freeze state for timer
                        isOptimizationEnabled={canvasState.isOptimizationEnabled}
                        setIsOptimizationEnabled={canvasState.setIsOptimizationEnabled}
                        totalLineCount={currentPoem?.lines?.length || 0}
                        textMaterial={canvasState.textMaterial}
                        onTextMaterialChange={canvasState.setTextMaterial}
                        textPadding={canvasState.textPadding}
                        onTextPaddingChange={canvasState.setTextPadding}
                        textEffectMode={canvasState.textEffectMode}
                        setTextEffectMode={canvasState.setTextEffectMode}
                        textEffectParams={canvasState.textEffectParams}
                        setTextEffectParams={canvasState.setTextEffectParams}
                        imageQualityMode={canvasState.imageQualityMode}
                        setImageQualityMode={handleSetImageQualityMode}
                        onSave={handleSave}
                        onBack={handleBack}
                    />
                }
                canvas={
                    <div ref={canvasContainerRef} style={{width: '100%', height: '100%'}}>
                        <Application
                            width={layout.canvasWidth}
                            height={layout.canvasHeight}
                            options={{
                                background: 0x1d2230,
                                resolution: window.devicePixelRatio || 1,
                                autoDensity: true,
                                preserveDrawingBuffer: true, // Required for html-to-image to capture WebGL canvas
                            }}
                        >
                        <CanvasContent
                            poemData={currentPoem}
                            canvasWidth={layout.canvasWidth}
                            canvasHeight={layout.canvasHeight}
                            fontSize={canvasState.fontSize}
                            fillColor={canvasState.fillColor}
                            letterSpacing={canvasState.letterSpacing}
                            lineHeight={canvasState.lineHeight}
                            textAlign={canvasState.textAlign}
                            titleColor={canvasState.effectiveTitleColor}
                            authorColor={canvasState.effectiveAuthorColor}
                            viewportRef={canvasState.viewportRef}
                            contentRef={canvasState.contentRef}
                            appRef={canvasState.appRef}
                            fontFamily={canvasState.fontFamily}
                            fontStatus={canvasState.fontStatus}
                            fontWeight={canvasState.fontWeight}
                            fontStyle={canvasState.fontStyle}
                            skewX={canvasState.skewX}
                            skewY={canvasState.skewY}
                            onFontFamilyChange={handlers.handleFontFamilyChange}
                            selectedLines={canvasState.selectedLines}
                            lineOverrides={canvasState.lineOverrides}
                            setLineOverrides={canvasState.setLineOverrides}
                            onLineSelect={handlers.handleLineSelect}
                            viewportDragEnabled={canvasState.viewportDragEnabled}
                            isColorPickerActive={canvasState.isColorPickerActive}
                            backgroundImage={previewImage || canvasState.backgroundImage}
                            imageQualityMode={canvasState.imageQualityMode}
                            backgroundImageRef={backgroundImageRef}
                            onNextPage={handlers.handleNextPage}
                            onPrevPage={handlers.handlePrevPage}
                            hasNextPage={canvasState.hasNextPage}
                            hasPrevPage={canvasState.hasPrevPage}
                            onSearch={handlers.handleSearchBackground}
                            onCitySearch={handlers.handleCitySearch}
                            onPremiumSearch={handlers.handlePremiumSearch}
                            poemOffset={canvasState.poemOffset}
                            setPoemOffset={canvasState.setPoemOffset}
                            moveMode={canvasState.moveMode}
                            isDragging={canvasState.isDragging}
                            setIsDragging={canvasState.setIsDragging}
                            effectiveStyles={canvasState.effectiveStyles}
                            highlightVisible={canvasState.highlightVisible}
                            textMaterial={canvasState.textMaterial}
                            onTextMaterialChange={canvasState.setTextMaterial}
                            textPadding={canvasState.textPadding}
                            onTextPaddingChange={canvasState.setTextPadding}
                            textEffectMode={canvasState.textEffectMode}
                            textEffectParams={canvasState.textEffectParams}
                            currentPoem={currentPoem}
                            totalLineCount={currentPoem?.lines?.length || 0}
                            onTextureLoaded={handleTextureLoaded}
                        />
                    </Application>
                    </div>
                }
                navigation={
                    <Navigation
                        onSyncAllColorsToGlobal={handlers.handleSyncAllColorsToGlobal}
                        onSyncAllFontsToGlobal={handlers.handleSyncAllFontsToGlobal}
                        moveMode={canvasState.moveMode}
                        setMoveMode={canvasState.setMoveMode}
                        selectedLines={canvasState.selectedLines}
                        clearSelection={canvasState.clearSelection}
                        activeShortcut={activeShortcut}
                        xySlidersVisible={canvasState.xySlidersVisible}
                        setXySlidersVisible={canvasState.setXySlidersVisible}
                        highlightVisible={canvasState.highlightVisible}
                        setHighlightVisible={canvasState.setHighlightVisible}
                        onToggleNavbarOverlay={onToggleNavbarOverlay}
                        poemData={currentPoem}
                        canvasState={canvasState}
                        currentDesignId={currentDesignId}
                        onExportAsPNG={exportAsPNG}
                        onExportAsJPG={exportAsJPG}
                        onExportFullSpriteAsPNG={exportFullSpriteAsPNG}
                        onExportFullSpriteAsJPG={exportFullSpriteAsJPG}
                        getExportDataUrl={getExportDataUrl}
                        layoutPosition={layoutPosition}
                        controlsVisible={layout.controlsVisible}
                        controlsWidth={layout.controlsWidth}
                    />
                }
            />

            <ShortcutFeedback activeShortcut={activeShortcut}/>

            {canvasState.photoGridVisible && (
                <FloatingPhotoGrid
                    photos={photosToShow}
                    isLoading={isLoading}
                    error={error}
                    searchContext={canvasState.searchContext}
                    onSetBackground={handlers.handleSetBackground}
                    onSetBackgroundLoadingFreeze={setBackgroundLoadingFreeze}
                    onClose={() => canvasState.setPhotoGridVisible(false)}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    onNextPage={handlers.handleNextPage}
                    onPrevPage={handlers.handlePrevPage}
                    currentBackground={canvasState.backgroundImage}
                    onPreviewChange={handlePreviewChange}
                    hoverFreezeActive={hoverFreezeActive || backgroundLoadingFreeze} // Combined freeze state
                    imageQualityMode={canvasState.imageQualityMode}
                />
            )}

            {/* Floating XY Move Sliders - Only show in poem/line modes */}
            {(canvasState.moveMode === "poem" || canvasState.moveMode === "line") &&
                canvasState.xySlidersVisible && (
                    <XYMoveSliders
                        moveMode={canvasState.moveMode}
                        selectedLines={canvasState.selectedLines}
                        poemOffset={canvasState.poemOffset}
                        setPoemOffset={canvasState.setPoemOffset}
                        lineOverrides={canvasState.lineOverrides}
                        setLineOverrides={canvasState.setLineOverrides}
                        isDragging={canvasState.isDragging}
                        canvasWidth={layout.canvasWidth}
                        canvasHeight={layout.canvasHeight}
                        isVisible={canvasState.xySlidersVisible}
                        setIsVisible={canvasState.setXySlidersVisible}
                        onRequestFocus={onXyFocusRequest}
                    />
                )}

            {/* Global thumbnail hover freeze overlay */}
            {hoverFreezeActive && (
                <div
                    className={styles.thumbnailFreeze}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Development Mode Indicator (Clean, Non-Intrusive) */}
            {import.meta.env.DEV && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "10px",
                        left: "10px",
                        background: "rgba(0,100,0,0.8)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        zIndex: 1000,
                    }}
                >
                    DEV MODE | Console: window.debugCanvas.toggle()
                </div>
            )}
        </>
    );
}
