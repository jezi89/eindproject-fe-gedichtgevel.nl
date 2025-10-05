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
  OPTIMIZATION_ENABLED: 'canvas_optimization_enabled',
  // New persistent keys for sticky state
  POEM_OFFSET: 'canvas_poem_offset',
  FONT_SIZE: 'canvas_font_size',
  FILL_COLOR: 'canvas_fill_color',
  LETTER_SPACING: 'canvas_letter_spacing',
  LINE_HEIGHT: 'canvas_line_height',
  LINE_HEIGHT_MULTIPLIER: 'canvas_line_height_multiplier',
  TEXT_ALIGN: 'canvas_text_align',
  FONT_WEIGHT: 'canvas_font_weight',
  FONT_STYLE: 'canvas_font_style',
  TITLE_COLOR_OVERRIDE: 'canvas_title_color_override',
  AUTHOR_COLOR_OVERRIDE: 'canvas_author_color_override',
  MOVE_MODE: 'canvas_move_mode',
  SKEW_X: 'canvas_skew_x',
  SKEW_Y: 'canvas_skew_y'
};

/**
 * Clear all persisted canvas state (except camera position)
 * Used when loading a saved design to ensure destructive override
 */
export function clearAllPersistedState() {
  Object.values(PERSISTED_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear ${key}:`, error);
    }
  });
  console.log('🧹 Cleared all persisted canvas state from localStorage');
}

/**
 * Get overview of current persisted state for debugging
 */