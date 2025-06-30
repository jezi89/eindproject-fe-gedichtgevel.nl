# Architectuur Reorganisatie: Hybride Structuur

## ⚠️ BELANGRIJKE ONTDEKKING

Er bestaat al een **"Refactor SearchResultItem.md"** document in de DOCS folder! Dit document beschrijft een eerdere poging tot refactoring waarbij:
- SearchResultItem werd omgedoopt naar PoemResultItem 
- Het component werd opgesplitst in sub-componenten
- Custom hooks werden gecreëerd

**Status**: Deze refactor lijkt slechts DEELS geïmplementeerd:
- ✅ Sub-componenten zijn aangemaakt (in search/poem/)
- ✅ Hooks zijn gecreëerd (useHeightCalculation, useCanvasMode)
- ❌ SearchResultItem heet nog steeds SearchResultItem (niet PoemResultItem)
- ❌ Hybride folder structuur niet geïmplementeerd

## Huidige Situatie vs Gewenste Structuur

### Huidige Structuur (Afgeweken van Plan)
```
src/
├── components/
│   ├── search/
│   │   ├── poem/          # ❌ Claude maakte deze nieuwe folder
│   │   │   ├── PoemCard.jsx
│   │   │   ├── PoemHeader.jsx
│   │   │   ├── PoemExpansionControls.jsx
│   │   │   ├── ExpandedContent.jsx
│   │   │   └── CanvasToast.jsx
│   │   ├── SearchResultItem.jsx  # Te hernoemen naar PoemResultItem
│   │   ├── SearchBar.jsx
│   │   └── SearchResults.jsx
│   └── common/
│       └── [generieke componenten]
├── hooks/
│   ├── poem/
│   │   └── useHeightCalculation.js
│   ├── search/
│   │   └── useSearchPoems.js
│   └── useExpandablePoem.js
```

### Gewenste Hybride Structuur
```
src/
├── pages/
│   ├── Core/                    # Feature-first voor kernfuncties
│   │   ├── Search/
│   │   │   ├── components/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── SearchResults.jsx
│   │   │   │   └── PoemResultItem.jsx  # Hernoemd!
│   │   │   └── [page files]
│   │   ├── Design/              # Canvas functionaliteit
│   │   ├── Audio/               # Spreekgevel
│   │   └── Collections/         # Collectiegevel
│   └── [andere pages]
├── components/                  # Type-first voor herbruikbare componenten
│   ├── poem/                    # Generieke poem componenten
│   │   ├── PoemCard.jsx         # Wrapper component
│   │   ├── PoemHeader.jsx
│   │   ├── PoemPreview.jsx
│   │   ├── PoemExpansionControls.jsx
│   │   └── ExpandedContent.jsx
│   ├── ui/                      # UI elementen
│   │   └── CanvasToast.jsx      # Verplaatst uit poem folder
│   └── common/                  # Andere generieke componenten
├── hooks/                       # Alle hooks gecentraliseerd
│   ├── poem/
│   │   ├── useExpandablePoem.js
│   │   ├── useHeightCalculation.js
│   │   └── useCanvasMode.js
│   └── search/
│       ├── useSearchPoems.js
│       ├── useSearchLayout.js
│       └── useSearchOrchestration.js
```

## Reorganisatie Plan

### Fase 1: Hernoemen SearchResultItem
```bash
# Hernoem SearchResultItem naar PoemResultItem
mv src/components/search/SearchResultItem.jsx src/components/search/PoemResultItem.jsx

# Update alle imports
# In SearchResults.jsx:
# import PoemResultItem from './PoemResultItem';

# In MonthlyPoems.jsx:
# import PoemResultItem from '@/components/search/PoemResultItem';
```

### Fase 2: Verplaats Poem Sub-componenten
```bash
# Maak nieuwe folder structuur
mkdir -p src/components/poem

# Verplaats poem componenten naar generieke locatie
mv src/components/search/poem/PoemCard.jsx src/components/poem/
mv src/components/search/poem/PoemHeader.jsx src/components/poem/
mv src/components/search/poem/PoemExpansionControls.jsx src/components/poem/
mv src/components/search/poem/ExpandedContent.jsx src/components/poem/
mv src/components/search/PoemPreview.jsx src/components/poem/
mv src/components/search/PoemActionButtons.jsx src/components/poem/

# Verplaats CanvasToast naar ui folder
mv src/components/search/poem/CanvasToast.jsx src/components/ui/

# Verwijder lege poem folder
rm -rf src/components/search/poem
```

### Fase 3: Creëer Feature-based Structure (Optioneel)
```bash
# Als je volledig wilt committen aan feature-based:
mkdir -p src/pages/Core/Search/components

# Verplaats search componenten
mv src/components/search/SearchBar.jsx src/pages/Core/Search/components/
mv src/components/search/SearchResults.jsx src/pages/Core/Search/components/
mv src/components/search/PoemResultItem.jsx src/pages/Core/Search/components/
```

## Import Updates

### Voor PoemResultItem
```javascript
// OLD imports
import PoemCard from './poem/PoemCard';
import PoemHeader from './poem/PoemHeader';
import PoemExpansionControls from './poem/PoemExpansionControls';
import ExpandedContent from './poem/ExpandedContent';
import CanvasToast from './poem/CanvasToast';
import PoemPreview from './PoemPreview';
import PoemActionButtons from './PoemActionButtons';

// NEW imports
import PoemCard from '@/components/poem/PoemCard';
import PoemHeader from '@/components/poem/PoemHeader';
import PoemExpansionControls from '@/components/poem/PoemExpansionControls';
import ExpandedContent from '@/components/poem/ExpandedContent';
import CanvasToast from '@/components/ui/CanvasToast';
import PoemPreview from '@/components/poem/PoemPreview';
import PoemActionButtons from '@/components/poem/PoemActionButtons';
```

## Voordelen van Deze Structuur

### 1. **Duidelijke Scheiding**
- Feature-specifieke code bij de feature (Search components bij Search)
- Generieke componenten centraal beschikbaar
- Hooks netjes georganiseerd per domein

### 2. **Betere Schaalbaarheid**
- Nieuwe features kunnen eigen component folders krijgen
- Generieke componenten makkelijk te vinden voor hergebruik
- Geen verwarring over waar nieuwe componenten horen

### 3. **Team Collaboration**
- Teams kunnen aan features werken zonder elkaar te storen
- Duidelijke ownership van code delen
- Makkelijker te navigeren voor nieuwe developers

## Alternatief: Minimale Aanpassing

Als een grote reorganisatie te veel werk is, kun je ook kiezen voor:

1. **Alleen hernoemen**: SearchResultItem → PoemResultItem
2. **Poem folder flatten**: Verplaats poem sub-componenten naar components/poem
3. **Behoud huidige search structuur**: Laat SearchBar en SearchResults waar ze zijn

Dit geeft je al veel van de voordelen zonder grote breaking changes.

## Git Strategy

```bash
# Creëer feature branch
git checkout -b refactor/hybrid-architecture

# Doe reorganisatie in kleine commits
git add -A && git commit -m "refactor: rename SearchResultItem to PoemResultItem"
git add -A && git commit -m "refactor: move poem components to components/poem"
git add -A && git commit -m "refactor: move CanvasToast to ui folder"
git add -A && git commit -m "refactor: update all imports for new structure"

# Test thoroughly
npm run dev
npm run build

# Merge wanneer alles werkt
git checkout main
git merge refactor/hybrid-architecture
```

## Belangrijke Observatie

**De pages/Core structuur bestaat nog niet!** Dit betekent dat de oorspronkelijke hybride architectuur nooit volledig is geïmplementeerd. Je hebt nu de keuze:

### Optie A: Minimale Refactor (Aanbevolen voor nu)
1. Hernoem SearchResultItem → PoemResultItem
2. Reorganiseer poem componenten naar components/poem/
3. Behoud verder de huidige structuur

**Voordeel**: Snel te doen, weinig breaking changes
**Nadeel**: Nog steeds niet je ideale architectuur

### Optie B: Volledige Hybride Implementatie
1. Creëer pages/Core structuur
2. Verplaats alle feature-specifieke componenten
3. Implementeer echte feature-based modules

**Voordeel**: Je krijgt exact wat je wilde
**Nadeel**: Grote refactor, veel werk, mogelijk niet nodig voor bootcamp deadline

## Mijn Aanbeveling

Gezien je NOVI bootcamp deadline, zou ik **Optie A** aanraden:

1. **Quick Wins** (30 min):
   ```bash
   # Hernoem component
   mv src/components/search/SearchResultItem.jsx src/components/search/PoemResultItem.jsx
   
   # Flatten poem structure
   mv src/components/search/poem/* src/components/poem/
   mv src/components/search/PoemPreview.jsx src/components/poem/
   mv src/components/search/PoemActionButtons.jsx src/components/poem/
   ```

2. **Update imports** in PoemResultItem.jsx

3. **Test alles**

4. **Later** (na bootcamp): Implementeer volledige Core structuur als je meer tijd hebt

Dit geeft je een nettere structuur zonder grote risico's voor je deadline!