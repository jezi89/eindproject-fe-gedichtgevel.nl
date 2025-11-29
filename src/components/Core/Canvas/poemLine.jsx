import React, {useEffect, useRef} from "react";
import {useLineStyle} from "@/hooks/canvas/useTextStyles.js";
import {useTextEffects} from "@/hooks/canvas/useTextEffects.js";

export const PoemLine = ({
                             line,
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
                             moveMode,
                             index,
                             selectedLines,
                             onDragLineStart,
                             onDragLineMove,
                             onDragLineEnd,
                             resolution = 1,
                             skewX = 0,
                             skewY = 0,
                             overrideTextAlign,
                             textEffectMode,
                             textEffectParams,
                         }) => {
    const textRef = useRef();
    const containerRef = useRef();
    const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });

    // Use the new useLineStyle hook to compute the final style
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

    // Measure text dimensions when content or style changes
    useEffect(() => {
        if (textRef.current) {
            // Force update to ensure metrics are correct
            const { width, height } = textRef.current;
            setTextBounds({ width, height });
        }
    }, [line, computedStyle, resolution, fontStatus]);

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

    // Calculate Text Effects using the custom hook
    const { style: effectStyle, blendMode, alpha } = useTextEffects(textEffectMode, textEffectParams);

    // Merge computed style with effect style
    const finalStyle = React.useMemo(() => {
        if (!computedStyle) return null;
        const style = computedStyle.clone();
        // Apply effect styles (filters, dropShadow, etc.)
        Object.assign(style, effectStyle);
        return style;
    }, [computedStyle, effectStyle]);

    return (
        <pixiContainer
            ref={containerRef}
            x={x}
            y={y}
            skew={effectiveSkew}
            eventMode="passive"
            interactiveChildren={moveMode === "edit"}
        >
            <pixiText
                ref={textRef}
                text={line}
                style={finalStyle}
                anchor={{x: effectiveAnchorX, y: 0}}
                resolution={resolution}
                blendMode={blendMode}
                alpha={alpha}
            />
        </pixiContainer>
    );
};
