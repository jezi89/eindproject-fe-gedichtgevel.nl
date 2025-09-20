// src/hooks/canvas/useDraggable.js
import { useRef, useEffect, useCallback } from "react";
import { useApplication } from "@pixi/react";

export function useDraggable(target, { onDragStart, onDragMove, onDragEnd, enabled = true }) {
  const app = useApplication();
  const dragData = useRef(null); // Houdt de staat van het slepen bij

  const handlePointerDown = useCallback(
    (event) => {
      // Ctrl/Cmd check - let viewport handle
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      // Voorkom dat andere events (zoals viewport drag) worden getriggerd
      event.stopPropagation();

      // Sla de startpositie en het doelobject op
      dragData.current = {
        target: event.currentTarget,
        startPosition: event.data.getLocalPosition(event.currentTarget.parent),
        isDragging: true,
      };

      if (onDragStart) {
        onDragStart(event);
      }
    },
    [onDragStart]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (dragData.current?.isDragging) {
        const newPosition = event.data.getLocalPosition(
          dragData.current.target.parent
        );
        const offset = {
          x: newPosition.x - dragData.current.startPosition.x,
          y: newPosition.y - dragData.current.startPosition.y,
        };

        if (onDragMove) {
          onDragMove(offset, newPosition);
        }
      }
    },
    [onDragMove]
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (dragData.current?.isDragging) {
        dragData.current = null; // Reset de sleepstatus

        if (onDragEnd) {
          onDragEnd(event);
        }
      }
    },
    [onDragEnd]
  );

  useEffect(() => {
    const currentTarget = target?.current;
    
    // Betere null checks
    if (!currentTarget || !enabled || !app?.stage) {
      return; // Safe early return
    }
    
    // Verify currentTarget is PIXI object
    if (typeof currentTarget.on !== 'function') {
      console.warn('useDraggable: target is not a PIXI object', currentTarget);
      return;
    }

    // Debug logging for timing issues
    console.log('DEBUG useDraggable: Setting up drag for', currentTarget.constructor.name, 'enabled:', enabled);

    // Pixi.js v8 eventMode for better interaction
    currentTarget.eventMode = "dynamic"; // Better for moving objects
    currentTarget.cursor = "move";
    currentTarget.interactive = true;

    currentTarget.on("pointerdown", handlePointerDown);
    // We luisteren naar de 'global' move en up events op de stage
    // zodat het slepen doorgaat, zelfs als de muis het object verlaat.
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
  }, [
    target,
    app?.stage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    enabled, // Add enabled to dependencies
  ]);
}
