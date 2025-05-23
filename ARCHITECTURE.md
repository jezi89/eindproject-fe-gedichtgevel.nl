# Architectuur van gedichtgevel.nl Frontend

Dit document beschrijft de architectuur, ontwerppatronen en aanbevelingen voor de gedichtgevel.nl React applicatie. Het dient als architecturale referentie en ontwikkelaarshandleiding voor het project.

## Architectuuroverzicht

De frontend is opgebouwd volgens moderne React best practices met een focus op onderhoudbaarheid, schaalbaarheid en toekomstige integratie met een Spring Boot backend.

```
gedichtgevel.nl/
│
├── components/         # UI componenten
│   ├── Core/           # Core functionaliteiten 
│   │   ├── Canvas/     # Canvas-gerelateerde componenten
│   │   └── Recording/  # Audio-gerelateerde componenten
│   ├── common/         # Gedeelde componenten
│   ├── forms/          # Formuliercomponenten
│   ├── search/         # Zoekinterface
│   ├── system/         # Systeemcomponenten
│   └── ui/             # Basis UI componenten
│
├── hooks/              # Custom React hooks
├── services/           # Services en API-integraties
│   ├── api/            # API clients
│   ├── auth/           # Authenticatieservices
│   └── dataAccess/     # Data repositories
│
├── context/            # React Context providers
├── utils/              # Hulpfuncties
└── ...
```

## Huidige Architecturale Sterke Punten

### 1. Duidelijke scheiding van verantwoordelijkheden
De mappenstructuur implementeert het Single Responsibility Principle (SRP) goed:
- `/components` voor UI-elementen
- `/services` voor API-interacties en business logica
- `/hooks` voor herbruikbare React-logica
- `/context` voor state management

### 2. Service-abstractie
`poemService.js` en `poemSearchService.js` bieden een goede abstractielaag boven API-calls, wat de codebase flexibeler maakt bij wijzigingen.

### 3. Context-gebaseerd state management
`AuthContext` en `AuthProvider` zijn goed geïmplementeerd voor applicatie-brede authenticatiestatus.

### 4. Performance optimalisaties
Gebruik van `useDebounce` voor zoekfunctionaliteit wijst op aandacht voor performance.

### 5. Testgerichte aanpak
Aanwezigheid van `__tests__` mappen toont focus op testbaarheid.

## Architecturale Patronen en Aanbevelingen

### 1. API Facade Pattern

De huidige API-service laag kan worden versterkt voor toekomstige backend-migratie:

```javascript
/**
 * @class ApiService
 * @description Implementatie van het Facade Pattern voor API-interacties
 */
export class ApiService {
  /**
   * @constructor
   * @param {AxiosInstance} client - Axios client instance
   * @param {Object} endpoints - Map van endpoint sleutels naar URL paden
   */
  constructor(client, endpoints) {
    this.client = client;
    this.endpoints = endpoints;
  }
  
  /**
   * Voert een GET-request uit naar het gespecificeerde endpoint
   * @async
   * @param {string} endpoint - Endpoint sleutel of direct pad
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    try {
      const url = this.endpoints[endpoint] || endpoint;
      return await this.client.get(url, { params });
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Centraliseert error handling voor API requests
   * @param {Error} error - Opgevangen error
   * @returns {Object} Gestandaardiseerd error object
   */
  handleError(error) {
    // Centrale error handling implementatie
  }
}

/**
 * @constant {ApiService} poemApiService
 * @description Gespecialiseerde API service voor gedichten
 */
export const poemApiService = new ApiService(poetryDbApi, {
  search: '/title',
  byAuthor: '/author',
  // etc.
});
```

**Voordeel:** Bij migratie naar een Spring Boot backend hoef je alleen deze service-implementatie aan te passen, terwijl de interface hetzelfde blijft.

### 2. Factory Pattern voor Canvas-elementen

```javascript
/**
 * @class CanvasElementFactory
 * @description Factory voor het maken van verschillende soorten canvas-elementen
 */
export class CanvasElementFactory {
  /**
   * Maakt een nieuw tekstElement
   * @static
   * @param {Object} config - Configuratie voor het textelement
   * @param {string} config.text - Tekstinhoud
   * @param {Object} config.position - Positie {x, y}
   * @param {string} [config.fontFamily='Arial'] - Font family
   * @param {number} [config.fontSize=16] - Font grootte
   * @param {string} [config.color='#000000'] - Tekstkleur
   * @returns {Object} Tekstelementobject
   */
  static createTextElement(config) {
    return {
      type: 'text',
      content: config.text,
      position: config.position,
      style: {
        fontFamily: config.fontFamily || 'Arial',
        fontSize: config.fontSize || 16,
        color: config.color || '#000000',
      },
      // Methodes voor rendering, verplaatsing, etc.
    };
  }

  /**
   * Maakt een nieuw afbeeldingselement
   * @static
   * @param {Object} config - Configuratie voor het afbeeldingselement
   * @param {string} config.src - Bron URL
   * @param {Object} config.position - Positie {x, y}
   * @param {Object} config.size - Afmeting {width, height}
   * @returns {Object} Afbeeldingselementobject
   */
  static createImageElement(config) {
    return {
      type: 'image',
      src: config.src,
      position: config.position,
      size: config.size,
      // Methodes specifiek voor afbeeldingen
    };
  }
}
```

**Voordeel:** Maakt het eenvoudig om nieuwe soorten canvas-elementen toe te voegen zonder kernlogica aan te passen.

### 3. Repository Pattern voor data-toegang

```javascript
/**
 * @class PoemRepository
 * @description Implementatie van het Repository Pattern voor gedichten
 */
export class PoemRepository {
  /**
   * @constructor
   * @param {ApiService} apiService - API service voor data-toegang
   * @param {CacheService} localCacheService - Caching service
   */
  constructor(apiService, localCacheService) {
    this.apiService = apiService;
    this.cache = localCacheService;
  }
  
  /**
   * Zoekt gedichten op titel
   * @async
   * @param {string} title - Zoekterm voor titel
   * @returns {Promise<Array>} Gevonden gedichten
   */
  async searchByTitle(title) {
    // Check cache eerst
    const cachedResults = this.cache.get(`poem_title_${title}`);
    if (cachedResults) return cachedResults;
    
    // Anders ophalen via API
    const results = await this.apiService.get('search', { title });
    
    // Cache resultaten
    this.cache.set(`poem_title_${title}`, results, 3600); // TTL in seconden
    
    return results;
  }
}
```

**Voordeel:** Centraliseert datalogica, inclusief caching, en maakt overstap naar andere datasources transparant.

### 4. Command Pattern voor canvas-acties

```javascript
/**
 * @class CanvasCommand
 * @description Basisklasse voor canvas commando's (Command Pattern)
 */
export class CanvasCommand {
  /**
   * Voert het commando uit
   * @returns {void}
   */
  execute() {}
  
  /**
   * Maakt het commando ongedaan
   * @returns {void}
   */
  undo() {}
}

/**
 * @class AddElementCommand
 * @extends CanvasCommand
 * @description Commando voor het toevoegen van een element aan canvas
 */
export class AddElementCommand extends CanvasCommand {
  /**
   * @constructor
   * @param {Canvas} canvas - Canvas referentie
   * @param {Object} element - Het toe te voegen element
   */
  constructor(canvas, element) {
    super();
    this.canvas = canvas;
    this.element = element;
  }
  
  /**
   * Voegt element toe aan canvas
   * @override
   */
  execute() {
    this.canvas.addElement(this.element);
  }
  
  /**
   * Verwijdert element van canvas
   * @override
   */
  undo() {
    this.canvas.removeElement(this.element.id);
  }
}
```

**Voordeel:** Maakt undo/redo-functionaliteit mogelijk, essentieel voor een goede canvas-editor.

### 5. Strategy Pattern voor rendering-opties

```javascript
/**
 * @class CanvasRenderer
 * @description Basisklasse voor verschillende rendering-strategieën
 */
export class CanvasRenderer {
  /**
   * Rendert canvas-inhoud
   * @param {Object} canvas - Canvas model
   * @param {Object} context - Rendering context
   * @returns {void}
   */
  render(canvas, context) {}
}

/**
 * @class HTMLCanvasRenderer
 * @extends CanvasRenderer
 * @description Renderer die HTML Canvas API gebruikt
 */
export class HTMLCanvasRenderer extends CanvasRenderer {
  /**
   * @override
   */
  render(canvas, context) {
    // Implementatie voor HTML Canvas API
  }
}

/**
 * @class SVGRenderer
 * @extends CanvasRenderer
 * @description Renderer die SVG gebruikt
 */
export class SVGRenderer extends CanvasRenderer {
  /**
   * @override
   */
  render(canvas, context) {
    // Implementatie voor SVG
  }
}
```

**Voordeel:** Flexibiliteit in rendering-methoden, inclusief toekomstige server-side rendering.

## Specifieke Implementatierichtlijnen voor Canvas

### 1. Gelaagd Canvas Model

```javascript
/**
 * @class CanvasModel
 * @description Model voor canvas met lagenstructuur
 */
export class CanvasModel {
  constructor() {
    /**
     * Array van canvaslagen
     * @type {Array}
     */
    this.layers = [];
    
    /**
     * Index van actieve laag
     * @type {number}
     */
    this.activeLayerIndex = 0;
  }
  
  /**
   * Geeft de huidige actieve laag
   * @returns {Object} Actieve laag
   */
  get activeLayer() {
    return this.layers[this.activeLayerIndex];
  }
  
  /**
   * Voegt een nieuwe laag toe
   * @param {Object} layer - Laagobject
   * @returns {number} Index van nieuwe laag
   */
  addLayer(layer) {
    this.layers.push(layer);
    return this.layers.length - 1;
  }
}

/**
 * @class TextLayer
 * @description Laag specifiek voor tekstcontent
 */
export class TextLayer {
  // Implementatie voor tekstlaag
}

/**
 * @class ImageLayer
 * @description Laag specifiek voor afbeeldingen
 */
export class ImageLayer {
  // Implementatie voor afbeeldingslaag
}
```

**Voordeel:** Maakt complexere composities mogelijk, zoals tekst over een gevelafbeelding.

### 2. State Machine voor interactie

```javascript
/**
 * @constant {Object} CanvasModes
 * @description Verschillende interactiemodi voor canvas
 */
export const CanvasModes = {
  SELECT: 'select',
  MOVE: 'move',
  TEXT: 'text',
  IMAGE: 'image',
};

/**
 * @class CanvasStateMachine
 * @description State machine voor canvasinteractie
 */
export class CanvasStateMachine {
  constructor() {
    /**
     * Huidige actieve mode
     * @type {string}
     */
    this.currentMode = CanvasModes.SELECT;
    
    /**
     * Handlers voor verschillende modi
     * @type {Object}
     */
    this.modeHandlers = {
      [CanvasModes.SELECT]: new SelectModeHandler(),
      [CanvasModes.MOVE]: new MoveModeHandler(),
      // etc.
    };
  }
  
  /**
   * Verandert de huidige interactiemode
   * @param {string} mode - Nieuwe mode uit CanvasModes
   * @returns {boolean} Succes
   */
  setMode(mode) {
    if (this.modeHandlers[mode]) {
      this.currentMode = mode;
      return true;
    }
    return false;
  }
  
  /**
   * Behandelt een event in de huidige mode
   * @param {Event} event - DOM event
   * @returns {*} Resultaat van de handler
   */
  handleEvent(event) {
    return this.modeHandlers[this.currentMode].handleEvent(event);
  }
}
```

**Voordeel:** Schone scheiding van interactiemodi maakt de code beter onderhoudbaar.

## Voorbereiding Backend-Frontend Integratie

### 1. API-contracten definiëren

```javascript
/**
 * @typedef {Object} Poem
 * @property {string} id - Unieke identifier
 * @property {string} title - Titel
 * @property {string} author - Auteur
 * @property {string[]} lines - Gedichtregels
 * @property {string} [source] - Bron (optioneel)
 */

/**
 * @typedef {Object} CanvasDesign
 * @property {string} id - Unieke identifier
 * @property {string} poemId - ID van het gedicht
 * @property {string} backgroundUrl - URL van gevelafbeelding
 * @property {Object} designSettings - Ontwerpinstellingen
 * @property {Object[]} elements - Canvas-elementen
 */
```

### 2. Abstractie voor backend-functionaliteit

```javascript
/**
 * @class ImageProcessor
 * @description Processor voor afbeeldingsbewerkingen, met client- of server-side implementatie
 */
export class ImageProcessor {
  /**
   * @constructor
   * @param {Object} config - Configuratie
   * @param {boolean} config.useBackend - Of backend gebruikt moet worden
   */
  constructor(config) {
    this.config = config;
    this.processor = config.useBackend ? 
      new BackendImageProcessor() : 
      new ClientImageProcessor();
  }
  
  /**
   * Past een filter toe op een afbeelding
   * @async
   * @param {Image|string} image - Afbeelding of URL
   * @param {string} filterType - Type filter
   * @param {Object} params - Filterparameters
   * @returns {Promise<Image>} Bewerkte afbeelding
   */
  async applyFilter(image, filterType, params) {
    return this.processor.applyFilter(image, filterType, params);
  }
}
```

## Codestandaardisatie en Documentatie

### 1. JSDoc Conventies

Gebruik consistente JSDoc-commentaar voor alle belangrijke onderdelen:

```javascript
/**
 * Canvas component voor het visueel bewerken van gedichten op gevels.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.poemId - ID van het gedicht
 * @param {string} [props.initialBackgroundUrl] - Optionele URL naar een initiële gevel
 * @param {Function} props.onSave - Callback functie wanneer ontwerp wordt opgeslagen
 * 
 * @example
 * <Canvas 
 *   poemId="123" 
 *   initialBackgroundUrl="/images/gevel1.jpg" 
 *   onSave={handleSaveDesign} 
 * />
 */
```

### 2. Centrale Error Handling

```javascript
/**
 * @constant {Object} ErrorTypes
 * @description Types fouten in de applicatie
 */
export const ErrorTypes = {
  API: 'api_error',
  VALIDATION: 'validation_error',
  AUTH: 'auth_error',
  CANVAS: 'canvas_error',
};

/**
 * Centrale error handling functie
 * @param {Error} error - Opgevangen error
 * @param {string} [type=ErrorTypes.API] - Type fout
 * @param {Object} [context={}] - Context informatie
 * @returns {Object} Gestandaardiseerd error object
 */
export const handleError = (error, type = ErrorTypes.API, context = {}) => {
  console.error(`[${type}]`, error, context);
  
  return {
    type,
    message: getErrorMessage(error, type),
    details: context,
    timestamp: new Date().toISOString(),
  };
};
```

## Samenvatting van Architectuurpatronen

| Pattern | Toepassing | Voordeel |
|---------|------------|----------|
| **Facade** | API Services | Abstraheert externe API's voor eenvoudige toekomstige migratie |
| **Factory** | Canvas-elementen | Maakt dynamische creatie van verschillende elementen mogelijk |
| **Repository** | Data-toegang | Centraliseert data-operaties met caching |
| **Command** | Canvas-acties | Maakt undo/redo-functionaliteit mogelijk |
| **Strategy** | Rendering-opties | Flexibiliteit in weergavemethoden |
| **State** | Canvas-interactie | Scheidt verschillende interactiemodi |
| **Observer** | UI Updates | Reactief bijwerken van UI bij modelwijzigingen |
| **Adapter** | Backend-integratie | Vereenvoudigt overstap naar nieuwe backend |

## Conclusie

Deze architecturale benadering zorgt voor een robuuste, onderhoudbare applicatie die goed voorbereid is op toekomstige uitbreidingen. Door deze patronen te implementeren wordt de codebase flexibeler en beter gestructureerd, wat zowel ontwikkeling als onderhoud vergemakkelijkt.

Het volgen van deze richtlijnen zal bijdragen aan:
1. Betere onderhoudbaarheid door duidelijke scheiding van verantwoordelijkheden
2. Eenvoudigere uitbreidbaarheid voor nieuwe functionaliteiten
3. Vereenvoudigde migratie naar een Spring Boot backend
4. Betere testbaarheid van individuele componenten
5. Consistente foutafhandeling en gebruikerservaringen