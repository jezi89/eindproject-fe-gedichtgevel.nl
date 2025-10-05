// src/components/Core/Canvas/components/PoemTitle.jsx
import React, {useEffect, useRef} from "react";
import {useLineStyle} from "@/hooks/canvas/useTextStyles.js";
// import { useDraggableLine } from "../hooks/useDraggableLine"; // REMOVED: Will use viewport-level event handling

export const PoemTitle = ({
                              title,
                              x,
                              y,
                              baseStyle,
                              lineOverrides,
                              isSelected,
                              onSelect,
                              fontStatus,
                              globalFontFamily,
                              anchorX = 0.5,
                              isColorPickerActive = false,
                              highlightVisible = true, // <-- NEW: Highlight toggle
                              // Drag functionality props
                              moveMode,
                              index, // This will be -2
                              selectedLines,
                              onDragLineStart,
                              onDragLineMove,
                              onDragLineEnd,
                              // Resolution optimization prop
                              resolution = 1,
                          }) => {
    const textRef = useRef();
    const containerRef = useRef();

    // Use the same useLineStyle hook to compute the final style
    const computedStyle = useLineStyle(
        baseStyle,
        lineOverrides,
        isSelected,
        isColorPickerActive,
        fontStatus,
        globalFontFamily,
        highlightVisible // <-- NEW: Pass highlight toggle
    );

    // Mode-based interaction: only in edit mode (identical to PoemLine)
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

    // REMOVED: Title drag functionality - will use viewport-level event handling
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
                text={title}
                style={computedStyle}
                anchor={{x: anchorX, y: 0}}
                resolution={resolution}
            />
        </pixiContainer>
    );
};


