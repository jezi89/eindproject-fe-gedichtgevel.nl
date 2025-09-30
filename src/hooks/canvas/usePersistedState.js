// src/hooks/canvas/usePersistedState.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Simple localStorage-backed state hook
 * Only persists non-camera/positioning state
 */
export function usePersistedState(key, defaultValue, options = {}) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  // Initialize state from localStorage or default
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load persisted state for ${key}:`, error);
      return defaultValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Failed to persist state for ${key}:`, error);
    }
  }, [key, state, serialize]);

  // Clear function for resetting
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Failed to clear persisted state for ${key}:`, error);
    }
  }, [key, defaultValue]);

  return [state, setState, clearPersistedState];
}

/**
 * Persisted state keys - centralized for consistency
 */
export const PERSISTED_KEYS = {
  BACKGROUND_IMAGE: 'canvas_background_image',
  TEXT_STYLES: 'canvas_text_styles',
  LINE_OVERRIDES: 'canvas_line_overrides',
  FONT_FAMILY: 'canvas_font_family',
  SEARCH_CONTEXT: 'canvas_search_context',
  OPTIMIZATION_ENABLED: 'canvas_optimization_enabled'
};

/**
 * Clear all persisted canvas state (except camera position)
 */
// UNUSED: export function clearAllPersistedState() {
//   Object.values(PERSISTED_KEYS).forEach(key => {
//     try {
//       localStorage.removeItem(key);
//     } catch (error) {
//       console.warn(`Failed to clear ${key}:`, error);
//     }
//   });
// }

/**
 * Get overview of current persisted state for debugging
 */
// UNUSED: export function getPersistedStateOverview() {
//   const overview = {};
//   Object.entries(PERSISTED_KEYS).forEach(([name, key]) => {
//     try {
//       const value = localStorage.getItem(key);
//       overview[name] = value ? 'SET' : 'EMPTY';
//     } catch (error) {
//       overview[name] = 'ERROR';
//     }
//   });
//   return overview;
// }
