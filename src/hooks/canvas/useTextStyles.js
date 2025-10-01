import { useMemo } from "react";
import * as PIXI from "pixi.js";

export function useTextStyles(fontLoaded, globalStyles, fontStatus) {
  return useMemo(() => {
    const baseFillColor = globalStyles?.fillColor || "white";
    const baseFontSize = globalStyles?.fontSize || 32;
    const baseLetterSpacing = globalStyles?.letterSpacing || 0;
    const baseFontWeight = globalStyles?.fontWeight || "normal";
    const baseFontStyle = globalStyles?.fontStyle || "normal";
    const resolution = globalStyles?.resolution || 1;
    const antialias = globalStyles?.antialias ?? true;  // <-- Default to true voor betere kwaliteit
    const roundPixels = globalStyles?.roundPixels ?? false; // <-- Default to false voor optimalisatie

    // PIXI.js handelt resolution scaling automatisch af - fontSize hoeft NIET aangepast te worden
    const effectiveFontSize = baseFontSize;
    const effectiveTitleFontSize = 48;
    const effectiveAuthorFontSize = 24;

    // Hierarchical color system: use override if exists, otherwise use global color
    const baseTitleColor = globalStyles?.effectiveTitleColor || baseFillColor;
    const baseAuthorColor = globalStyles?.effectiveAuthorColor || baseFillColor;
    const requestedFont = globalStyles?.fontFamily || "Cormorant Garamond";
    const currentGlobalFont = globalStyles?.fontFamily || "Cormorant Garamond"; // EERST DEFINIËREN

    const fontFamily =
      fontStatus[requestedFont] === "loaded"
        ? requestedFont
        : currentGlobalFont;

    const requestedTitleFont = globalStyles?.effectiveTitleFont || fontFamily;
    const titleFont =
      fontStatus[requestedTitleFont] === "loaded"
        ? requestedTitleFont
        : fontFamily;

    // Bepaal de effectieve auteur-font met fallback naar de globale font
    const requestedAuthorFont = globalStyles?.effectiveAuthorFont || fontFamily;
    const authorFont =
      fontStatus[requestedAuthorFont] === "loaded"
        ? requestedAuthorFont
        : fontFamily;

    if (!fontLoaded) {
      return {
        titleStyle: new PIXI.TextStyle({
          fill: baseTitleColor,
          fontSize: effectiveTitleFontSize,
          fontFamily: "Arial",
          fontWeight: "bold",
          antialias: antialias,
          roundPixels: roundPixels,
        }),
        authorStyle: new PIXI.TextStyle({
          fill: baseAuthorColor,
          fontSize: effectiveAuthorFontSize,
          fontFamily: "Arial",
          fontStyle: "italic",
          antialias: antialias,
          roundPixels: roundPixels,
        }),
        lineStyle: new PIXI.TextStyle({
          fill: baseFillColor,
          fontSize: effectiveFontSize,
          fontFamily: "Arial",
          lineHeight: effectiveFontSize + 12,
          letterSpacing: baseLetterSpacing,
          fontWeight: baseFontWeight,
          fontStyle: baseFontStyle,
          antialias: antialias,
          roundPixels: roundPixels,
        }),
      };
    }

    const titleStyleConfig = {
      fill: baseTitleColor,
      fontSize: effectiveTitleFontSize,
      fontFamily: titleFont,
      fontWeight: "bold",
      antialias: antialias,
      roundPixels: roundPixels,
    };

    return {
      titleStyle: new PIXI.TextStyle(titleStyleConfig),
      authorStyle: new PIXI.TextStyle({
        fill: baseAuthorColor,
        fontSize: effectiveAuthorFontSize,
        fontFamily: authorFont,
        fontStyle: "italic",
        antialias: antialias,
        roundPixels: roundPixels,
      }),
      lineStyle: new PIXI.TextStyle({
        fill: baseFillColor,
        fontSize: effectiveFontSize,
        fontFamily: fontFamily,
        lineHeight: effectiveFontSize + 12,
        letterSpacing: baseLetterSpacing,
        fontWeight: baseFontWeight,
        fontStyle: baseFontStyle,
        antialias: antialias,
        roundPixels: roundPixels,
      }),
    };
  }, [fontLoaded, globalStyles, fontStatus]);
}

// New hook for creating individual line styles with overrides
export function useLineStyle(
  baseStyle,
  lineOverrides,
  isSelected,
  isColorPickerActive = false,
  fontStatus, // <-- Nieuw argument
  fallbackFontFamily, // <-- Nieuw argument
  highlightVisible = true // <-- NEW: Toggle for highlight visibility
) {
  return useMemo(() => {
    if (!baseStyle) return null;

    // Start with base style properties
    const styleProps = {
      fill: baseStyle.fill,
      fontSize: baseStyle.fontSize,
      fontFamily: baseStyle.fontFamily,
      lineHeight: baseStyle.lineHeight,
      letterSpacing: baseStyle.letterSpacing,
      fontWeight: baseStyle.fontWeight,
      fontStyle: baseStyle.fontStyle,
      antialias: baseStyle.antialias ?? true,
      roundPixels: baseStyle.roundPixels ?? false,
    };

    // Check if line has color override
    const hasColorOverride = lineOverrides?.fillColor;

    // Apply selection styling ONLY if color picker is not active AND highlight is visible
    if (isSelected && !isColorPickerActive && highlightVisible) {
      styleProps.stroke = "#ffff00"; // Yellow border for selection indicator
      styleProps.strokeThickness = 2; // Subtle border thickness

      // Apply yellow fill ONLY if no color override exists
      if (!hasColorOverride) {
        styleProps.fill = "#ffff00"; // Yellow selection color
      }
    }

    // Apply line-specific overrides
    if (lineOverrides) {
      if (lineOverrides.fillColor) styleProps.fill = lineOverrides.fillColor;
      if (lineOverrides.fontSize) {
        // PIXI.js handelt resolution scaling automatisch af - fontSize blijft hetzelfde
        styleProps.fontSize = lineOverrides.fontSize;
        styleProps.lineHeight = lineOverrides.fontSize + 12;
      }
      if (lineOverrides.letterSpacing) {
        styleProps.letterSpacing = lineOverrides.letterSpacing;
      }
      if (lineOverrides.fontWeight) {
        styleProps.fontWeight = lineOverrides.fontWeight;
      }
      if (lineOverrides.fontStyle) {
        styleProps.fontStyle = lineOverrides.fontStyle;
      }
      // DE FIX: Vervang de simpele override met de slimme fallback-logica
      if (lineOverrides.fontFamily) {
        const requestedFont = lineOverrides.fontFamily;
        // Gebruik de globalFont als fallback als de gevraagde niet geladen is
        styleProps.fontFamily =
          fontStatus[requestedFont] === "loaded"
            ? requestedFont
            : fallbackFontFamily;
      }
    }

    const requestedFont = lineOverrides?.fontFamily || fallbackFontFamily;
    const finalFontFamily =
      fontStatus[requestedFont] === "loaded"
        ? requestedFont
        : fallbackFontFamily;

    styleProps.fontFamily = finalFontFamily;

    // Pas de override alleen toe als deze bestaat, anders wordt de baseStyle al gebruikt.
    if (lineOverrides?.fontFamily) {
      styleProps.fontFamily = finalFontFamily;
    }

    return new PIXI.TextStyle(styleProps);
  }, [
    baseStyle,
    lineOverrides,
    isSelected,
    isColorPickerActive,
    fontStatus,
    fallbackFontFamily,
    highlightVisible,
  ]);
}
