# gedichtgevel.nl - Frontend Template Project

A structured React application template for interactive poetry visualization and audio recording.

## Project Overview

This template project provides the structure and documentation for gedichtgevel.nl, a platform that allows users to:

- Search and browse poems from PoetryDB
- Create visual representations of poems on building facades using Canvas
- Record audio readings of poems
- Save poems to personal collections
- Manage user accounts and authentication

For a detailed architectural overview and implementation patterns, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Template Purpose

This template is designed as a learning and development exercise. It contains:

- Complete directory structure following React best practices
- Detailed JSDoc documentation for all components, hooks, and services
- Implementation placeholders that describe functionality without code
- Architectural patterns and guidelines for building the application

By starting with this template, you can:

1. Understand the architecture of a complex React application
2. Implement features by following the documentation
3. Learn how to organize code in a maintainable way
4. Practice implementing features from documentation

## Technology Stack

- **React 19**: Modern component-based UI
- **Vite**: Fast build tooling
- **React Router 7**: Client-side routing
- **Supabase**: Authentication and data storage
- **WaveSurfer.js**: Audio visualization
- **Pixi.js**: Canvas rendering

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gedichtgevel-frontend-template.git
   cd gedichtgevel-frontend-template
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Comprehensive Project Architecture

### Components (`/src/components/`)

The components directory is organized by function and feature:

#### Core Components

**Canvas Components** (`/components/Core/Canvas/`)

- **Canvas.jsx**: Interactive canvas for poem visualization
    - Manages text positioning and styling on facades
    - Handles background image management
    - Provides export functionality
    - Implements an interface with props like `poemId`, `initialBackgroundUrl`, and `onSave`

**Recording Components** (`/components/Core/Recording/`)

- **AudioPlayer.jsx**: Complete audio playback interface
    - Play/pause/stop controls
    - Progress tracking
    - Waveform visualization
    - Volume controls
- **RecordingsCard.jsx**: Display and management of recordings

#### Form Components (`/components/forms/`)

- **FormField.jsx**: Reusable form input component with validation
- **LoginForm.jsx**: User authentication form
- **SignupForm.jsx**: User registration form

#### Search Components (`/components/search/`)

- **SearchBar.jsx**: Search interface with real-time feedback
- **SearchResults.jsx**: Display of poem search results with expandable details

#### UI Components (`/components/ui/`)

- **Button.jsx**: Base button component
- **ActionButton.jsx**: Specialized buttons for different actions

### Hooks (`/src/hooks/`)

Custom React hooks that encapsulate reusable logic:

#### Authentication Hooks

- **useAuth.js**: Access authentication state and methods
- **useAuthForm.js**: Manage authentication form state and validation

#### API Hooks

- **useApiHealth.js**: Monitor API connection status
- **usePoems.js**: Fetch and manage poem data

#### Feature-specific Hooks

- **useAudioRecorder.js**: Audio recording functionality
    - Provides methods for starting/stopping recording
    - Manages recording state and timing
    - Handles audio processing and storage
    - Returns comprehensive recording interface
- **useCanvas.js**: Canvas manipulation for poem visualization

#### Utility Hooks

- **useLocalStorage.js**: Persistent browser storage
- **useDebounce.js**: Debounce rapidly changing values

### Services (`/src/services/`)

Service modules that handle external interactions and business logic:

#### API Services

- **poetryApi.js**: Central facade for poetry-related API calls
- **poemService.js**: Direct API calls to PoetryDB
- **poemSearchService.js**: Advanced search functionality

#### Authentication

- **authService.js**: Supabase authentication methods

#### Storage

- **audioStorageService.js**: Audio recording storage and retrieval

#### Monitoring

- **checkPoetryDbHealth.js**: API health monitoring

### Pages (`/src/pages/`)

Page components serving as containers for main views:

- **HomePage.jsx**: Main landing page with search
- **LoginAndSignupPage.jsx**: Authentication page
- **AccountPage.jsx**: User profile and settings
- **AudioPage.jsx**: Audio recording interface
- **CollectionPage.jsx**: Poem collections management
- **DesignPage.jsx**: Canvas design interface

### Context (`/src/context/`)

React Context providers for application-wide state:

- **AuthContext.jsx**: Authentication context definition
- **AuthProvider.jsx**: Authentication state provider

### Utils (`/src/utils/`)

Utility functions used throughout the application:

- **authUtils.js**: Authentication helper functions
- **fuzzySearch.js**: Advanced search algorithms

## Architectural Patterns

The application follows these architectural principles:

### 1. Component-Based Architecture

- UI decomposed into reusable components
- Hierarchical component organization
- Component-specific styles using CSS modules

### 2. Custom Hook Pattern

- Business logic extracted into custom hooks
- Separation of concerns between UI and logic
- Reusable stateful logic across components

### 3. Service Layer Pattern

- External interactions isolated in service modules
- Centralized error handling
- Abstraction of API details

### 4. Context-Based State Management

- Application-wide state managed with Context API
- Providers encapsulate state logic
- Custom hooks for consuming context

### 5. Repository Pattern

- Data access abstracted through repository-like services
- Consistent interface for data operations
- Caching and optimization strategies

## Implementation Guidelines

When implementing features based on this template:

1. **Start with Services**: Implement the API and service layer first
2. **Implement Hooks**: Build custom hooks that use the services
3. **Build Components**: Create UI components that consume the hooks
4. **Assemble Pages**: Combine components into full pages
5. **Add Context**: Implement application-wide state as needed

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## Design Principles

1. **Separation of Concerns**: Logic separated from UI
2. **Single Responsibility**: Each module does one thing well
3. **DRY (Don't Repeat Yourself)**: Reuse code through abstraction
4. **KISS (Keep It Simple, Stupid)**: Simple solutions over complex ones
5. **Progressive Enhancement**: Core functionality first, enhancements second

## License

[MIT License](LICENSE)