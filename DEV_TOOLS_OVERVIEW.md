# Developer Tools & Scripts Overview

Dit document bevat een overzicht van de geavanceerde development tools en scripts die zijn gebruikt tijdens de ontwikkeling van **gedichtgevel.nl**. Voor de netheid van de eindinlevering zijn deze verwijderd uit `package.json`, maar ze geven inzicht in het professionele ontwikkelproces.

## 🛠️ Verwijderde Development Dependencies

Deze tools werden gebruikt voor code-kwaliteit analyse en onderhoud, maar zijn niet nodig om de applicatie te draaien.

| Package | Doel |
|---------|------|
| **Knip** (`knip`) | Analyseerde de code op ongebruikte exports, bestanden en dependencies om het project schoon te houden. |
| **Find Unused Sass Variables** (`find-unused-sass-variables`) | Hielp bij het opschonen van unused SCSS variabelen in het design system. |

## 📜 Verwijderde Scripts

Deze custom scripts werden gebruikt voor specifieke onderhoudstaken en migraties.

### Code Quality Tools
*   `npm run knip`: Voert de Knip analyse uit.
*   `npm run styles:report-unused-vars`: Checkt alle SCSS bestanden op ongebruikte variabelen.

### Styles System Migratie (PowerShell)
Tijdens de refactoring naar een centraal Design System zijn deze scripts gebruikt om SCSS automatisch om te zetten:
*   `styles:migrate-imports`: Node.js script om oude `@import` syntax naar `@use` te migreren.
*   `styles:convert:preview`: PowerShell script om te testen welke styles aangepast zouden worden.
*   `styles:convert`: Het daadwerkelijke migratie script dat hardcoded values verving door SCSS variabelen.

### Test Tooling
*   `npm run test:ui`: Opent de grafische interface van Vitest voor het visueel draaien van tests.
*   `npm run test:coverage:open`: Draait coverage rapport en opent dit direct in de browser.

> **Note:** De essentiële scripts voor `dev`, `build`, `preview` en `lint` zijn behouden. De test-scripts zijn verwijderd voor de eindschoonmaak.
