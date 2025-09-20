// src/hooks/canvas/useFontManager.js
import { useState, useCallback } from "react";

// De lijst met lettertypen die we in de UI willen tonen.
const availableFonts = [
  { name: "Cormorant Garamond", value: "Cormorant Garamond" }, // Let op: voor CSS is de naam zonder '+'
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

export function useFontManager() {
  const [fontStatus, setFontStatus] = useState({
    "Cormorant Garamond": "loaded", // Ons initiële lettertype
  });

  const loadFont = useCallback(
    (fontName) => {
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

      // 3. Maak een nieuw <link> element aan.
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = `https://fonts.googleapis.com/css2?family=${fontApiValues[fontName]}&display=swap`;

      // 4. Voeg event listeners toe om te weten wanneer het laden klaar (of mislukt) is.
      link.onload = () => {
        console.log(`Font "${fontName}" succesvol geladen.`);
        setFontStatus((prevStatus) => ({
          ...prevStatus,
          [fontName]: "loaded",
        }));
      };
      link.onerror = () => {
        console.error(`Fout bij het laden van font: "${fontName}"`);
        setFontStatus((prevStatus) => ({ ...prevStatus, [fontName]: "error" }));
      };

      // 5. Voeg het <link> element toe aan de <head> van de pagina. Dit start de download.
      document.head.appendChild(link);
    },
    [fontStatus]
  ); // Deze functie wordt alleen opnieuw gemaakt als fontStatus verandert.

  return { availableFonts, fontStatus, loadFont };
}
