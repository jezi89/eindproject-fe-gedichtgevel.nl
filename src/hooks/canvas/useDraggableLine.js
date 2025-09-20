// src/hooks/canvas/useDraggableLine.js
import { useRef, useEffect, useCallback } from "react";
import { useApplication } from "@pixi/react";

/**
 * Custom hook for making individual poem lines draggable in line mode
 * Only active when enabled AND the line is selected
 * Designed to work with Pixi.js v8 event system
 */
export function useDraggableLine(target, { onDragStart, onDragMove, onDragEnd, enabled = false }) {
  const app = useApplication();
  const dragData = useRef(null);

  const handlePointerDown = useCallback((event) => {
    // Ctrl/Cmd check - let viewport handle
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    
    // Stop propagation to prevent viewport drag
    event.stopPropagation();
    
    dragData.current = {
      target: event.currentTarget,
      startPosition: event.data.getLocalPosition(event.currentTarget.parent),
      isDragging: true,
    };

    if (onDragStart) {
      onDragStart(event);
    }
  }, [onDragStart]);

  const handlePointerMove = useCallback((event) => {
    if (dragData.current?.isDragging) {
      const newPosition = event.data.getLocalPosition(dragData.current.target.parent);
      const offset = {
        x: newPosition.x - dragData.current.startPosition.x,
        y: newPosition.y - dragData.current.startPosition.y,
      };

      if (onDragMove) {
        onDragMove(offset, newPosition);
      }
    }
  }, [onDragMove]);

  const handlePointerUp = useCallback((event) => {
    if (dragData.current?.isDragging) {
      dragData.current = null;
      if (onDragEnd) {
        onDragEnd(event);
      }
    }
  }, [onDragEnd]);

  useEffect(() => {
    const currentTarget = target?.current;
    
    // Better null checks
    if (!currentTarget || !enabled || !app?.stage) {
      return; // Safe early return
    }
    
    // Verify currentTarget is PIXI object
    if (typeof currentTarget.on !== 'function') {
      console.warn('useDraggableLine: target is not a PIXI object', currentTarget);
      return;
    }

    // Debug logging for timing issues
    console.log('DEBUG useDraggableLine: Setting up drag for', currentTarget.constructor.name, 'enabled:', enabled);

    // Pixi.js v8 eventMode for dragging
    currentTarget.eventMode = "dynamic";
    currentTarget.cursor = "move";
    currentTarget.interactive = true;

    // Add event listeners
    currentTarget.on("pointerdown", handlePointerDown);
    app.stage.on("pointermove", handlePointerMove);
    app.stage.on("pointerup", handlePointerUp);
    app.stage.on("pointerupoutside", handlePointerUp);

    return () => {
      if (currentTarget && typeof currentTarget.off === 'function') {
        currentTarget.off("pointerdown", handlePointerDown);
      }
      if (app?.stage && typeof app.stage.off === 'function') {
        app.stage.off("pointermove", handlePointerMove);
        app.stage.off("pointerup", handlePointerUp);
        app.stage.off("pointerupoutside", handlePointerUp);
      }
    };
  }, [target, app?.stage, handlePointerDown, handlePointerMove, handlePointerUp, enabled]);
}
