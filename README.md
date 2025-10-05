# Installatiehandleiding - gedichtgevel.nl

## Inhoudsopgave
- [Inleiding](#inleiding)
- [Screenshot](#screenshot)
- [Benodigdheden](#benodigdheden)
- [Installatie](#installatie)
- [De applicatie draaien](#de-applicatie-draaien)
- [Overige commando's](#overige-commando's)
- [Testgebruikers](#testgebruikers)
- [Gebruikersprivileges](#gebruikersprivileges)
- [Canvas Sneltoetsen](#canvas-sneltoetsen)
- [Technische Details](#technische-details)
- [Deployment](#deployment)

---

## Inleiding

**gedichtgevel.nl** is een interactieve React 19 webapplicatie waarmee gebruikers gedichten kunnen visualiseren en beluisteren. De applicatie combineert poëzie uit verschillende bronnen (PoetryDB API en straatpoëzie.nl database) met:

- **Designgevel** - Interactieve canvas editor om gedichten op gevelachtergronden te plaatsen (Pixi.js)
- **Spreekgevel** - Audio-opnamefunctionaliteit met waveform visualisatie (WaveSurfer.js)
- **Collectiegevel** - Persoonlijke verzamelingen en favorieten
- **Account Management** - Gebruikersprofielen, statistieken en instellingen

### Inspiratie

Dit project is geïnspireerd door het **"Hardop" initiatief van Bab Gons**, waarbij poëzie toegankelijk wordt gemaakt in de publieke ruimte. Zie de ideefase documentatie in de `/docs` folder voor meer achtergrond.

⚠️ **Let op**: De straatgedichten in deze applicatie komen uit de straatpoezie.nl database en zijn vanwege auteursrechten niet volledig publiek beschikbaar. Deze feature is alleen zichtbaar via een easter egg (Alt+G op de homepage).

---

## Screenshot

![gedichtgevel.nl homepage](docs/screenshot-homepage.png)

*Screenshot van de homepage met zoekfunctionaliteit en straatgedichten van de dag*

---

## Benodigdheden

### Vereiste Software

1. **Node.js** versie 18.x of hoger
   Download: [https://nodejs.org/](https://nodejs.org/)

2. **pnpm** (Package Manager)
   Installatie via npm:
   ```bash
   npm install -g pnpm
   ```

   **Waarom pnpm?**
   Deze applicatie gebruikt pnpm als package manager vanwege:
   - Snellere installaties (hard-linked node_modules)
   - Efficiënter schijfgebruik (centrale opslag van packages)
   - Betere dependency resolution

   Voor examinatoren die niet bekend zijn met pnpm: alle `npm` commando's kunnen vervangen worden door `pnpm`. Bijvoorbeeld:
   - `npm install` → `pnpm install`
   - `npm run dev` → `pnpm run dev`

3. **Git** (optioneel, voor clonen van repository)
   Download: [https://git-scm.com/](https://git-scm.com/)

### API Sleutels & Omgevingsvariabelen

De applicatie maakt gebruik van de volgende externe diensten:

1. **Supabase** - Authenticatie, database en storage
   - Documentatie: [https://supabase.com/docs](https://supabase.com/docs)
   - Gratis tier beschikbaar

2. **PoetryDB API** - Publieke poëzie database (geen API key vereist)
   - Documentatie: [https://poetrydb.org/](https://poetrydb.org/)

3. **Flickr API** (optioneel) - Achtergrondafbeeldingen voor canvas
   - Documentatie: [https://www.flickr.com/services/api/](https://www.flickr.com/services/api/)

4. **Pexels API** (optioneel) - Alternatieve achtergrondafbeeldingen
   - Documentatie: [https://www.pexels.com/api/](https://www.pexels.com/api/)

---

## Installatie

### Stap 1: Project Downloaden

Clone de repository of pak de zip-file uit:

```bash
git clone <repository-url>
cd eindproject-fe-gedichtgevel.nl
```

### Stap 2: Dependencies Installeren

Installeer alle benodigde packages met pnpm:

```bash
pnpm install
```

**Verwachte output:**
pnpm zal alle dependencies installeren en een `pnpm-lock.yaml` file aanmaken.

**Mogelijke waarschuwingen:**
Peer dependency warnings kunnen genegeerd worden - deze zijn niet kritisch voor de functionaliteit.

### Stap 3: Omgevingsvariabelen Configureren

Maak een `.env` bestand aan in de project root met de volgende structuur:

```env
# Supabase Configuration (VERPLICHT)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optionele API sleutels (voor volledige functionaliteit)
VITE_FLICKR_API_KEY=your_flickr_api_key
VITE_PEXELS_API_KEY=your_pexels_api_key
```

**⚠️ BELANGRIJK voor Examinatoren:**

Voor het testen van deze applicatie zijn **test credentials** voorzien (zie sectie [Testgebruikers](#testgebruikers)). U hoeft geen eigen Supabase project aan te maken.

**Supabase Configuratie:**
De test credentials maken gebruik van een vooraf geconfigureerde Supabase instantie met:
- Email authenticatie (via Resend SMTP op gedichtgevel.nl domein)
- Database tabellen voor favorieten, statistieken en settings
- Storage bucket voor audio-opnames

---

## De applicatie draaien

### Development Server Starten

**Standaard poort (5173):**
```bash
pnpm run dev
```

De applicatie is dan beschikbaar op: `http://localhost:5173`

**Specifieke poort (bijv. 3000):**
```bash
pnpm run dev -- --port 3000
```

⚠️ **Belangrijke opmerking over Google OAuth:**
Google login is momenteel experimenteel en werkt **alleen op localhost:3000**. Voor volledige authenticatie functionaliteit gebruik de email/password login met de testgebruiker.

**Verwachte output:**
```
VITE v7.1.7  ready in X ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Applicatie Testen

Na het starten van de dev server:

1. Open `http://localhost:5173` in uw browser
2. De homepage toont een zoekbalk voor gedichten
3. U kunt direct zoeken zonder in te loggen
4. Log in met de testgebruiker voor volledige functionaliteit

### Platform-specifieke Instructies

**Windows:**
```bash
pnpm run dev
```

**macOS/Linux:**
```bash
pnpm run dev
```

**Met specifieke host (netwerk toegang):**
```bash
pnpm run dev -- --host
```
Dit maakt de applicatie toegankelijk via uw lokale netwerk IP-adres.

### Production Build Testen

**Build maken:**
```bash
pnpm run build
```

**Preview van production build:**
```bash
pnpm run preview
```

De production build wordt aangemaakt in de `/dist` folder.

---

## Overige commando's

### Linting & Code Kwaliteit

**JavaScript linting:**
```bash
pnpm run lint
```

**CSS/SCSS linting:**
```bash
pnpm run lint:css
```

**CSS/SCSS linting met automatische fixes:**
```bash
pnpm run lint:css:fix
```

**CSS/SCSS linting met uitgebreid rapport:**
```bash
pnpm run lint:css:report
```

### Code Analyse

**Ongebruikte code detecteren (Knip):**
```bash
pnpm run knip
```

**Ongebruikte SCSS variabelen detecteren:**
```bash
pnpm run styles:report-unused-vars
```

### Styling Tools

**SCSS imports migreren:**
```bash
pnpm run styles:migrate-imports
```

**Design system conversie (preview):**
```bash
pnpm run styles:convert:preview
```

**Design system conversie (automatisch):**
```bash
pnpm run styles:convert
```

---

## Testgebruikers

Voor het testen van de applicatie zijn de volgende testaccounts beschikbaar:

### Primaire Testgebruiker

**Status:** Email bevestigd ✓

**Toegang tot:**
- Account pagina (in ontwikkeling)
- Favorieten toevoegen/verwijderen
- Canvas designs permanent opslaan
- Audio-opnames maken (max 10 minuten) en downloaden
- Flickr custom search functionaliteit
- Straatgedichten easter egg (Alt+G)

### Email Authenticatie

De applicatie gebruikt **Resend SMTP** met het `gedichtgevel.nl` domein (geregistreerd bij Hostinger) voor authenticatie emails:
- Bevestigingsmails worden verzonden vanaf `no-reply@gedichtgevel.nl`
- Email confirmatie vereist voor volledige accountfunctionaliteit
- De testgebruiker hierboven is al bevestigd

### Account Aanmaken (optioneel)

U kunt ook een nieuw account aanmaken:

1. Ga naar `/welkom` of `/login`
2. Klik op "Account aanmaken"
3. Vul email en wachtwoord in
4. Bevestig uw email via de link in de bevestigingsmail
5. Log in met uw nieuwe credentials

⚠️ **Let op:** Nieuwe accounts moeten eerst hun email bevestigen voordat volledige functionaliteit beschikbaar is.

---

## Gebruikersprivileges

### Anonieme Gebruikers

Zonder in te loggen kunnen gebruikers:
- ✅ Gedichten zoeken (PoetryDB API)
- ✅ Gedichten bekijken met volledige tekst
- ✅ Canvas designs maken (niet persistent - verloren bij refresh)
- ✅ Basis achtergrondafbeeldingen gebruiken
- ✅ Audio-opnames maken (**max 2 minuten**)
- ✅ Audio-opnames downloaden
- ✅ Collectie pagina bekijken (bewust publiek voor marketing)
- ❌ Geen favorieten opslaan
- ❌ Geen designs permanent opslaan
- ❌ Geen uitgebreide Flickr search

**Marketing Strategie:**
De collectie pagina is bewust **niet** in een protected route geplaatst om:
- Marketing effect te hebben (preview van mogelijkheden)
- In de toekomst anonieme gebruikers met beperkte functionaliteit toe te laten

### Geauthenticeerde Gebruikers

Na inloggen krijgen gebruikers toegang tot:

#### 🎨 Canvas Design Opslaan
- Designs permanent opslaan
- Eerder gemaakte designs laden en bewerken
- Designs exporteren als afbeeldingen
- **Alleen beschikbaar voor ingelogde gebruikers**

#### 🔍 Flickr Custom Search
- Uitgebreide zoekopties voor achtergrondafbeeldingen
- Toegang tot premium Flickr content
- Metadata en licentie-informatie

#### 👤 Account Pagina (in ontwikkeling)
- Profielinstellingen
- Weergavenaam aanpassen
- Email notificaties configureren
- Theme voorkeur (dark/light)
- Wachtwoord wijzigen
- Account verwijderen
- Data export (GDPR compliance)

#### ⭐ Favorieten Systeem
- Favoriete gedichten opslaan
- Favoriete auteurs bijhouden
- Verzamelingen beheren
- Statistieken bekijken:
  - Totaal aantal favorieten
  - Top gefavoriseerde auteurs
  - Recente activiteit
  - Maandelijkse activiteit (laatste 6 maanden)

#### 🎤 Audio-opnames (Uitgebreid)
- Gedichten opnemen met browser microphone (**max 10 minuten**)
- Waveform visualisatie tijdens opname
- Opnames uploaden naar Supabase Storage
- Opnames downloaden
- Eerder gemaakte opnames afspelen

**Audio Time Limits:**
- 🔓 **Anonieme gebruikers:** max 2 minuten opname
- 🔐 **Ingelogde gebruikers:** max 10 minuten opname

#### 🤫 Easter Egg: Straatgedichten
Druk **Alt+G** op de homepage om een speciale sectie te onthullen met **straatgedichten uit de straatpoezie.nl database**.

**Waarom een easter egg?**
Deze gedichten zijn vanwege auteursrechten niet volledig publiek en worden gebruikt om de functionaliteit te demonstreren zonder juridische complicaties.

---

## Canvas Sneltoetsen

De canvas editor ondersteunt uitgebreide sneltoetsen voor efficiënt werken:

### Basis Navigatie
| Toets | Actie |
|-------|-------|
| **Space** | Schakel tussen Edit / Line / Poem mode |
| **Esc** | Terug naar Edit mode + selectie wissen |
| **R** | Reset camera naar centrum |

### Selectie Beheer
| Toets | Actie |
|-------|-------|
| **Alt+A** | Selecteer alle gedichtsregels |
| **Alt+Shift+A** | Selecteer alles (incl. titel en auteur) |

### XY Positie Sliders
| Toets | Actie |
|-------|-------|
| **Alt+H** | Toggle XY sliders zichtbaarheid |
| **Alt+J** | Focus XY sliders + 5s hover freeze |

### Visuele Effecten
| Toets | Actie |
|-------|-------|
| **Alt+Y** | Toggle highlight zichtbaarheid |

### Camera Besturing (Pixi.js Viewport)
- **Muiswiel** - Zoom in/uit
- **Slepen** - Pan over canvas
- **Ctrl+Slepen** - Selecteer meerdere elementen

**💡 Tip:** Druk **Alt+J** om de XY sliders te focussen - dit activeert ook een 5-seconden "hover freeze" zodat de controls niet verdwijnen tijdens gebruik.

---

## Technische Details

### Build Tool & Bundler

De applicatie gebruikt **Vite 7.1.7** als moderne build tool en bundler:
- ⚡ Snelle Hot Module Replacement (HMR) tijdens development
- 📦 Geoptimaliseerde production builds met Rollup
- 🔧 ESBuild voor snelle transpilatie

**Belangrijke Breaking Changes:**
- Vite 7 vereist Node.js 18+
- React Router 7 gebruikt Library Mode (Framework Mode niet geïmplementeerd)
- SCSS modules gebruiken nieuwe import syntax

### Vite Configuratie Highlights

**Plugins:**
- `@vitejs/plugin-react` - React Fast Refresh support
- `vite-plugin-svgr` - SVG imports als React componenten

**Path Aliases:**
```javascript
'@' → './src'
'@styles' → './src/styles'
```

**Optimalisaties:**
- PIXI.js devtools alleen in development mode
- LEGACY directory uitgesloten van production build
- Custom Rollup configuratie voor externe dependencies

**SVGR Configuratie:**
SVG's kunnen geïmporteerd worden als React componenten:
```jsx
import { ReactComponent as Logo } from './logo.svg';
```

### State Management

- **Server State:** TanStack Query v5 voor API caching, synchronisatie en data persistence
- **Global State:** React Context (AuthProvider)
- **Local State:** React hooks (useState, useReducer)
- **Persistence:**
  - Poem search results → TanStack Query cache (memory + localStorage)
  - Canvas designs → TanStack Query met Supabase backend
  - User data → Supabase (PostgreSQL)
  - UI preferences → localStorage

### Performance Optimalisaties

- TanStack Query request deduplication en intelligent caching
- Debounced search input (300ms)
- Direct DOM updates voor recording timer (geen React re-renders)
- Lazy loading voor pagina componenten
- SCSS modules voor scoped styling
- Persistent query cache voor offline support

### Browser Compatibiliteit

**Minimale vereisten:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Vereiste Web APIs:**
- MediaRecorder API (voor audio-opnames)
- LocalStorage (voor TanStack Query persistence)
- WebGL (voor Pixi.js canvas rendering)

---

## Deployment

### Live Applicatie

De applicatie is live beschikbaar op:
**[https://gedichtgevel.nl](https://gedichtgevel.nl)**

**Hosting & Deployment:**
- 🚀 **Deployment Platform:** Vercel
- 🌐 **Domain Registratie:** Hostinger
- 📧 **Email Service:** Resend SMTP (no-reply@gedichtgevel.nl)

**Deployment Workflow:**
1. Code push naar `main` branch
2. Automatische Vercel build pipeline
3. Preview deployments voor pull requests
4. Production deployment bij merge naar main

### Omgevingsvariabelen in Vercel

De volgende environment variables zijn geconfigureerd in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FLICKR_API_KEY` (optioneel)
- `VITE_PEXELS_API_KEY` (optioneel)

---

## Toekomstige Features

De applicatie is ontworpen met uitbreidbaarheid in gedachten. Sommige UI elementen zijn al aanwezig maar krijgen later volledige functionaliteit:

- 📚 **Collecties CRUD** - Volledige collectie management
- 🔐 **Google OAuth** - Stabiele Google login integratie
- 👥 **Social Sharing** - Designs en opnames delen
- 📊 **Advanced Analytics** - Uitgebreide gebruikersstatistieken
- 🎨 **Canvas Templates** - Vooraf gemaakte design templates
- 🌍 **Internationalisatie** - Meertalige ondersteuning

---

## Ondersteuning

Voor vragen of problemen tijdens installatie:

1. Controleer of Node.js versie 18+ geïnstalleerd is: `node --version`
2. Controleer of pnpm correct geïnstalleerd is: `pnpm --version`
3. Verwijder `node_modules` en `pnpm-lock.yaml` en run `pnpm install` opnieuw
4. Controleer of `.env` bestand correct geconfigureerd is
5. Controleer browser console voor JavaScript errors

**Veelvoorkomende Problemen:**

**"Cannot find module" errors:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Port already in use:**
```bash
pnpm run dev -- --port 3001
```

**Supabase connection errors:**
- Controleer of `.env` variabelen correct zijn
- Controleer internetverbinding
- Verifieer Supabase project status

---

**Versie:** 1.0.0
**Laatste update:** Oktober 2025
**Auteur:** Eindproject Frontend Ontwikkeling NOVI

---
