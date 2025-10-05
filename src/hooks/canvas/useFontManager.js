// src/hooks/canvas/useFontManager.js
import { useState, useCallback } from "react";

// De lijst met lettertypen die we in de UI willen tonen.
const availableFonts = [
    {
        label: "Klassieke Serif Lettertypes",
        fonts: [
            { label: 'Merriweather', value: 'Merriweather' },
            { label: 'Lora', value: 'Lora' },
            { label: 'Playfair Display', value: 'Playfair Display' },
            { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
            { label: 'EB Garamond', value: 'EB Garamond' },
            { label: 'Libre Baskerville', value: 'Libre Baskerville' },
            { label: 'Noto Serif', value: 'Noto Serif' },
            { label: 'PT Serif', value: 'PT Serif' },
            { label: 'Crimson Text', value: 'Crimson Text' },
            { label: 'Vollkorn', value: 'Vollkorn' },
        ]
    },
    {
        label: "Moderne Sans-Serif Lettertypes",
        fonts: [
            { label: 'Lato', value: 'Lato' },
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Raleway', value: 'Raleway' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Source Sans Pro', value: 'Source Sans Pro' },
            { label: 'Nunito', value: 'Nunito' },
            { label: 'Work Sans', value: 'Work Sans' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Oswald', value: 'Oswald' },
        ]
    },
    {
        label: "Robuuste Slab Serif Lettertypes",
        fonts: [
            { label: 'Arvo', value: 'Arvo' },
            { label: 'Roboto Slab', value: 'Roboto Slab' },
            { label: 'Zilla Slab', value: 'Zilla Slab' },
            { label: 'Bitter', value: 'Bitter' },
            { label: 'Crete Round', value: 'Crete Round' },
            { label: 'Patua One', value: 'Patua One' },
            { label: 'Ultra', value: 'Ultra' },
            { label: 'Josefin Slab', value: 'Josefin Slab' },
            { label: 'Enriqueta', value: 'Enriqueta' },
            { label: 'Antic Slab', value: 'Antic Slab' },
        ]
    },
    {
        label: "Display & Karakteristieke Lettertypes",
        fonts: [
            { label: 'Lobster', value: 'Lobster' },
            { label: 'Abril Fatface', value: 'Abril Fatface' },
            { label: 'Anton', value: 'Anton' },
            { label: 'Bebas Neue', value: 'Bebas Neue' },
            { label: 'Alfa Slab One', value: 'Alfa Slab One' },
            { label: 'Special Elite', value: 'Special Elite' },
            { label: 'Uncial Antiqua', value: 'Uncial Antiqua' },
            { label: 'Cinzel', value: 'Cinzel' },
            { label: 'Sacramento', value: 'Sacramento' },
            { label: 'Pacifico', value: 'Pacifico' },
        ]
    },
    {
        label: "Monospace Lettertypes",
        fonts: [
            { label: 'Inconsolata', value: 'Inconsolata' },
            { label: 'Source Code Pro', value: 'Source Code Pro' },
            { label: 'Space Mono', value: 'Space Mono' },
            { label: 'Anonymous Pro', value: 'Anonymous Pro' },
            { label: 'Cutive Mono', value: 'Cutive Mono' },
        ]
    },
    {
        label: "Extra's",
        fonts: [
            { label: 'Quilty', value: 'Quilty' },
            { label: 'Arial', value: 'Arial' },
            { label: 'Verdana', value: 'Verdana' },
            { label: 'Georgia', value: 'Georgia' },
            { label: 'Times New Roman', value: 'Times New Roman' },
        ]
    }
];

// Een helper map voor de Google Fonts API URL's
const fontApiValues = {
    'Merriweather': 'Merriweather:wght@400;700',
    'Lora': 'Lora:wght@400;700',
    'Playfair Display': 'Playfair+Display:wght@400;700',
    'Cormorant Garamond': 'Cormorant+Garamond:wght@400;700',
    'EB Garamond': 'EB+Garamond:wght@400;700',
    'Libre Baskerville': 'Libre+Baskerville:wght@400;700',
    'Noto Serif': 'Noto+Serif:wght@400;700',
    'PT Serif': 'PT+Serif:wght@400;700',
    'Crimson Text': 'Crimson+Text:wght@400;700',
    'Vollkorn': 'Vollkorn:wght@400;700',
    'Lato': 'Lato:wght@400;700',
    'Montserrat': 'Montserrat:wght@400;700',
    'Raleway': 'Raleway:wght@400;700',
    'Roboto': 'Roboto:wght@400;700',
    'Open Sans': 'Open+Sans:wght@400;700',
    'Source Sans Pro': 'Source+Sans+Pro:wght@400;700',
    'Nunito': 'Nunito:wght@400;700',
    'Work Sans': 'Work+Sans:wght@400;700',
    'Poppins': 'Poppins:wght@400;700',
    'Oswald': 'Oswald:wght@400;700',
    'Arvo': 'Arvo:wght@400;700',
    'Roboto Slab': 'Roboto+Slab:wght@400;700',
    'Zilla Slab': 'Zilla+Slab:wght@400;700',
    'Bitter': 'Bitter:wght@400;700',
    'Crete Round': 'Crete+Round:wght@400;700',
    'Patua One': 'Patua+One:wght@400;700',
    'Ultra': 'Ultra:wght@400;700',
    'Josefin Slab': 'Josefin+Slab:wght@400;700',
    'Enriqueta': 'Enriqueta:wght@400;700',
    'Antic Slab': 'Antic+Slab:wght@400;700',
    'Lobster': 'Lobster:wght@400;700',
    'Abril Fatface': 'Abril+Fatface:wght@400;700',
    'Anton': 'Anton:wght@400;700',
    'Bebas Neue': 'Bebas+Neue:wght@400;700',
    'Alfa Slab One': 'Alfa+Slab+One:wght@400;700',
    'Special Elite': 'Special+Elite:wght@400;700',
    'Uncial Antiqua': 'Uncial+Antiqua:wght@400;700',
    'Cinzel': 'Cinzel:wght@400;700',
    'Sacramento': 'Sacramento:wght@400;700',
    'Pacifico': 'Pacifico:wght@400;700',
    'Inconsolata': 'Inconsolata:wght@400;700',
    'Source Code Pro': 'Source+Code+Pro:wght@400;700',
    'Space Mono': 'Space+Mono:wght@400;700',
    'Anonymous Pro': 'Anonymous+Pro:wght@400;700',
    'Cutive Mono': 'Cutive+Mono:wght@400;700',
    // Quilty, Arial, Verdana, Georgia, Times New Roman are not Google Fonts
};

// Cache for loaded font link elements to prevent duplicate loads
const loadedFontLinks = new Set();

export function useFontManager() {
  const [fontStatus, setFontStatus] = useState({
    "Cormorant Garamond": "loaded", // Ons initiële lettertype
  });

  const loadFont = useCallback(
    async (fontName) => {
      // 1. Check of we deze actie moeten negeren.
      if (
        !fontName ||
        fontStatus[fontName] === "loading" ||
        fontStatus[fontName] === "loaded"
      ) {

        return;
      }

      // 2. Update de state om aan te geven dat we beginnen met laden.
      setFontStatus((prevStatus) => ({ ...prevStatus, [fontName]: "loading" }));

      try {
        // 3. Add Google Fonts CSS if not already present
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontApiValues[fontName]}&display=swap`;

        if (!loadedFontLinks.has(fontUrl)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = fontUrl;
          document.head.appendChild(link);
          loadedFontLinks.add(fontUrl);

          // Wait for CSS to be loaded
          await new Promise((resolve, reject) => {
            link.onload = resolve;
            link.onerror = reject;
            // Timeout after 5 seconds
            setTimeout(reject, 5000);
          });
        }

        // 4. Use Font Loading API to ensure font is actually downloaded and ready
        // Load both weights that we use (400 and 700)
        await Promise.all([
          document.fonts.load(`400 16px "${fontName}"`),
          document.fonts.load(`700 16px "${fontName}"`)
        ]);

        setFontStatus((prevStatus) => ({
          ...prevStatus,
          [fontName]: "loaded",
        }));
      } catch (error) {

        setFontStatus((prevStatus) => ({ ...prevStatus, [fontName]: "error" }));
      }
    },
    [fontStatus]
  );

  return { availableFonts, fontStatus, loadFont };
}
