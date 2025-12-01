import { useSearchParams } from "react-router";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useApplication} from "@pixi/react";
import {getPoemById} from "@/data/canvas/testdata.js";
import {PoemLine} from "./poemLine.jsx";
import {PoemTitle} from "./PoemTitle.jsx";
import {PoemAuthor} from "./PoemAuthor.jsx";
import {useFontManager} from "@/hooks/canvas/useFontManager.js";
import {useTextStyles} from "@/hooks/canvas/useTextStyles.js";
import {useResponsiveTextPosition} from "@/hooks/canvas/useResponsiveTextPosition.js";
import {usePixiAutoRender} from "@/hooks/canvas/usePixiAutoRender.js";
import {useAutoRecenter} from "@/hooks/canvas/useAutoRecenter.js";
import {debugManager} from "@/debug/DebugManager.js";
import {BackgroundImage} from "./BackgroundImage.jsx";
import {TextBackground} from "./TextBackground.jsx"; // <-- Import TextBackground

import { DropShadowFilter } from 'pixi-filters';

export function CanvasContent({
                                  canvasWidth,
                                  canvasHeight,
                                  textAlign,
                                  fontSize,
                                  fillColor,
                                  letterSpacing,
                                  lineHeight,
                                  titleColor,
                                  authorColor,
                                  viewportRef,
                                  selectedLines,
                                  onLineSelect,
                                  viewportDragEnabled,
                                  lineOverrides,
                                  setLineOverrides,
                                  isColorPickerActive,
                                  fontFamily,
                                  fontStatus,
                                  fontWeight,
                                  fontStyle,
                                  skewX = 0,
                                  skewY = 0,
                                  backgroundImage,
                                  contentRef,
                                  appRef,
                                  poemOffset,
                                  setPoemOffset,
                                  moveMode,
                                  isDragging,
                                  setIsDragging,
                                  effectiveStyles,
                                  highlightVisible = true,
                                  poemData,
                                  imageQualityMode,
                                  backgroundImageRef,
                                  textMaterial, // <-- NIEUW
                                  textPadding, // <-- NIEUW
                                  textEffectMode,

                                  textEffectParams,
                                  onTextureLoaded, // <-- NIEUW
                              }) {
    const width = canvasWidth;
    const height = canvasHeight;
    const [searchParams, setSearchParams] = useSearchParams();
    const poemId = searchParams.get("poemId");

    const {app} = useApplication();
    const fontLoaded = useFontManager("Cormorant Garamond");

    // Use provided poemData prop first, fallback to URL-based lookup
    const currentPoem = poemData || (poemId ? getPoemById(poemId) : null);

    // Responsive text positioning
    const textPosition = useResponsiveTextPosition(
        width,
        height,
        fontSize,
        lineHeight,
        currentPoem?.lines || []
    );

    // Ensure poemId exists in URL
    useEffect(() => {
        // No longer auto-set poemId=123 - let the navigation system handle this
    }, [searchParams, setSearchParams]);

    // Auto-render on layout changes
    usePixiAutoRender(app, [
        width,
        height,
        textPosition.containerX,
        textPosition.containerY,
        textPosition.scaleFactor,
        fontSize,
        fillColor,
        letterSpacing,
        lineHeight,
        titleColor,
        authorColor,
        isDragging,
        setIsDragging,

    ]);

    // Resize renderer when canvas dimensions change
    useEffect(() => {
        if (app?.renderer) {
            app.renderer.resize(width, height);
        }
    }, [width, height, app]);

    // Store app instance in appRef for export functionality
    useEffect(() => {
        if (app && appRef) {
            appRef.current = app;
        }
    }, [app, appRef]);

    // Reset viewport zoom/pan when background image changes
    useEffect(() => {
        if (viewportRef.current && backgroundImage) {
            const viewport = viewportRef.current;
            viewport.scale.set(1, 1);
            viewport.position.set(0, 0);
        }
    }, [backgroundImage, viewportRef]);
    

    // Auto-recenter viewport (only when no moves have been made)
    useAutoRecenter({
        viewportRef,
        contentRef,
        poemOffset,
        lineOverrides,
        deps: [width, height, poemId, textAlign],
    });

    // Use refs for drag state to prevent useEffect dependency cycles
    const isDraggingRef = useRef(false);
    const dragModeRef = useRef(null);
    const dragStartPos = useRef({x: 0, y: 0});
    const dragStartPoemOffset = useRef({x: 0, y: 0});
    const dragStartLineOffsets = useRef(new Map());
    const groupRef = useRef(null); // Ref for the PoemGroup container

    // Helper functions to update drag ref and ui state
    const setIsDraggingBoth = useCallback(
        (value) => {
            isDraggingRef.current = value;
            setIsDragging(value);
            setIsDragging(value);
        },
        [setIsDragging]
    );

    const setDragMode = useCallback((value) => {
        dragModeRef.current = value;
    }, []);

    // Stable memoized utility functions
    const checkIfOverPoemContent = useCallback(
        (event) => {
            if (!groupRef.current || !viewportRef.current) return false;

            try {
                const localPos = event.data.getLocalPosition(viewportRef.current);
                // Check if over group container (includes background and text)
                const contentBounds = groupRef.current.getBounds();
                
                 const isOverContent =
                        localPos.x >= contentBounds.x &&
                        localPos.x <= contentBounds.x + contentBounds.width &&
                        localPos.y >= contentBounds.y &&
                        localPos.y <= contentBounds.y + contentBounds.height;

                return isOverContent;
            } catch (error) {
                return false;
            }
        },
        []
    );

    // Check if pointer is over any selected lines
    const checkIfOverSelectedLines = useCallback(
        (event) => {
            if (
                !contentRef.current ||
                !viewportRef.current ||
                !selectedLinesRef.current ||
                selectedLinesRef.current.size === 0
            ) {
                return false;
            }

            try {
                const localPos = event.data.getLocalPosition(viewportRef.current);

                for (const lineIndex of selectedLinesRef.current) {
                    let childContainer = null;
                    if (lineIndex === -2) {
                        childContainer = contentRef.current.children[0];
                    } else if (lineIndex === -1) {
                        childContainer = contentRef.current.children[1];
                    } else if (lineIndex >= 0) {
                        childContainer = contentRef.current.children[2 + lineIndex];
                    }

                    if (childContainer) {
                        const lineBounds = childContainer.getBounds();
                        const isOverLine =
                            localPos.x >= lineBounds.x &&
                            localPos.x <= lineBounds.x + lineBounds.width &&
                            localPos.y >= lineBounds.y &&
                            localPos.y <= lineBounds.y + lineBounds.height;

                        if (isOverLine) {
                            return true;
                        }
                    }
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        []
    );

    // Use refs for values that change frequently to prevent callback recreation
    const moveModeRef = useRef(moveMode);
    const poemOffsetRef = useRef(poemOffset);
    const lineOverridesRef = useRef(lineOverrides);
    const selectedLinesRef = useRef(selectedLines);
    const textPositionRef = useRef(textPosition);

    // Stable cursor update function
    const updateCursorForMode = useCallback(
        (event) => {
            if (!viewportRef.current || isDraggingRef.current) return;

            const viewport = viewportRef.current;
            const currentMoveMode = moveModeRef.current;

            try {
                if ((event.ctrlKey || event.metaKey) && currentMoveMode === "edit") {
                    viewport.cursor = "grab";
                } else if (currentMoveMode === "edit") {
                    viewport.cursor = "default";
                } else if (currentMoveMode === "poem") {
                    const isOverPoem = checkIfOverPoemContent(event);
                    viewport.cursor = isOverPoem ? "grab" : "default";
                } else if (currentMoveMode === "line") {
                    const isOverSelectedLine = checkIfOverSelectedLines(event);
                    viewport.cursor = isOverSelectedLine ? "grab" : "default";
                } else {
                    viewport.cursor = "default";
                }
            } catch (error) {

            }
        },
        [checkIfOverPoemContent, checkIfOverSelectedLines]
    );

    // Update refs when values change
    useEffect(() => {
        moveModeRef.current = moveMode;
    }, [moveMode]);

    useEffect(() => {
        poemOffsetRef.current = poemOffset;
    }, [poemOffset]);

    useEffect(() => {
        lineOverridesRef.current = lineOverrides;
    }, [lineOverrides]);

    useEffect(() => {
        selectedLinesRef.current = selectedLines;
    }, [selectedLines]);

    useEffect(() => {
        textPositionRef.current = textPosition;
    }, [textPosition]);

    // Force cursor update when moveMode changes
    useEffect(() => {
        if (!viewportRef.current || isDraggingRef.current) return;
        const viewport = viewportRef.current;

        if (moveMode === 'poem') {
            viewport.cursor = 'grab';
        } else if (moveMode === 'line') {
            viewport.cursor = selectedLines.size > 0 ? 'grab' : 'default';
        } else if (moveMode === 'edit') {
            viewport.cursor = 'default';
        } else {
            viewport.cursor = 'default';
        }
    }, [moveMode, selectedLines, viewportRef.current]);

    // Initialize cursor
    useEffect(() => {
        if (!viewportRef.current) return;
        const viewport = viewportRef.current;
        const currentMode = moveModeRef.current;

        if (currentMode === 'poem') {
            viewport.cursor = 'grab';
        } else if (currentMode === 'line') {
            viewport.cursor = selectedLines.size > 0 ? 'grab' : 'default';
        } else {
            viewport.cursor = 'default';
        }

    }, [viewportRef.current, selectedLines]);

    // Stable memoized event handlers
    const handlePointerDown = useCallback(
        (event) => {
            const currentMoveMode = moveModeRef.current;

            if ((event.ctrlKey || event.metaKey) && currentMoveMode === "edit") {
                return;
            }

            if (currentMoveMode === "edit") return;

            if (currentMoveMode === "poem" && checkIfOverPoemContent(event)) {
                event.stopPropagation();
                setDragMode("poem");
                setIsDraggingBoth(true);
                dragStartPos.current = {x: event.data.global.x, y: event.data.global.y};
                if (groupRef.current) {
                    dragStartPoemOffset.current = {x: groupRef.current.x, y: groupRef.current.y};
                    groupRef.current.alpha = 0.5;
                }
            } else if (currentMoveMode === "line" && checkIfOverSelectedLines(event)) {
                event.stopPropagation();
                setDragMode("line");
                setIsDraggingBoth(true);
                dragStartPos.current = {x: event.data.global.x, y: event.data.global.y};
                const initialOffsets = new Map();
                selectedLinesRef.current.forEach((lineIndex) => {
                    const currentOverride = lineOverridesRef.current[lineIndex] || {};
                    initialOffsets.set(lineIndex, {x: currentOverride.xOffset || 0, y: currentOverride.yOffset || 0});
                });
                dragStartLineOffsets.current = initialOffsets;
                if (contentRef.current) contentRef.current.alpha = 0.5;
            }
        },
        [checkIfOverPoemContent, checkIfOverSelectedLines, setDragMode, setIsDraggingBoth, contentRef]
    );

    const handlePointerMove = useCallback(
        (event) => {
            if (!isDraggingRef.current) {
                updateCursorForMode(event);
                return;
            }

            if (!dragStartPos.current) return;

            const dx = event.data.global.x - dragStartPos.current.x;
            const dy = event.data.global.y - dragStartPos.current.y;

            if (dragModeRef.current === "poem") {
                if (groupRef.current && dragStartPoemOffset.current) {
                    groupRef.current.x = dragStartPoemOffset.current.x + dx;
                    groupRef.current.y = dragStartPoemOffset.current.y + dy;
                }
            } else if (dragModeRef.current === "line") {
                if (dragStartLineOffsets.current) {
                    const newOverrides = {...lineOverridesRef.current};
                    dragStartLineOffsets.current.forEach((startOffset, lineIndex) => {
                        newOverrides[lineIndex] = {...newOverrides[lineIndex], xOffset: startOffset.x + dx, yOffset: startOffset.y + dy};
                    });
                    setLineOverrides(newOverrides);
                }
            }
        },
        [updateCursorForMode, setLineOverrides]
    );

    const handlePointerUp = useCallback(
        (event) => {
            if (isDraggingRef.current) {
                if (dragModeRef.current === "poem") {
                    if (groupRef.current) {
                        const finalX = groupRef.current.x;
                        const finalY = groupRef.current.y;
                        setPoemOffset({
                            x: finalX - textPositionRef.current.containerX,
                            y: finalY - textPositionRef.current.containerY,
                        });
                        groupRef.current.alpha = 1.0;
                    }
                }

                if (contentRef.current) {
                    contentRef.current.alpha = 1.0;
                }

                setIsDraggingBoth(false);
                setDragMode(null);
                dragStartPos.current = null;
                dragStartPoemOffset.current = null;
                dragStartLineOffsets.current = null;
            }
        },
        [setIsDraggingBoth, setDragMode, contentRef, setPoemOffset]
    );

    const viewportDragEnabledRef = useRef(viewportDragEnabled);

    useEffect(() => {
        viewportDragEnabledRef.current = viewportDragEnabled;
    }, [viewportDragEnabled]);

    useEffect(() => {
        if (!viewportRef.current || !contentRef.current) {
            return;
        }

        const viewport = viewportRef.current;

        if (moveMode === "edit") {
            if (viewportDragEnabled) {
                viewport.drag().pinch().wheel().decelerate();
            } else {
                viewport.plugins.remove("drag");
                viewport.pinch().wheel().decelerate();
            }
        } else {
            viewport.plugins.remove("drag");
            viewport.plugins.remove("pinch");
            viewport.plugins.remove("wheel");
            viewport.plugins.remove("decelerate");
        }

        viewport.eventMode = "static";
        viewport.on("pointerdown", handlePointerDown);
        viewport.on("pointermove", handlePointerMove);
        viewport.on("pointerup", handlePointerUp);
        viewport.on("pointerupoutside", handlePointerUp);

        return () => {
            if (viewport && typeof viewport.off === "function") {
                viewport.off("pointerdown", handlePointerDown);
                viewport.off("pointermove", handlePointerMove);
                viewport.off("pointerup", handlePointerUp);
                viewport.off("pointerupoutside", handlePointerUp);
            }
        };
    }, [
        moveMode,
        viewportDragEnabled,
    ]);

    useEffect(() => {
        if (app && viewportRef.current && contentRef.current) {
            debugManager.registerComponents(
                app,
                viewportRef.current,
                contentRef.current
            );
        }
    }, [app, viewportRef.current, contentRef.current]);

    const anchorX = useMemo(() => {
        return {
            left: 0,
            center: 0.5,
            right: 1,
        }[textAlign];
    }, [textAlign]);

    const containerSkew = useMemo(() => {
        const skewXRad = (skewX * Math.PI) / 180;
        const skewYRad = (skewY * Math.PI) / 180;

        return {
            x: skewXRad,
            y: skewYRad,
        };
    }, [skewX, skewY]);

    const {titleStyle, authorStyle, lineStyle} = useTextStyles(
        fontLoaded,
        useMemo(() => ({
            fillColor,
            fontSize: effectiveStyles.fontSize,
            letterSpacing: effectiveStyles.letterSpacing,
            lineHeight: effectiveStyles.lineHeight,
            resolution: effectiveStyles.resolution,
            antialias: effectiveStyles.antialias,
            roundPixels: effectiveStyles.roundPixels,
            textAlign,
            effectiveTitleColor: titleColor,
            effectiveAuthorColor: authorColor,
            fontFamily,
            fontWeight,
            fontStyle,
        }), [fillColor, effectiveStyles, textAlign, titleColor, authorColor, fontFamily, fontWeight, fontStyle, lineHeight]),
        fontStatus
    );
    
    // Background bounds state
    const [backgroundBounds, setBackgroundBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Calculate background bounds dynamically
    useEffect(() => {
        if (!contentRef.current) return;

        // Wait for next frame to ensure text is rendered
        requestAnimationFrame(() => {
            if (!contentRef.current) return;

            if (!contentRef.current) return;

            // Since contentRef now points to PoemContent (only text), 
            // we can get bounds directly without filtering or hiding background.
            const calculatedBounds = contentRef.current.getLocalBounds();

             // Update state if changed
             if (
                 calculatedBounds.x !== backgroundBounds.x ||
                 calculatedBounds.y !== backgroundBounds.y ||
                 calculatedBounds.width !== backgroundBounds.width ||
                 calculatedBounds.height !== backgroundBounds.height
             ) {
                 setBackgroundBounds({
                     x: calculatedBounds.x,
                     y: calculatedBounds.y,
                     width: calculatedBounds.width,
                     height: calculatedBounds.height
                 });
             }
        });
    }, [
        contentRef,
        currentPoem, // Changed from poemData to currentPoem
        fontSize,
        lineHeight,
        letterSpacing,
        textAlign,
        fontFamily,
        fontLoaded,
        textPosition,
        skewX,
        skewY,
        lineOverrides,
        // Exclude backgroundBounds to prevent loops
    ]);

    // Create DropShadow filter for the PoemGroup
    const groupFilters = useMemo(() => {
        // Only apply if textMaterial is active (meaning we have a "stone slab")
        // AND if we have valid bounds to prevent WebGL errors on 0-sized filters
        if (textMaterial && backgroundBounds.width > 0 && backgroundBounds.height > 0) {
            return [new DropShadowFilter({
                distance: 5,
                blur: 4,
                alpha: 0.5,
                rotation: 45,
            })];
        }
        return [];
    }, [textMaterial, backgroundBounds.width, backgroundBounds.height]);


    if (!fontLoaded || !currentPoem) {
        const message = !fontLoaded
            ? "Lettertype laden..."
            : "Geen gedicht gekozen.";
        return (
            <pixiText
                text={message}
                anchor={{x: 0.5, y: 0.5}}
                x={width / 2}
                y={height / 2}
                style={{fill: "white", fontSize: 24, fontFamily: "Arial"}}
            />
        );
    }

    if (!app || !app.renderer || !app.renderer.events) {
        return null;
    }

    return (
        <pixiViewport
            ref={viewportRef}
            screenWidth={width}
            screenHeight={height}
            worldWidth={width}
            worldHeight={height}
            events={app.renderer.events}
        >
            <BackgroundImage
                ref={backgroundImageRef}
                imageUrl={typeof backgroundImage === 'string' ? backgroundImage : backgroundImage?.url}
                photoData={typeof backgroundImage === 'object' ? backgroundImage : null}
                imageQualityMode={imageQualityMode}
                canvasWidth={width}
                canvasHeight={height}
                onTextureLoaded={onTextureLoaded} // <-- Pass callback
            />

            <pixiContainer
                ref={groupRef}
                label="PoemGroup"
                x={textPosition.containerX + poemOffset.x}
                y={textPosition.containerY + poemOffset.y}
                scale={{x: textPosition.scaleFactor, y: textPosition.scaleFactor}}
                skew={containerSkew}
                eventMode={moveMode === "poem" ? "dynamic" : "passive"}
                interactive={moveMode === "poem"}
                interactiveChildren={moveMode === "edit"}
                filters={groupFilters}
            >
                {/* Node 4: TextBackground (Sibling of Content) */}
                {textMaterial && (
                    <pixiContainer
                        label="textBackgroundContainer"
                        x={backgroundBounds.x}
                        y={backgroundBounds.y}
                    >
                        <TextBackground
                            width={backgroundBounds.width}
                            height={backgroundBounds.height}
                            textureUrl={textMaterial}
                            padding={textPadding}
                        />
                    </pixiContainer>
                )}

                {/* Node 5: PoemContent (Contains Text Lines) */}
                <pixiContainer
                    ref={contentRef}
                    label="PoemContent"
                >
                    <PoemTitle
                        title={currentPoem.title}
                        x={lineOverrides[-2]?.xOffset || 0}
                        y={lineOverrides[-2]?.yOffset || 0}
                        baseStyle={titleStyle}
                        lineOverrides={lineOverrides[-2]}
                        isSelected={selectedLines.has(-2)}
                        onSelect={(event) => onLineSelect(-2, event)}
                        fontStatus={fontStatus}
                        globalFontFamily={fontFamily}
                        anchorX={anchorX}
                        isColorPickerActive={isColorPickerActive}
                        highlightVisible={highlightVisible}
                        moveMode={moveMode}
                        index={-2}
                        skewX={lineOverrides[-2]?.skewX}
                        skewY={lineOverrides[-2]?.skewY}
                        overrideTextAlign={lineOverrides[-2]?.textAlign}
                        textEffectMode={textEffectMode}
                        textEffectParams={textEffectParams}
                    />

                    <PoemAuthor
                        author={currentPoem.author}
                        x={lineOverrides[-1]?.xOffset || 0}
                        y={textPosition.authorY + (lineOverrides[-1]?.yOffset || 0)}
                        baseStyle={authorStyle}
                        lineOverrides={lineOverrides[-1]}
                        isSelected={selectedLines.has(-1)}
                        onSelect={(event) => onLineSelect(-1, event)}
                        fontStatus={fontStatus}
                        globalFontFamily={fontFamily}
                        anchorX={anchorX}
                        isColorPickerActive={isColorPickerActive}
                        highlightVisible={highlightVisible}
                        moveMode={moveMode}
                        index={-1}
                        selectedLines={selectedLines}
                        resolution={effectiveStyles.resolution}
                        skewX={lineOverrides[-1]?.skewX}
                        skewY={lineOverrides[-1]?.skewY}
                        overrideTextAlign={lineOverrides[-1]?.textAlign}
                        textEffectMode={textEffectMode}
                        textEffectParams={textEffectParams}
                    />

                    {currentPoem.lines.map((line, index) => {
                        const xOffset = lineOverrides[index]?.xOffset || 0;
                        const yOffset = lineOverrides[index]?.yOffset || 0;

                        return (
                            <PoemLine
                                key={index}
                                line={line}
                                x={0 + xOffset}
                                y={textPosition.poemStartY + index * lineHeight + yOffset}
                                baseStyle={lineStyle}
                                lineOverrides={lineOverrides[index]}
                                isSelected={selectedLines.has(index)}
                                fontStatus={fontStatus}
                                globalFontFamily={fontFamily}
                                onSelect={(event) => onLineSelect(index, event)}
                                anchorX={anchorX}
                                isColorPickerActive={isColorPickerActive}
                                highlightVisible={highlightVisible}
                                moveMode={moveMode}
                                index={index}
                                selectedLines={selectedLines}
                                resolution={effectiveStyles.resolution}
                                skewX={lineOverrides[index]?.skewX}
                                skewY={lineOverrides[index]?.skewY}
                                overrideTextAlign={lineOverrides[index]?.textAlign}
                                textEffectMode={textEffectMode}
                                textEffectParams={textEffectParams}
                            />
                        );
                    })}
                </pixiContainer>
            </pixiContainer>
        </pixiViewport>
    );
}
