import {useSearchParams} from "react-router";
import {useEffect, useMemo, useCallback, useRef, useState} from "react";
import {useApplication} from "@pixi/react";
import {getPoemById} from "@/data/canvas/testdata";
import PoemLine from "./poemLine";
import PoemTitle from "./PoemTitle";
import PoemAuthor from "./PoemAuthor";
import {useFontManager} from "@/hooks/canvas/useFontManager";
import {useTextStyles} from "@/hooks/canvas/useTextStyles";
import {useResponsiveTextPosition} from "@/hooks/canvas/useResponsiveTextPosition";
import {usePixiAutoRender} from "@/hooks/canvas/usePixiAutoRender";
import {useAutoRecenter} from "@/hooks/canvas/useAutoRecenter";
import {debugManager} from "@/debug/DebugManager";
import BackgroundImage from "./BackgroundImage"; // <-- Importeren
// import { useDraggable } from "../hooks/useDraggable"; // <-- REMOVED: Will use viewport-level event handling


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
	setLineOverrides, // <-- Add setLineOverrides prop
	isColorPickerActive,
	fontFamily,
	fontStatus,
	fontWeight,
	fontStyle,
	skewX,
	skewY,
	skewZ,
	backgroundImage, // <-- De nieuwe prop
	contentRef,
	poemOffset,
	setPoemOffset, // <-- STAP 2: Ontvang de state setter
	moveMode, // <-- En de moveMode
	isDragging, // <-- NIEUW: Add deze prop
	setIsDragging, // <-- NIEUW: Add deze prop
	effectiveStyles, // <-- NIEUW: Voor tekst optimalisatie
	highlightVisible = true, // <-- NEW: Highlight toggle

	// 3D transformation props
	lineTransforms,
	global3DSettings,
	// Poem data prop (takes priority over URL params)
	poemData,
}) {
	const width = canvasWidth;
	const height = canvasHeight;
	const [searchParams, setSearchParams] = useSearchParams();
	const poemId = searchParams.get("poemId");

	const { app } = useApplication();
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
		isDragging, // <-- NIEUW: Add deze prop
		setIsDragging, // <-- NIEUW: Add deze prop
	]);

	// Resize renderer when canvas dimensions change
	useEffect(() => {
		if (app?.renderer) {
			app.renderer.resize(width, height);
		}
	}, [width, height, app]);

	// Auto-recenter viewport (only when no moves have been made)
	useAutoRecenter({
		viewportRef,
		contentRef,
		poemOffset,
		lineOverrides,
		deps: [width, height, poemId, textAlign],
	});

	// Debug logging
	useEffect(() => {
		console.log("Viewport Debug:", {
			app: !!app,
			ticker: !!app?.ticker,
			renderer: !!app?.renderer,
			events: !!app?.renderer?.events,
			width,
			height,
		});
	}, [app, width, height]);

	// Debug logging for drag issues
	useEffect(() => {
		console.log("DEBUG CanvasContent:", {
			contentRef: !!contentRef.current,
			contentRefType: contentRef.current?.constructor?.name,
			moveMode: moveMode,
			appReady: !!app,
			stageReady: !!app?.stage,
		});
	}, [contentRef.current, moveMode, app]);

	// Use refs for drag state to prevent useEffect dependency cycles
	const isDraggingRef = useRef(false);
	const dragModeRef = useRef(null); // Can be 'poem', 'line', or 'viewport'
	const dragStartPos = useRef({ x: 0, y: 0 });
	const dragStartPoemOffset = useRef({ x: 0, y: 0 });
	const dragStartLineOffsets = useRef(new Map());

	// Helper functions to update drag ref and ui state
	const setIsDraggingBoth = useCallback(
		(value) => {
			isDraggingRef.current = value;
			setIsDragging(value); // <-- Local state (behoud dit)
			setIsDragging(value); // <-- NIEUW: Global state voor XYMoveSliders
		},
		[setIsDragging]
	); // <-- NIEUW: Add dependency

	const setDragMode = useCallback((value) => {
		dragModeRef.current = value;
	}, []);

	// Stable memoized utility functions
	const checkIfOverPoemContent = useCallback(
		(event) => {
			if (!contentRef.current || !viewportRef.current) return false;

			try {
				// Get event position in viewport coordinates
				const localPos = event.data.getLocalPosition(viewportRef.current);

				// Check each child's bounds individually for more robust hit detection
				for (const child of contentRef.current.children) {
					const childBounds = child.getBounds();
					const isOverChild =
						localPos.x >= childBounds.x &&
						localPos.x <= childBounds.x + childBounds.width &&
						localPos.y >= childBounds.y &&
						localPos.y <= childBounds.y + childBounds.height;

					if (isOverChild) {
						return true; // Hit detected on at least one child
					}
				}

				return false; // Not over any child
			} catch (error) {
				console.warn("Error checking poem bounds:", error);
				return false;
			}
		},
		[contentRef, viewportRef]
	); // No dependencies to prevent re-creation

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
				// Get event position in viewport coordinates
				const localPos = event.data.getLocalPosition(viewportRef.current);

				// Check each selected line's bounds
				for (const lineIndex of selectedLinesRef.current) {
					// Get the child container for this line index
					// contentRef.current has children in this order:
					// 0: PoemTitle (index -2)
					// 1: PoemAuthor (index -1)
					// 2+: PoemLines (index 0, 1, 2, etc.)

					let childContainer = null;
					if (lineIndex === -2) {
						// PoemTitle is first child (index 0)
						childContainer = contentRef.current.children[0];
					} else if (lineIndex === -1) {
						// PoemAuthor is second child (index 1)
						childContainer = contentRef.current.children[1];
					} else if (lineIndex >= 0) {
						// PoemLines start at child index 2
						childContainer = contentRef.current.children[2 + lineIndex];
					}

					if (childContainer) {
						const lineBounds = childContainer.getBounds();

						// Check if position is within this line's bounds
						const isOverLine =
							localPos.x >= lineBounds.x &&
							localPos.x <= lineBounds.x + lineBounds.width &&
							localPos.y >= lineBounds.y &&
							localPos.y <= lineBounds.y + lineBounds.height;

						if (isOverLine) {
							// console.log('Cursor over selected line:', lineIndex, {
							//   cursorPos: { x: localPos.x, y: localPos.y },
							//   lineBounds: {
							//     x: lineBounds.x,
							//     y: lineBounds.y,
							//     width: lineBounds.width,
							//     height: lineBounds.height
							//   }
							// });
							return true;
						}
					}
				}

				return false;
			} catch (error) {
				console.warn("Error checking selected lines bounds:", error);
				return false;
			}
		},
		[contentRef, viewportRef]
	); // Removed selectedLines dependency - using ref instead

	// Use refs for values that change frequently to prevent callback recreation
	const moveModeRef = useRef(moveMode);
	const poemOffsetRef = useRef(poemOffset);
	const lineOverridesRef = useRef(lineOverrides);
	const selectedLinesRef = useRef(selectedLines);

	// Stable cursor update function
	const updateCursorForMode = useCallback(
		(event) => {
			if (!viewportRef.current || isDraggingRef.current) return;

			const viewport = viewportRef.current;
			const currentMoveMode = moveModeRef.current;

			try {
				// CTRL+hover in Edit mode shows camera cursor
				if ((event.ctrlKey || event.metaKey) && currentMoveMode === "edit") {
					viewport.cursor = "grab";
				} else if (currentMoveMode === "edit") {
					// Edit mode without CTRL: default cursor (allow line selection)
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
				console.warn("Error updating cursor:", error);
			}
		},
		[checkIfOverPoemContent, checkIfOverSelectedLines, viewportRef]
	);

	// Update refs when values change (doesn't trigger re-renders)
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

	// Force cursor update when moveMode changes (without requiring mouse movement)
	useEffect(() => {
		if (!viewportRef.current || isDraggingRef.current) return;

		const viewport = viewportRef.current;

		// Immediately update cursor based on current mode
		if (moveMode === 'poem') {
			viewport.cursor = 'grab'; // Always grab in poem mode when hovering over poem
		} else if (moveMode === 'line') {
			// In line mode, show grab if we have selected lines
			viewport.cursor = selectedLines.size > 0 ? 'grab' : 'default';
		} else if (moveMode === 'edit') {
			viewport.cursor = 'default';
		} else {
			viewport.cursor = 'default';
		}

		console.log(`🖱️ Cursor updated for mode "${moveMode}":`, viewport.cursor);
	}, [moveMode, selectedLines, viewportRef]);

	// Stable memoized event handlers using refs to prevent dependency cycles
	const handlePointerDown = useCallback(
		(event) => {
			const currentMoveMode = moveModeRef.current;

			// CTRL+Drag in Edit mode = Viewport camera drag (highest priority)
			if ((event.ctrlKey || event.metaKey) && currentMoveMode === "edit") {
				// Logic for viewport drag...
				return;
			}

			if (currentMoveMode === "edit") return; // Allow line selection

			// Route to appropriate move mode handler
			if (currentMoveMode === "poem" && checkIfOverPoemContent(event)) {
				console.log("Starting poem drag");
				event.stopPropagation();
				setDragMode("poem");
				setIsDraggingBoth(true);
				dragStartPos.current = { x: event.data.global.x, y: event.data.global.y };
				// Store the actual container position, not the state offset
				if (contentRef.current) {
					dragStartPoemOffset.current = { x: contentRef.current.x, y: contentRef.current.y };
					contentRef.current.alpha = 0.5;
				}
			} else if (currentMoveMode === "line" && checkIfOverSelectedLines(event)) {
				// Line drag logic remains the same as it uses a different state mechanism
				console.log("Starting line drag");
				event.stopPropagation();
				setDragMode("line");
				setIsDraggingBoth(true);
				dragStartPos.current = { x: event.data.global.x, y: event.data.global.y };
				const initialOffsets = new Map();
				selectedLinesRef.current.forEach((lineIndex) => {
					const currentOverride = lineOverridesRef.current[lineIndex] || {};
					initialOffsets.set(lineIndex, { x: currentOverride.xOffset || 0, y: currentOverride.yOffset || 0 });
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
				// DIRECTLY manipulate the PIXI container, no React re-renders
				if (contentRef.current && dragStartPoemOffset.current) {
					contentRef.current.x = dragStartPoemOffset.current.x + dx;
					contentRef.current.y = dragStartPoemOffset.current.y + dy;
				}
			} else if (dragModeRef.current === "line") {
				// Line drag logic remains the same, it updates a different state
				if (dragStartLineOffsets.current) {
					const newOverrides = { ...lineOverridesRef.current };
					dragStartLineOffsets.current.forEach((startOffset, lineIndex) => {
						newOverrides[lineIndex] = { ...newOverrides[lineIndex], xOffset: startOffset.x + dx, yOffset: startOffset.y + dy };
					});
					setLineOverrides(newOverrides);
				}
			}
		},
		[updateCursorForMode, setLineOverrides] // setPoemOffset is no longer a dependency
	);

	const handlePointerUp = useCallback(
		(event) => {
			if (isDraggingRef.current) {
				if (dragModeRef.current === "poem") {
					// Drag ended, now update the React state ONCE
					if (contentRef.current) {
						const finalX = contentRef.current.x;
						const finalY = contentRef.current.y;
						// Calculate the final offset relative to the initial text position
						setPoemOffset({
							x: finalX - textPosition.containerX,
							y: finalY - textPosition.containerY,
						});
					}
				}

				if (contentRef.current) {
					contentRef.current.alpha = 1.0;
				}

				// Reset drag state
				setIsDraggingBoth(false);
				setDragMode(null);
				dragStartPos.current = null;
				dragStartPoemOffset.current = null;
				dragStartLineOffsets.current = null;
			}
		},
		[setIsDraggingBoth, setDragMode, contentRef, setPoemOffset, textPosition.containerX, textPosition.containerY]
	);

	// Use ref for viewportDragEnabled to prevent effect re-runs
	const viewportDragEnabledRef = useRef(viewportDragEnabled);

	useEffect(() => {
		viewportDragEnabledRef.current = viewportDragEnabled;
	}, [viewportDragEnabled]);

	// Viewport plugins and camera control system
	useEffect(() => {
		console.log("=== VIEWPORT SETUP ===");
		console.log("viewportRef.current exists:", !!viewportRef.current);
		console.log("Current moveMode:", moveMode);
		console.log("viewportDragEnabled:", viewportDragEnabled);

		if (!viewportRef.current) {
			console.log("No viewport ref, skipping setup");
			return;
		}

		const viewport = viewportRef.current;
		console.log("Setting up viewport:", viewport.constructor.name);

		// Configure viewport plugins based on mode and CTRL state
		if (moveMode === "edit") {
			// Edit mode: Enable camera controls when CTRL is held or viewportDragEnabled is true
			if (viewportDragEnabled) {
				console.log("Enabling camera controls in edit mode");
				viewport.drag().pinch().wheel().decelerate();
			} else {
				console.log(
					"Disabling camera controls in edit mode, enabling line selection"
				);
				viewport.plugins.remove("drag");
				viewport.pinch().wheel().decelerate(); // Keep zoom and wheel
			}
		} else {
			// Move modes: Disable all camera controls
			console.log("Move mode active, disabling all camera controls");
			viewport.plugins.remove("drag");
			viewport.plugins.remove("pinch");
			viewport.plugins.remove("wheel");
			viewport.plugins.remove("decelerate");
		}

		// Set up event mode
		viewport.eventMode = "static";
		viewport.on("pointerdown", handlePointerDown);
		viewport.on("pointermove", handlePointerMove);
		viewport.on("pointerup", handlePointerUp);
		viewport.on("pointerupoutside", handlePointerUp);

		console.log("Event handlers attached to viewport");

		return () => {
			console.log("Cleaning up viewport event handlers");
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
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	]); // Only re-run if handlers change (they won't)

	// Debug manager registration
	useEffect(() => {
		if (app && viewportRef.current && contentRef.current) {
			debugManager.registerComponents(
				app,
				viewportRef.current,
				contentRef.current
			);
		}
	}, [app, viewportRef.current, contentRef.current]);

	// Convert textAlign to anchorX
	const anchorX = useMemo(() => {
		return {
			left: 0,
			center: 0.5,
			right: 1,
		}[textAlign];
	}, [textAlign]);

	// Calculate combined container-level skew including Z-axis effect
	const containerSkew = useMemo(() => {
		// Convert degrees to radians
		const skewXRad = (skewX * Math.PI) / 180;
		const skewYRad = (skewY * Math.PI) / 180;
		const skewZRad = (skewZ * Math.PI) / 180;

		// skewZ creates a rotational effect that affects both X and Y skew
		const skewZEffectX = Math.sin(skewZRad) * 0.5; // Z-skew creates X component
		const skewZEffectY = Math.cos(skewZRad) * 0.5 - 0.5; // Z-skew creates Y component

		return {
			x: skewXRad + skewZEffectX,
			y: skewYRad + skewZEffectY,
		};
	}, [skewX, skewY, skewZ]);

	const { titleStyle, authorStyle, lineStyle } = useTextStyles(
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

	// Loading state
	if (!fontLoaded || !currentPoem) {
		const message = !fontLoaded
			? "Lettertype laden..."
			: "Geen gedicht gekozen.";
		return (
			<pixiText
				text={message}
				anchor={{ x: 0.5, y: 0.5 }}
				x={width / 2}
				y={height / 2}
				style={{ fill: "white", fontSize: 24, fontFamily: "Arial" }}
			/>
		);
	}

	// Wait for PIXI app and events system
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
			{/* Render de achtergrond EERST, zodat hij achter de tekst komt */}
			<BackgroundImage
				imageUrl={typeof backgroundImage === 'string' ? backgroundImage : backgroundImage?.url}
				canvasWidth={width}
				canvasHeight={height}
			/>

			<pixiContainer
				ref={contentRef}
				x={textPosition.containerX + poemOffset.x}
				y={textPosition.containerY + poemOffset.y}
				scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
				skew={containerSkew}
				eventMode={moveMode === "poem" ? "dynamic" : "passive"}
				interactive={moveMode === "poem"}
				interactiveChildren={moveMode === "edit"}
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
					selectedLines={selectedLines}
					resolution={effectiveStyles.resolution}
					// 3D transformation props
					lineTransforms={lineTransforms?.[-2]}
					global3DSettings={global3DSettings}
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
					// 3D transformation props
					lineTransforms={lineTransforms?.[-1]}
					global3DSettings={global3DSettings}
				/>

				{currentPoem.lines.map((line, index) => {
					// Use xOffset and yOffset from lineOverrides (compatible with XYMoveSliders)
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
							//isSelected={selectedLine === index} // <-- OUDE LOGICA
							isSelected={selectedLines.has(index)} // <-- NIEUWE LOGICA
							//onSelect={() => onLineSelect(index)} // <-- OUDE LOGICA
							fontStatus={fontStatus} // <-- 3. Geef de prop door aan de PoemLine
							globalFontFamily={fontFamily} // Geef ook de globale font mee als fallback
							onSelect={(event) => onLineSelect(index, event)} // <-- NIEUWE LOGICA: geef event door!
							anchorX={anchorX}
							isColorPickerActive={isColorPickerActive}
							highlightVisible={highlightVisible}
							// New drag props
							moveMode={moveMode}
							index={index}
							selectedLines={selectedLines}
							resolution={effectiveStyles.resolution}
							// 3D transformation props
							lineTransforms={lineTransforms?.[index]}
							global3DSettings={global3DSettings}
						/>
					);
				})}
			</pixiContainer>
		</pixiViewport>
	);
}
