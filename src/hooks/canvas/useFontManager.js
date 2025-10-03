// src/hooks/canvas/useFontManager.js
import { useState, useCallback } from "react";

// De lijst met lettertypen die we in de UI willen tonen.
const availableFonts = [
  { name: "Cormorant Garamond", value: "Cormorant Garamond" },
  { name: "Roboto", value: "Roboto" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
];

// Een helper map voor de Google Fonts API URL's
const fontApiValues = {
  "Cormorant Garamond": "Cormorant+Garamond:wght@400;700",
  Roboto: "Roboto:wght@400;700",
  Lato: "Lato:wght@400;700",
  Montserrat: "Montserrat:wght@400;700",
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
        console.log(`Font "${fontName}" is al geladen of wordt geladen.`);
        return;
      }

      // 2. Update de state om aan te geven dat we beginnen met laden.
      setFontStatus((prevStatus) => ({ ...prevStatus, [fontName]: "loading" }));
      console.log(`Start met laden van font: "${fontName}"`);

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

        console.log(`Font "${fontName}" volledig geladen en klaar voor gebruik.`);
        setFontStatus((prevStatus) => ({
          ...prevStatus,
          [fontName]: "loaded",
        }));
      } catch (error) {
        console.error(`Fout bij het laden van font: "${fontName}"`, error);
        setFontStatus((prevStatus) => ({ ...prevStatus, [fontName]: "error" }));
      }
    },
    [fontStatus]
  );

  return { availableFonts, fontStatus, loadFont };
}
