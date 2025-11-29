// src/components/Core/Canvas/components/PoemAuthor.jsx
import React, {useEffect, useRef} from "react";
import {useLineStyle} from "@/hooks/canvas/useTextStyles.js";
// import { useDraggableLine } from "../hooks/useDraggableLine"; // REMOVED: Will use viewport-level event handling



export const PoemAuthor = ({
                               author,
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
                               highlightVisible = true,
                               // Drag functionality props
                               moveMode,
                               index, // This will be -1
                               selectedLines,
                               onDragLineStart,
                               onDragLineMove,
                               onDragLineEnd,
                               // Resolution optimization prop
                               resolution = 1,
                               // Line-specific overrides
                               skewX = 0,
                               skewY = 0,
                               overrideTextAlign,

                           }) => {
    const textRef = useRef();
    const containerRef = useRef();
    const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });

    // Use the same useLineStyle hook to compute the final style
    const computedStyle = useLineStyle(
        baseStyle,
        lineOverrides,
        isSelected,
        isColorPickerActive,
        fontStatus,
        globalFontFamily,
        highlightVisible
    );

    // Calculate effective anchor based on override or global setting
    const effectiveAnchorX = React.useMemo(() => {
        if (overrideTextAlign) {
            return {
                left: 0,
                center: 0.5,
                right: 1,
            }[overrideTextAlign];
        }
        return anchorX;
    }, [overrideTextAlign, anchorX]);

    // Calculate effective skew in radians
    const effectiveSkew = React.useMemo(() => {
        return {
            x: (skewX * Math.PI) / 180,
            y: (skewY * Math.PI) / 180,
        };
    }, [skewX, skewY]);

    // Measure text dimensions
    useEffect(() => {
        if (textRef.current) {
            const { width, height } = textRef.current;
            setTextBounds({ width, height });
        }
    }, [author, computedStyle, resolution, fontStatus]);

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

    return (
        <pixiContainer
            ref={containerRef}
            x={x}
            y={y}
            skew={effectiveSkew} // <-- Apply skew here
            eventMode="passive"
            interactiveChildren={moveMode === "edit"}
        >


            <pixiText
                ref={textRef}
                text={author}
                style={computedStyle}
                anchor={{x: effectiveAnchorX, y: 0}} // <-- Apply anchor here
                resolution={resolution}
            />
        </pixiContainer>
    );
};
