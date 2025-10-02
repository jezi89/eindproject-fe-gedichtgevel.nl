// src/components/Core/Canvas/components/PoemLine.jsx
import React, {useEffect, useMemo, useRef} from "react";
import {useLineStyle} from "@/hooks/canvas/useTextStyles.js";
import {Transform3D, Transform3DManager} from "@/utils/canvas/Transform3D.js"; // Updated import path
// import { useDraggableLine } from "../hooks/useDraggableLine"; // REMOVED: Will use viewport-level event handling

export const PoemLine = ({
                             line,
                             x,
                             y,
                             baseStyle,
                             lineOverrides,
                             isSelected,
                             onSelect,
                             fontStatus, // <-- Deze prop komt al binnen van CanvasContent
                             globalFontFamily, // <-- Deze prop komt ook al binnen
                             anchorX = 0.5,
                             isColorPickerActive = false,
                             highlightVisible = true, // <-- NEW: Highlight toggle
                             // New props for drag functionality
                             moveMode,
                             index,
                             selectedLines,
                             onDragLineStart,
                             onDragLineMove,
                             onDragLineEnd,
                             // Resolution optimization prop
                             resolution = 1,

                             // 3D transformation props
                             lineTransforms,
                             global3DSettings,
                         }) => {
    const textRef = useRef();
    const containerRef = useRef(); // For line drag functionality

    // Use the new useLineStyle hook to compute the final style
    const computedStyle = useLineStyle(
        baseStyle,
        lineOverrides,
        isSelected,
        isColorPickerActive,
        fontStatus, // <-- Geef de status door
        globalFontFamily, // <-- Geef de globale font door als fallback
        highlightVisible // <-- NEW: Pass highlight toggle
    );

    // 🎭 3D TRANSFORMATION CALCULATION
    const transform3D = useMemo(() => {
        if (!lineTransforms) {
            return new Transform3D(); // Default transform
        }

        const transform = new Transform3D(lineTransforms);

        // Debug log voor development
        if (lineTransforms && Object.keys(lineTransforms).length > 0) {
            console.log(`🎭 PoemLine ${index} 3D Transform:`, {
                input: lineTransforms,
                calculated: {
                    rotation: transform.rotationZ,
                    scale: {x: transform.scaleX, y: transform.scaleY},
                    alpha: transform.calculateAlpha(),
                    z: transform.z,
                },
            });
        }

        return transform;
    }, [lineTransforms, index]);

    // Convert 3D transform to PIXI properties
    const pixiTransformProps = useMemo(() => {
        const props = transform3D.toPixiProperties();

        // ALWAYS apply global perspective settings when configured
        // This ensures global 3D settings work intuitively without needing per-line Z values
        if (
            global3DSettings?.perspective &&
            global3DSettings.perspective !== 1000
        ) {
            const perspectiveEffect = Transform3DManager.calculatePerspective(
                transform3D,
                global3DSettings.perspective
            );
            props.scale = {
                x: props.scale.x * perspectiveEffect.scaleX,
                y: props.scale.y * perspectiveEffect.scaleY,
            };
            props.alpha = props.alpha * perspectiveEffect.alpha;
        }

        // Apply global lighting settings if enabled
        if (
            global3DSettings?.globalLighting?.enabled &&
            !transform3D.lighting.enabled
        ) {
            // Use global lighting when per-text lighting is disabled
            const globalLighting = global3DSettings.globalLighting;
            const lightingEffect = Transform3DManager.calculateLighting(
                transform3D,
                globalLighting.direction
            );
            const lightingAlpha =
                lightingEffect * globalLighting.intensity + globalLighting.ambient;
            // FIXED: Clamp alpha to valid range [0, 1] for PIXI
            props.alpha *= Math.max(0, Math.min(1, lightingAlpha));
        }

        // Apply global material settings (blend mode, etc.)
        if (global3DSettings?.material?.blendMode) {
            props.blendMode = global3DSettings.material.blendMode;
        }

        // Debug: Log final PIXI properties for enhanced controls
        if (
            props.rotation !== 0 ||
            props.scale.x !== 1 ||
            props.scale.y !== 1 ||
            props.alpha !== 1 ||
            props.tint !== 0xffffff ||
            props.blendMode !== "normal"
        ) {
            console.log(`🎭 PoemLine ${index} ENHANCED PIXI Props:`, {
                rotation: props.rotation,
                scale: props.scale,
                alpha: props.alpha,
                skew: props.skew,
                tint: props.tint?.toString(16) || "default",
                blendMode: props.blendMode,
                pivot: props.pivot,
            });
        }

        return props;
    }, [transform3D, global3DSettings, index]);

    // Mode-based interaction: only in edit mode
    useEffect(() => {
        const textElement = textRef.current;
        if (!textElement) return;

        // Only add click events in edit mode
        if (moveMode === "edit") {
            const handlePointerDown = (event) => {
                // Ctrl/Cmd check first - let viewport handle
                if (event.ctrlKey || event.metaKey) {
                    return;
                }

                event.stopPropagation();
                if (onSelect) {
                    onSelect(event);
                }
            };

            const handlePointerOver = () => {
                textElement.cursor = "pointer";
            };

            // Set up event handling
            textElement.eventMode = "static";
            textElement.interactive = true;
            textElement.cursor = "pointer";

            textElement.on("pointerdown", handlePointerDown);
            textElement.on("pointerover", handlePointerOver);

            return () => {
                textElement.off("pointerdown", handlePointerDown);
                textElement.off("pointerover", handlePointerOver);
            };
        } else {
            // In non-edit modes, no interaction
            textElement.eventMode = "none";
            textElement.interactive = false;
            textElement.cursor = "default";
        }
    }, [onSelect, moveMode]);

    // REMOVED: Line drag functionality - will use viewport-level event handling
    // useDraggableLine(containerRef, {
    //   enabled: moveMode === 'line' && selectedLines && selectedLines.has(index),
    //   onDragStart: () => onDragLineStart && onDragLineStart(index, selectedLines),
    //   onDragMove: (offset) => onDragLineMove && onDragLineMove(index, offset, selectedLines),
    //   onDragEnd: onDragLineEnd
    // });

    return (
        <pixiContainer
            ref={containerRef}
            x={x}
            y={y}
            eventMode="passive"
            interactiveChildren={moveMode === "edit"}
        >
            <pixiText
                ref={textRef}
                text={line}
                style={computedStyle}
                anchor={{x: anchorX, y: 0}}
                resolution={resolution}
                // 🎭 ENHANCED 3D TRANSFORMATION PROPERTIES
                rotation={pixiTransformProps.rotation}
                scale={pixiTransformProps.scale}
                alpha={pixiTransformProps.alpha}
                pivot={pixiTransformProps.pivot}
                skew={pixiTransformProps.skew}
                tint={pixiTransformProps.tint}
                blendMode={pixiTransformProps.blendMode}
            />
        </pixiContainer>
    );
};

