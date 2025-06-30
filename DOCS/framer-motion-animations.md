# Framer Motion Animations Documentatie

Deze documentatie beschrijft alle actieve Framer Motion animaties in de applicatie met moderne Framer Motion syntax (v7+).

## Overzicht

De applicatie gebruikt Framer Motion voor verschillende animaties om de gebruikerservaring te verbeteren. Alle implementaties volgen moderne best practices voor performance en gebruiksvriendelijkheid.

### ⚡ Recente Updates - Spring Physics Implementatie

**Geïmplementeerde verbeteringen:**
- ✅ **PoemCard** omgezet naar `motion.div` met spring hover effecten
- ✅ **Expansion animaties** gebruik maken van natuurlijke spring physics
- ✅ **Verschillende parameters** voor expand vs collapse voor optimal UX
- ✅ **Spring presets** toegevoegd voor consistente animaties
- ✅ **Debug logging** voor development testing
- ✅ **WSL/WebStorm** testinstructies toegevoegd

**Verwachte resultaten:**
- Natuurlijke bounce effecten bij gedicht uitklappen
- Responsive hover animaties op cards en buttons  
- Zichtbare "overshoot" bij expand, snelle collapse
- Motion entries in Chrome DevTools Animation panel

## Animatie Inventaris

### 1. Gedicht Uitklap Animaties

#### Hoofdcontainer Expansie (`PoemResultItem.jsx`)

- **Locatie**: `/src/components/poem/PoemResultItem.jsx:191-217`
- **Doel**: Vloeiende uitklap van gedichtcontainers met spring physics
- **Implementatie**:
  ```javascript
  <motion.div
    animate={{
      height: isExpanded ? finalHeight : 0
    }}
    transition={{
      type: "spring",
      stiffness: isSmallPoemValue ? 400 : 300,
      damping: isSmallPoemValue ? 30 : 25,
      mass: 0.8,
      // Snellere respons voor collapse
      ...(animationPhase === 'collapsing' && {
        stiffness: 500,
        damping: 35
      })
    }}
  >
  ```

**Animatie Parameters** (Geoptimaliseerd voor natural spring feel):
- **Expand**: Stiffness 220-280, Damping 15-18, Mass 0.9
- **Collapse**: Stiffness 400-450, Damping 28-30, Mass 0.6  
- **Velocity**: -50 voor collapse (snellere start)
- **Kleine gedichten**: Hogere stiffness voor snellere response

**Testen**:
1. Open een zoekresultaat met meer dan 4 regels
2. Klik op "Lees meer" - animatie moet een natuurlijk veereffect hebben
3. Klik op "Inklappen" - animatie moet sneller zijn dan uitklappen
4. Test met kleine gedichten (≤6 regels) vs grote gedichten

### 2. Content Reveal Animaties

#### Uitgevouwen Content Container (`ExpandedContent.jsx`)

- **Locatie**: `/src/components/poem/ExpandedContent.jsx:24-30`
- **Doel**: Fade-in van uitgevouwen content
- **Implementatie**:
  ```javascript
  initial={{opacity: 0}}
  animate={{opacity: 1}}
  transition={{duration: 0.3}}
  ```

#### Gestaggerde Regel Reveal (`ExpandedContent.jsx`)

- **Locatie**: `/src/components/poem/ExpandedContent.jsx:31-42`
- **Doel**: Cinematografische onthulling van gedichtregels
- **Implementatie**:
  ```javascript
  initial={{opacity: 0, x: -30, y: 10}}
  animate={{opacity: 1, x: 0, y: 0}}
  transition={{
    delay: staggeredDelays[i] / 1000,
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1]
  }}
  ```

**Testen**:
1. Klap een gedicht uit
2. Regels moeten van links naar rechts inschuiven
3. Elke regel heeft een kleine vertraging (stagger effect)
4. Timing: 0.8s per regel met incrementele delays

### 3. Zoekresultaten Animaties

#### Resultaten Container (`SearchResults.jsx`)

- **Locatie**: `/src/components/search/SearchResults.jsx:165-172`
- **Doel**: Vloeiende opacity transitie voor resultaten container
- **Implementatie**:
  ```javascript
  initial={{opacity: 1}}
  animate={{opacity: 1}}
  transition={{duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94]}}
  ```

#### Individuele Resultaat Items (`SearchResults.jsx`)

- **Locatie**: `/src/components/search/SearchResults.jsx:185-194`
- **Doel**: Gestaggerde ingang animatie voor elke gedichtkaart
- **Implementatie**:
  ```javascript
  initial={{opacity: 0, y: 20}}
  animate={{opacity: 1, y: 0}}
  transition={{
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
    delay: displayIndex * 0.1
  }}
  ```

**Testen**:
1. Voer een zoekopdracht uit
2. Resultaten moeten van onder naar boven inschuiven
3. Elke kaart heeft 0.1s meer vertraging dan de vorige
4. Totaal maximum 10 kaarten tegelijk animeren

### 4. Interactieve Elementen

#### Actie Knoppen (`PoemActionButtons.jsx`)

- **Locatie**: `/src/components/poem/PoemActionButtons.jsx`
- **Doel**: Spring-gebaseerde feedback voor gebruikersacties
- **Animaties**:
  - **Container**: Spring animatie voor ingang
  - **Button hover**: Gedefinieerd in buttonVariants (niet op card niveau)
  - **Focus op button-level interactions**: CSS hover + Framer Motion container animaties

**Configuratie**:
```javascript
// Container animatie
transition: {
  type: "spring",
  stiffness: 400,
  damping: 25
}

// Button interactions via buttonVariants
// Hover effecten op individuele buttons, niet hele cards
```

**Testen**:
1. Hover over "Canvas" of "Lees meer" knoppen (button-level hover)
2. Geen card-level hover effecten (weggehaald)
3. Focus op expansion spring physics
4. Button feedback via CSS transitions

#### Ellipsis Uitklap Indicator (`PoemExpansionControls.jsx`)

- **Locatie**: `/src/components/poem/PoemExpansionControls.jsx`
- **Doel**: Toont/verbergt uitklap controls
- **Gebruikt**: `AnimatePresence` met `mode="wait"` voor vloeiende transities

### 5. Preview Animaties

#### Preview Regels (`PoemPreview.jsx`)

- **Locatie**: `/src/components/poem/PoemPreview.jsx`
- **Doel**: Gestaggerde onthulling van preview regels
- **Animatie**: Gebruikt `poemLineVariants.preview` met regel-gebaseerde delays

#### Verborgen Content Indicator (`PoemPreview.jsx`)

- **Doel**: Toont "..." indicator voor uitklapbare gedichten
- **Animatie**: Vertraagde fade-in na preview regels

**Testen**:
1. Laad pagina met zoekresultaten
2. Preview regels moeten individueel inschuiven
3. "..." indicator verschijnt na laatste preview regel
4. Timing: 0.1s tussen elke regel

### 6. Toast Notificaties

#### Canvas Toast (`CanvasToast.jsx`)

- **Locatie**: `/src/components/ui/CanvasToast.jsx`
- **Doel**: Inline toast berichten voor canvas modus
- **Implementatie**:
  ```javascript
  initial={{opacity: 0, y: 10}}
  animate={{opacity: 1, y: 0}}
  exit={{opacity: 0, y: 10}}
  transition={{duration: 0.2}}
  ```

**Testen**:
1. Activeer canvas modus
2. Hover over gedicht - toast moet verschijnen
3. Verlaat hover - toast moet verdwijnen
4. Animatie moet snel en subtiel zijn

## Animatie Utilities

### Animation Variants (`animationVariants.js`)

Centrale configuratie bestand met alle animatie presets:

#### Spring Presets (Geoptimaliseerd)
```javascript
export const springPresets = {
  // Zachte, natuurlijke veer voor grote elementen (expansion, reveals)
  gentle: {
    type: "spring",
    stiffness: 220,
    damping: 15,
    mass: 0.9,
    velocity: 0
  },
  // Standaard veer voor algemeen gebruik
  default: {
    type: "spring",
    stiffness: 350,
    damping: 20,
    mass: 0.6
  },
  // Snelle, responsive veer voor kleine elementen (buttons, hovers)
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 15,
    mass: 0.5
  },
  // Extra snel voor collapse/close acties
  quick: {
    type: "spring",
    stiffness: 450,
    damping: 30,
    mass: 0.6,
    velocity: -50
  },
  // Playful bounce voor interactive elementen
  bouncy: {
    type: "spring",
    stiffness: 600,
    damping: 10,
    mass: 0.3
  }
  // Hover preset weggehaald - card-level hover veroorzaakt text rendering issues
}
```

#### Beschikbare Variant Types:
- `poemLineVariants`: Regel-voor-regel tekst animaties
- `buttonVariants`: Knop interactie states met spring physics
- `ellipsisVariants`: Uitklap indicator animaties
- `expandedContentVariants`: Content onthul animaties
- `toastVariants`: Toast notificatie animaties
- `springPresets`: Herbruikbare spring configuraties

## Spring Physics Uitleg

### Parameters

- **Stiffness** (100-1000): Hoe snel de animatie beweegt
  - 200-300: Zachte, natuurlijke beweging
  - 400-500: Snelle, responsive beweging
  - 600+: Zeer snelle, scherpe beweging

- **Damping** (10-100): Hoe snel de beweging stopt
  - 10-20: Veel bounce, speels gevoel
  - 25-35: Gebalanceerde beweging
  - 40+: Weinig bounce, meer gedempt

- **Mass** (0.1-2): Hoe zwaar het element voelt
  - 0.5: Licht, snel gevoel
  - 0.8-1: Natuurlijk gevoel
  - 1.5+: Zwaar, traag gevoel

### Gebruik Guidelines

1. **Grote containers** (zoals gedicht uitklappen): Gebruik lagere stiffness (200-300)
2. **Kleine elementen** (knoppen, icons): Gebruik hogere stiffness (400-500)
3. **Collapse acties**: Altijd sneller dan expand acties
4. **Hover effecten**: Lage damping voor bounce effect

## Testing Setup voor WSL + WebStorm

### Ontwikkelomgeving

**Voor WSL2 + WebStorm + Claude Code setup:**

1. **Start Dev Server in WSL:**
   ```bash
   # In Claude Code terminal (WSL)
   pnpm run dev --host
   # Of als backup:
   npm run dev -- --host
   ```

2. **Port Forwarding:**
   - Dev server draait op `localhost:5173` in WSL
   - WebStorm kan connecten via WSL2 IP
   - Url: `http://localhost:5173` of `http://[WSL-IP]:5173`

3. **Toegang vanuit Windows:**
   - Browser: `http://localhost:5173`
   - DevTools werken normaal voor animation debugging

### Live Testing Checklist

**Voor spring animatie testing:**

1. **Setup verificatie:**
   - [ ] Dev server draait met `--host` flag
   - [ ] Browser bereikt applicatie op poort 5173
   - [ ] Console toont geen Framer Motion errors
   - [ ] React DevTools werkend

2. **Basis functionaliteit:**
   - [ ] Zoekresultaten laden zonder errors
   - [ ] "Lees meer" knop zichtbaar op lange gedichten
   - [ ] Canvas mode kan worden geactiveerd

### Gedetailleerde Testscenario's

#### Test 1: PoemCard Base Animaties
```
Stappen:
1. Ga naar homepagina
2. Zoek naar "liefde" (geeft veel resultaten)
3. Observeer gedichtkaarten tijdens laden

Verwacht gedrag:
- Geen hover effecten op card niveau (weggehaald wegens text rendering issues)
- Cards laden zonder scale/movement effecten
- Focus ligt op expansion animaties zelf
- Console logs: "PoemCard animation started/completed" (minimaal)
```

#### Test 2: Expansion Spring Physics
```
Stappen:
1. Zoek naar een lange gedicht (bijv. "shakespeare")
2. Open Chrome DevTools → Animations panel → Start recording
3. Klik "Lees meer" 
4. Wacht tot animatie klaar is
5. Klik "Inklappen"

Verwacht gedrag:
- Expand: Zachte spring (stiffness: 220-280, damping: 15-18)
- Zichtbare overshoot effect bij expand
- Collapse: Snellere spring (stiffness: 400-450, damping: 28-30)
- Minder bounce bij collapse
- Console logs met animationPhase details

Chrome DevTools check:
- "Motion" entries zichtbaar (niet CSS keyframes)
- Transform values in Elements panel
- Smooth 60fps performance
```

#### Test 3: Button Interactions (Geen Card-Level Hover)
```
Stappen:
1. Expandeer een gedicht
2. Hover over "Canvas" knop (button-level hover via CSS)
3. Klik de knop 
4. Test op verschillende knoppen

Verwacht gedrag:
- Button hover: CSS-based hover effecten
- Geen card-level scale/movement animaties
- Container spring animaties voor button appearance
- Focus op expansion physics als hoofdanimatie
```

#### Test 4: Layout Animation Consistency
```
Stappen:
1. Wissel tussen verschillende zoekresultaten
2. Toggle canvas mode aan/uit
3. Verander window grootte

Verwacht gedrag:
- Layout prop werkt alleen in search mode (niet canvas)
- Geen conflicten tussen Framer Motion en CSS
- Smooth transitions tijdens layout changes
- Geen "jumping" of flashing
```

#### Test 5: Performance Onder Load
```
Stappen:
1. Zoek naar term met 20+ resultaten
2. Open Performance tab in DevTools
3. Start recording
4. Expandeer/collapse meerdere gedichten snel achter elkaar
5. Stop recording na 10 seconden

Performance check:
- Consistent 60fps tijdens animaties
- Geen layout thrashing warnings
- JavaScript execution time < 16ms per frame
- Memory usage stabiel
```

## Debugging met Chrome DevTools

### Animations Tab Gebruiken

1. **Open Chrome DevTools**: F12 → More tools → Animations
2. **Opname starten**: Klik rode cirkel voor trigger actie
3. **Animatie uitvoeren**: Klap gedicht uit/in
4. **Analyse**: 
   - Scrub door timeline om frame-by-frame te zien
   - Verlaag snelheid naar 25% voor gedetailleerde analyse
   - Check voor dropped frames (performance problemen)
   - **Belangrijk**: Framer Motion spring animaties zijn zichtbaar als "Motion" entries

### Spring Animatie Detectie

**Herken Framer Motion animaties:**
- **Motion entries** in Animations panel (niet CSS keyframes)
- **Transform properties** in Elements panel tijdens animatie
- **Console logs** met "animation started/completed" berichten
- **Performance tab** toont JavaScript-driven animaties

### Performance Testing

1. **Performance Tab**: Record tijdens animaties
2. **Frame Rate**: Moet consistent 60 FPS zijn
3. **Layout Thrashing**: Vermijd meerdere layout herberekeningen
4. **Memory Leaks**: Check voor actieve animaties op unmounted componenten

### Debugging Tips

1. **React DevTools**: Zoek components met "motion" prefix
2. **Console Logging**: Log animation phases in hooks
3. **CSS Inspection**: Check computed styles tijdens animaties
4. **Z-index Conflicts**: Voorkom overlappende geanimeerde elementen

## Performance Overwegingen

### Geoptimaliseerde Properties
- Gebruik alleen `transform`, `opacity`, `scale` voor beste performance
- Vermijd animaties op `width`, `height`, `padding` waar mogelijk
- GPU-accelerated properties hebben voorkeur

### Best Practices
1. **Minimal Re-renders**: Proper memoization in components
2. **AnimatePresence Cleanup**: Automatische cleanup van exit animaties  
3. **Staggered Delays**: Voorkom simultane animaties van vele elementen
4. **Conditional Rendering**: Render alleen wanneer nodig

### Spring vs Tween Keuze
- **Spring**: Voor natuurlijke, organische bewegingen
- **Tween**: Voor precieze, voorspelbare timings
- **Regel**: Spring voor user interactions, tween voor choreografie

## Veelvoorkomende Problemen

### Layout Thrashing
- **Symptoom**: Stotterende animaties
- **Oplossing**: Gebruik `transform` in plaats van `width`/`height`
- **Check**: Performance tab in DevTools

### Memory Leaks  
- **Symptoom**: Trage browser na veel animaties
- **Oplossing**: Proper `AnimatePresence` usage
- **Check**: Memory tab in DevTools

### Z-index Conflicts
- **Symptoom**: Elementen verdwijnen tijdens animatie
- **Oplossing**: Expliciete z-index waarden
- **Check**: Elements panel tijdens animatie

### Inconsistent Timing
- **Symptoom**: Animaties voelen verschillend aan
- **Oplossing**: Gebruik gestandaardiseerde spring presets
- **Check**: Vergelijk stiffness/damping waarden