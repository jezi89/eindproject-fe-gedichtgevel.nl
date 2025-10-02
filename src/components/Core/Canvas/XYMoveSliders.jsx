// src/components/Core/Canvas/components/XYMoveSliders.jsx
import React, {useCallback, useMemo, useState, useRef, useEffect} from "react";
import {useWindowSize} from "@/hooks/useWindowSize.js"; // Updated import path
import styles from "./XYMoveSliders.module.scss";

export default function XYMoveSliders({
                                          moveMode,
                                          selectedLines,
                                          poemOffset,
                                          setPoemOffset,
                                          lineOverrides,
                                          setLineOverrides,
                                          isDragging,
                                          isVisible,
                                          setIsVisible,
                                          onRequestFocus, // Callback voor focus request van parent
                                      }) {
    const containerRef = useRef(null);
    const overlayRef = useRef(null);
    const [isFocusActive, setIsFocusActive] = useState(false);

    // Auto-focus en cursor overlay wanneer visibility verandert naar true
    useEffect(() => {
        if (isVisible && containerRef.current) {
            console.log('📦 XYMoveSliders: Showing popover and auto-focusing on visibility change');
            containerRef.current.showPopover();
            containerRef.current.focus({preventScroll: true});

            // Activeer focus overlay
            setIsFocusActive(true);
            const timeout = setTimeout(() => {
                setIsFocusActive(false);
            }, 5000); // Auto-deactiveer na 5 seconden

            return () => clearTimeout(timeout);
        } else if (containerRef.current) {
            console.log('📦 XYMoveSliders: Hiding popover on visibility change');
            containerRef.current.hidePopover();
        }
    }, [isVisible]);

    // Focus request handler voor callback van parent (met cursor overlay)
    const handleRequestFocus = useCallback(() => {
        if (containerRef.current) {
            console.log('🎛️ XYMoveSliders: Focus requested via callback');
            containerRef.current.focus({preventScroll: true});

            // Activeer focus overlay
            setIsFocusActive(true);
            const _timeout = setTimeout(() => {
                setIsFocusActive(false);
            }, 5000);

            return true;
        }
        console.warn('🎛️ XYMoveSliders: Container ref not available for focus');
        return false;
    }, []);

    // ESC key om focus overlay vroegtijdig te deactiveren
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isFocusActive) {
                setIsFocusActive(false);
                console.log('⌨️ ESC pressed: Deactivating XY focus overlay');
            }
        };

        if (isFocusActive) {
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [isFocusActive]);

    // Registreer de focus handler bij de parent
    useEffect(() => {
        if (onRequestFocus && typeof onRequestFocus === 'function') {
            onRequestFocus(handleRequestFocus);
        }
    }, [onRequestFocus, handleRequestFocus]);
    const {width: windowWidth, height: windowHeight} = useWindowSize();
    const selectionCount = selectedLines.size;
    const sortedSelectedLines = useMemo(() => {
        return Array.from(selectedLines).sort((a, b) => a - b);
    }, [selectedLines]);

    const anchorLineIndex = useMemo(() => {
        return sortedSelectedLines.length > 0 ? sortedSelectedLines[0] : null;
    }, [sortedSelectedLines]);

    const isActive = useMemo(() => {
        if (moveMode === 'edit') return false;
        if (moveMode === 'poem') return true;
        if (moveMode === 'line') return selectionCount > 0;
        return false;
    }, [moveMode, selectionCount]);

    const currentPosition = useMemo(() => {
        if (moveMode === 'poem') {
            return {
                x: isDragging
                    ? Number(poemOffset.x.toFixed(3))
                    : Number(poemOffset.x.toFixed(1)),

                y: isDragging
                    ? Number(poemOffset.y.toFixed(3))
                    : Number(poemOffset.y.toFixed(1))

            };
        }
        if (moveMode === 'line' && anchorLineIndex !== null) {
            const override = lineOverrides[anchorLineIndex];
            return {
                x: Number((override?.xOffset || 0).toFixed(1)),
                y: Number((override?.yOffset || 0).toFixed(1)),
            };
        }
        return {x: 0, y: 0};
    }, [moveMode, poemOffset, lineOverrides, anchorLineIndex]);

    const handlePositionChange = useCallback((axis, newValue) => {
        if (moveMode === 'poem') {
            setPoemOffset(prev => ({...prev, [axis]: newValue}));
            return;
        }

        if (moveMode === 'line' && anchorLineIndex !== null) {
            const currentAnchorPos = lineOverrides[anchorLineIndex]?.[`${axis}Offset`] || 0;
            const delta = newValue - currentAnchorPos;

            setLineOverrides(prev => {
                const newOverrides = {...prev};
                sortedSelectedLines.forEach(lineIndex => {
                    const currentOffset = prev[lineIndex]?.[`${axis}Offset`] || 0;
                    newOverrides[lineIndex] = {
                        ...newOverrides[lineIndex],
                        [`${axis}Offset`]: currentOffset + delta,
                    };
                });
                return newOverrides;
            });
        }
    }, [moveMode, anchorLineIndex, lineOverrides, setPoemOffset, setLineOverrides, sortedSelectedLines]);

    const handleXChange = (e) => handlePositionChange('x', Number(parseFloat(e.target.value).toFixed(1)));
    const handleYChange = (e) => handlePositionChange('y', Number(parseFloat(e.target.value).toFixed(1)));

    const handleReset = useCallback((axis) => {
        if (moveMode === 'poem') {
            if (axis) {
                setPoemOffset(prev => ({...prev, [axis]: 0}));
            } else {
                setPoemOffset({x: 0, y: 0});
            }
            return;
        }

        if (moveMode === 'line' && selectionCount > 0) {
            setLineOverrides(prev => {
                const newOverrides = {...prev};
                sortedSelectedLines.forEach(lineIndex => {
                    if (newOverrides[lineIndex]) {
                        if (axis) {
                            newOverrides[lineIndex][`${axis}Offset`] = 0;
                        } else {
                            newOverrides[lineIndex].xOffset = 0;
                            newOverrides[lineIndex].yOffset = 0;
                        }
                    } else if (!axis) {
                        newOverrides[lineIndex] = {xOffset: 0, yOffset: 0};
                    }
                });
                return newOverrides;
            });
        }
    }, [moveMode, selectionCount, sortedSelectedLines, setPoemOffset, setLineOverrides]);

    const handleResetX = () => handleReset('x');
    const handleResetY = () => handleReset('y');
    const handleResetBoth = () => handleReset(null);

    const statusText = useMemo(() => {
        if (moveMode === 'edit') {
            return "Position controls disabled in Edit mode";
        }
        if (moveMode === 'poem') {
            return `Move entire poem: x: ${currentPosition.x}, y: ${currentPosition.y}`;
        }
        if (moveMode === 'line') {
            if (selectionCount === 0) {
                return "⚠️ Select lines first to enable movement";
            }
            const anchorType = anchorLineIndex === -2 ? 'Title' : anchorLineIndex === -1 ? 'Author' : `Line ${anchorLineIndex + 1}`;
            return `Move ${selectionCount} item(s) (Anchor: ${anchorType}): x: ${currentPosition.x}, y: ${currentPosition.y}`;
        }
        return "";
    }, [moveMode, selectionCount, currentPosition, anchorLineIndex]);

    return (
        <>
            {/* Globale cursor overlay - alleen zichtbaar bij focus active */}
            {isFocusActive && (
                <div
                    ref={overlayRef}
                    className={styles.globalCursorOverlay}
                    data-testid="cursor-overlay"
                />
            )}

            {isVisible && (
                <div
                    ref={containerRef}
                    className={`${styles.xyMoveContainer} ${isFocusActive ? styles.focusActive : ''}`}
                    data-testid="xy-move-container"
                    tabIndex={0}
                    anchor="xy-sliders-anchor"
                    popover="manual"
                >
                    <div className={styles.titleContainer}>
                        <div className={styles.moveLabel}>Position</div>
                        <button
                            className={styles.moveButton}
                            onClick={() => setIsVisible(prev => !prev)}
                        >
                            {isVisible ? 'Hide/Show (alt-h)' : 'Show (alt-h)'}
                        </button>
                    </div>

                    <div className={styles.status}>{statusText}</div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            X: <span className={styles.value}>{currentPosition.x}px
                        </span>
                        </label>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min={`-${calculateRange(windowWidth, 1920, 900)}`}
                                max={`${calculateRange(windowWidth, 1920, 900)}`}
                                step="0.1"
                                value={currentPosition.x}
                                onChange={handleXChange}
                                disabled={!isActive}
                                className={styles.slider}
                            />
                            <span>
                                {isDragging
                                    ? Number(currentPosition.x.toFixed(3))
                                    : currentPosition.x}
                            </span>
                            <button
                                type="button"
                                onClick={handleResetX}
                                disabled={!isActive}
                                className={styles.resetButton}
                                title="Reset X to center"
                            >
                                0
                            </button>
                        </div>
                    </div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            Y: <span className={styles.value}>{currentPosition.y}px</span>
                        </label>
                        <div className={styles.sliderContainer}>
                            <input
                                type="range"
                                min={`-${calculateRange(windowHeight, 1080, 610)}`}
                                max={`${calculateRange(windowHeight, 1080, 610)}`}
                                step="0.1"
                                value={currentPosition.y}
                                onChange={handleYChange}
                                disabled={!isActive}
                                className={styles.slider}
                            />
                            <span>
                                {isDragging
                                    ? Number(currentPosition.y.toFixed(3))
                                    : currentPosition.y}
                            </span>
                            <button
                                type="button"
                                onClick={handleResetY}
                                disabled={!isActive}
                                className={styles.resetButton}
                                title="Reset Y to center"
                            >
                                0
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetBoth}
                        disabled={!isActive}
                        className={styles.resetBothButton}
                        title="Reset both X and Y to center"
                    >
                        Reset to Center
                    </button>
                </div>
            )}
        </>
    );
}

function calculateRange(currentSize, baseSize, baseRange) {
    if (!currentSize || !baseSize || !baseRange) {
        return baseRange;
    }
    const scale = currentSize / baseSize;
    return Math.round(baseRange * scale);
}
