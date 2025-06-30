# Analyse van memo en useMemo gebruik in gedichtegevel.nl

## Overzicht van gevonden memo/useMemo gebruik

### 1. React.memo Componenten

#### **PoemCard.jsx (src/components/common/)**
```javascript
export const PoemCard = memo(({
    poem,
    index,
    layoutType = 'search',
    canExpand = true,
    onExpandChange,
    animationState = {phase: 'idle', expanded: false}
}) => {
    // Component logic
});
```

**Nuttigheid**: **DEELS NUTTIG** ⚡
- **Positief**: Deze component wordt gebruikt in search results die potentieel veel items kunnen bevatten
- **Negatief**: De props bevatten complexe objecten (poem, animationState) die waarschijnlijk nieuwe referenties krijgen bij elke render
- **Advies**: Alleen nuttig als parent components stabiele object referenties doorgeven

#### **PoemCard.jsx (src/components/search/poem/)**
```javascript
const PoemCard = memo(forwardRef(({
    isExpanded,
    canvasMode,
    onClick,
    onDoubleClick,
    onMouseEnter,
    onMouseLeave,
    styles,
    children
}, ref) => {
    // Component logic
}));
```

**Nuttigheid**: **MOGELIJK NUTTIG** ✅
- **Positief**: Voornamelijk primitieve props (booleans) en event handlers
- **Negatief**: Event handlers kunnen nieuwe referenties zijn tenzij ze met useCallback gewrapped zijn
- **Advies**: Handig als de parent component useCallback gebruikt voor event handlers

#### **SearchResults.jsx**
```javascript
const SearchResults = memo(({
    results,
    onOpenFocusStudio,
    searchTerm,
    focusMode = false,
    canvasMode = false,
    onPoemSelect,
    onLoadInCanvas,
    hideSeriesNavigation = false,
    hideRangeIndicator = false,
    initialIndex = 0,
    ResultsOverviewComponent = ResultsOverview,
    resultsOverviewProps = {}
}) => {
    // Component logic
});
```

**Nuttigheid**: **TWIJFELACHTIG** ⚠️
- **Positief**: Component kan complex zijn met veel children
- **Negatief**: Results array zal vrijwel altijd een nieuwe referentie zijn na een search
- **Advies**: Waarschijnlijk overbodig tenzij results array stabiel gehouden wordt

### 2. useMemo Gebruik

#### **useSearchPoems.js**
```javascript
// Memoized search metadata
const searchMeta = useMemo(() => ({
    hasResults: results.length > 0,
    resultCount: results.length,
    isEmpty: !searchTerm.trim(),
    hasError: !!error,
    isLoading: loading,
    canSearch: !!searchTerm.trim() && !loading,
    fromCache
}), [results.length, searchTerm, error, loading, fromCache]);
```

**Nuttigheid**: **NIET NUTTIG** ❌
- **Probleem**: Dit creëert alleen een simpel object met primitieve waarden
- **Overhead**: De useMemo check is waarschijnlijk duurder dan het maken van dit object
- **Advies**: Verwijder useMemo, maak gewoon direct het object

#### **useSearchLayout.js**
```javascript
// Multiple useMemo instances:
const layoutClass = useMemo(() => {
    return getLayoutClass(resultCount, isDesktop);
}, [resultCount, isDesktop]);

const visibleResults = useMemo(() => {
    return getVisibleResults(results, currentIndex, resultCount, isDesktop, isCarousel);
}, [results, currentIndex, resultCount, isDesktop, isCarousel]);

const visibleIndices = useMemo(() => {
    return mapVisibleIndices(visibleResults, currentIndex, resultCount, isCarousel);
}, [visibleResults, currentIndex, resultCount, isCarousel]);

const indicesToCalculate = useMemo(() => {
    return getIndicesToCalculate(
        results,
        currentIndex,
        resultCount,
        isCarousel,
        isDesktop,
        getVisibleResults
    );
}, [results, currentIndex, resultCount, isCarousel, isDesktop]);
```

**Nuttigheid**: **GEMENGD** 🔄
- **layoutClass**: Waarschijnlijk overbodig (simpele string return)
- **visibleResults**: Mogelijk nuttig als deze functie array manipulatie doet
- **visibleIndices**: Hangt af van complexiteit mapVisibleIndices
- **indicesToCalculate**: Mogelijk nuttig als het veel berekeningen doet
- **Advies**: Meet de performance van deze functies eerst

#### **useHeightCalculation.js**
```javascript
// Direct height calculation for single results
const directHeightCalculation = useMemo(() => {
    if (!poem || !poem.lines || !Array.isArray(poem.lines)) return null;
    if (poem.lines.length <= 4) return null;
    if (!expandablePreview?.isExpandable) return null;

    const cardWidth = screenLayout.cardWidth || 570;

    if (!allPoems || allPoems.length <= 1) {
        return calculateExpandedHeight(poem, window.innerWidth, cardWidth, true);
    }

    return null;
}, [poem, screenLayout, allPoems, expandablePreview]);

// Final height info combination
const finalHeightInfo = useMemo(() => {
    if (!expandablePreview?.isExpandable) {
        return null;
    }

    const heightInfo = preCalculatedHeight || carouselHeightInfo || directHeightCalculation;
    return heightInfo ? { ...heightInfo, canExpand: true } : null;
}, [preCalculatedHeight, carouselHeightInfo, directHeightCalculation, expandablePreview]);
```

**Nuttigheid**: **MOGELIJK NUTTIG** ✅
- **directHeightCalculation**: Als calculateExpandedHeight zwaar is, dan nuttig
- **finalHeightInfo**: Waarschijnlijk overbodig (simpele object merge)
- **Advies**: Behoud alleen als calculateExpandedHeight merkbaar traag is

## Performance Impact Visualisatie

### Waar zit de echte winst?

```
API Call (100-500ms) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dexie Cache (5ms)    ━━━
React Render (20ms)      ━━━━
Memo Check (1-2ms)        ━

GROOTSTE WINST: Dexie voorkomt API calls (95-99% sneller!)
KLEINE WINST: Memo voorkomt re-renders (misschien 10-20ms)
```

### Decision Tree voor Optimalisatie

```
Is het een netwerk request?
├─ JA → Gebruik Dexie/Cache ✅✅✅ (ALTIJD DOEN)
└─ NEE → Is het een React component?
    ├─ JA → Rendert het vaak met zelfde props?
    │   ├─ JA → Heeft het zware render logic (>10ms)?
    │   │   ├─ JA → Gebruik React.memo ✅
    │   │   └─ NEE → Skip memo ❌
    │   └─ NEE → Skip memo ❌
    └─ NEE → Is het een berekening?
        ├─ Duurt het >5ms?
        │   ├─ JA → Gebruik useMemo ✅
        │   └─ NEE → Skip useMemo ❌
        └─ NEE → Skip optimization ❌
```

## Code Review: Specifieke Gevallen

### ❌ Overbodig: searchMeta in useSearchPoems
```javascript
// VOOR (met useMemo)
const searchMeta = useMemo(() => ({
    hasResults: results.length > 0,
    resultCount: results.length,
    isEmpty: !searchTerm.trim(),
    hasError: !!error,
    isLoading: loading,
    canSearch: !!searchTerm.trim() && !loading,
    fromCache
}), [results.length, searchTerm, error, loading, fromCache]);

// NA (zonder useMemo) - BETER!
const searchMeta = {
    hasResults: results.length > 0,
    resultCount: results.length,
    isEmpty: !searchTerm.trim(),
    hasError: !!error,
    isLoading: loading,
    canSearch: !!searchTerm.trim() && !loading,
    fromCache
};
```
**Reden**: Object creatie is goedkoper dan memo dependency check

### ✅ Mogelijk Nuttig: PoemCard memo
```javascript
// Parent component
const MemoizedPoemCard = memo(PoemCard);

// Gebruik met stabiele props
const handleExpandChange = useCallback((index, expanded) => {
    // handler logic
}, []); // Lege deps = stabiele referentie

<MemoizedPoemCard 
    poem={poem} // ⚠️ Object ref verandert vaak
    index={index} // ✅ Primitive, stabiel
    onExpandChange={handleExpandChange} // ✅ Stabiel door useCallback
/>
```

### 🤔 Twijfelgeval: Height Calculations
```javascript
const directHeightCalculation = useMemo(() => {
    // Complex calculation
    return calculateExpandedHeight(poem, window.innerWidth, cardWidth, true);
}, [poem, screenLayout, allPoems, expandablePreview]);
```
**Test nodig**: Meet of calculateExpandedHeight > 5ms duurt

## Samenvatting & Aanbevelingen

### Terecht Anticiperend Gebruik
1. **Height calculations** - Als deze echt complex zijn
2. **Array filtering/mapping** in useSearchLayout - Bij grote datasets

### Overbodig Gebruik
1. **searchMeta object** in useSearchPoems - Te simpel
2. **finalHeightInfo** in useHeightCalculation - Simpele merge
3. **SearchResults memo** - Results array verandert te vaak

### Best Practices voor je Project

1. **Meet Eerst**: Gebruik React DevTools Profiler om te zien welke componenten echt vaak renderen
2. **Stabiele Referenties**: Zorg dat parent components useCallback gebruiken voor event handlers
3. **Complexiteit Check**: Alleen memoizen als de berekening echt complex is
4. **Dependencies**: Let op dat dependencies arrays correct zijn

### Specifieke Actiepunten

1. **Verwijder**:
   - useMemo van searchMeta
   - Mogelijk memo van SearchResults

2. **Behoud**:
   - memo op PoemCard componenten (mits stabiele props)
   - useMemo voor height calculations

3. **Onderzoek**:
   - Performance van layout calculation functies
   - Of parent components stabiele props doorgeven

## Praktisch Voorbeeld: Search Flow

```javascript
// Stap 1: User zoekt "Shakespeare"
// Dexie checkt cache eerst (GROTE WINST: geen API call)
const cachedResults = await dexieCache.get("Shakespeare"); // 5ms

// Stap 2: Results komen in component
<SearchResults results={cachedResults} /> // results = 50 gedichten

// Stap 3: Parent component re-rendert om andere reden
// Zonder memo: SearchResults rendert opnieuw (50 PoemCards)
// Met memo: Checkt of props gelijk zijn
// MAAR: cachedResults is waarschijnlijk nieuwe array referentie!
// Dus memo helpt niet...

// Betere oplossing: Stabiele referentie in parent
const [searchResults, setSearchResults] = useState([]);
// Deze referentie blijft gelijk tot nieuwe search
```

## Relatie tussen Memo/useMemo en Dexie.js

### Belangrijke Verschillen
- **Dexie.js**: Client-side database caching (IndexedDB) - bewaart data tussen sessies
- **memo/useMemo**: In-memory React optimalisaties - alleen tijdens component lifecycle

### Zijn ze Gerelateerd?
**NEE**, ze werken op verschillende niveaus:
- **Dexie**: Voorkomt netwerk requests door data lokaal op te slaan
- **memo**: Voorkomt onnodige React re-renders

### Wanneer Werk je met Beide?
```javascript
// Dexie haalt gecachte data op
const cachedResults = await searchCacheService.get(searchTerm);

// useMemo zou NIET nuttig zijn om deze results te wrappen
// De data komt al uit cache, extra memoization is overbodig
const searchResults = cachedResults; // Direct gebruiken!
```

## Performance Strategie voor je Project

### 1. Netwerk/Data Layer (Dexie) ✅
- Je gebruikt dit al goed voor search caching
- Voorkomt dubbele API calls
- Grootste performance winst

### 2. Component Rendering (memo) ⚠️
- Alleen nuttig bij:
  - Zware render operaties
  - Stabiele props
  - Frequente parent re-renders

### 3. Berekeningen (useMemo) ⚡
- Alleen voor echt zware berekeningen
- Niet voor simpele object creatie

## Conclusie

Je anticiperende aanpak is niet volledig verkeerd - bij search results met potentieel veel items kan memoization nuttig zijn. Echter, veel van de huidige implementaties zijn waarschijnlijk overbodig of zelfs contraproductief. 

**Belangrijkste inzicht**: Dexie.js geeft je al de grootste performance winst door netwerk calls te voorkomen. React memo/useMemo zijn secundaire optimalisaties die alleen nuttig zijn bij meetbare rendering bottlenecks.

## Actieplan voor Jerôme

### Fase 1: Quick Wins (30 minuten)
1. **Verwijder** `useMemo` van `searchMeta` in `useSearchPoems.js`
2. **Test** de app - alles werkt nog steeds prima!
3. **Conclusie**: Je hebt net performance verbeterd door overhead te verwijderen

### Fase 2: Meten (1 uur)
1. Open React DevTools → Profiler tab
2. Start recording
3. Voer verschillende searches uit
4. Stop recording en analyseer:
   - Welke componenten renderen het vaakst?
   - Welke componenten duren het langst?
   - Zijn er componenten die onnodig re-renderen?

### Fase 3: Gerichte Optimalisatie (indien nodig)
**Alleen** optimaliseren waar je problemen ziet:
- Component rendert > 50x tijdens normale gebruik
- Component render duurt > 16ms (60fps grens)
- Gebruikers ervaren daadwerkelijk traagheid

### Voor je NOVI Opdracht

**Prioriteiten**:
1. **Functionaliteit** - Alles moet werken
2. **Code kwaliteit** - Clean, leesbare code
3. **Performance** - Alleen als het echt nodig is

**Wat docenten waarderen**:
- Werkende features ✅
- Goede code structuur ✅
- Beredeneerde keuzes ✅
- Niet: Premature optimization ❌

### Bottom Line

Je hebt Dexie al goed geïmplementeerd - dat is 90% van je performance wins. De React memo/useMemo optimalisaties zijn nice-to-have, niet need-to-have. Focus op het afmaken van features voor je deadline! 🚀