# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server on localhost:5173
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint for code quality checks
```

## High-Level Architecture

This is a React 19 + Vite 6 poetry visualization web application (gedichtgevel.nl) that allows users to search poems, create visual designs on building facades, and record audio readings.

### Tech Stack
- **React 19** with **React Router 7** (data router mode with JS object notation via `createBrowserRouter`)
- **Supabase** for authentication and future data storage
- **Pixi.js** for canvas rendering and poem visualization
- **WaveSurfer.js** for audio recording and playback
- **SCSS modules** for component styling
- **Axios** for API calls to PoetryDB
- **Dexie** for local IndexedDB storage
- **Framer Motion** for animations

### Core Architecture Patterns

1. **Layered Architecture for Authentication**:
   ```
   UI Components → useAuth → AuthContext → useSupabaseAuth → authService → Supabase Client
   ```
   Each layer has specific responsibilities for clean separation and easy Spring Boot migration.

2. **Service Layer Pattern**: All external API interactions are abstracted through services in `/src/services/`
   - `poetryApi.js` - Facade for poetry-related API calls with caching
   - `authService.js` - Stateless Supabase authentication wrapper
   - `audioStorageService.js` - Audio recording storage
   - `cacheService.js` - Centralized caching with TTL

3. **Custom Hooks Pattern**: Business logic is encapsulated in reusable hooks in `/src/hooks/`
   - `useAuth.js` - Enhanced auth methods with duplicate checking
   - `useAuthForm.js` - Form handling for auth flows
   - `useSupabaseAuth.js` - Stateful Supabase operations (only used in AuthProvider)
   - `useAudioRecorder.js` - Complete audio recording interface
   - `useCanvas.js` - Canvas manipulation and state
   - `usePoems.js` - Poem data fetching with caching
   - `useDebounce.js` - Performance optimization for search

4. **Advanced Design Patterns** (from ARCHITECTURE.md):
   - **Factory Pattern** for canvas elements creation
   - **Command Pattern** for undo/redo functionality
   - **Strategy Pattern** for different rendering methods
   - **State Machine** for canvas interaction modes
   - **Repository Pattern** for data access with caching

### Key Features & Components

#### Core Components (`/components/Core/`)
- **Canvas** - Interactive canvas with layers for poem visualization on facades
  - Text positioning and styling
  - Background image management
  - Export functionality
- **Recording** - Audio recording and playback
  - AudioPlayer with waveform visualization
  - RecordingsCard for management
  - AudioStreamControlButtons for controls

#### Form Components (`/components/forms/`)
- Consistent form handling with validation
- Login, Signup, Password Reset forms
- Reusable FormField component

#### Search System (`/components/search/`)
- Real-time fuzzy search with debouncing
- SearchBar with live feedback
- Expandable SearchResults display

### Authentication Architecture

The app implements a sophisticated multi-layered auth system optimized for future Spring Boot migration:

1. **authService** - Stateless API wrapper with consistent error handling
2. **useSupabaseAuth** - React-aware state management (isolated in AuthProvider)
3. **AuthContext/Provider** - Global auth state distribution
4. **useAuth** - Enhanced component-friendly interface with:
   - `signUpWithCheck` - Duplicate email validation
   - `requestPasswordResetEmail` - Password reset flow
   - `updateUserPasswordAfterReset` - Complete reset
   - `checkEmailExists` - Pre-validation

### Navigation & Routing

- **Protected Routes**: `ProtectedRoute` wrapper preserves navigation state
- **Route Structure**: Nested routing with App as root layout
- **Navigation State**: Preserves intended destination through login flows
- **Callback Handling**: `/auth/callback` for email confirmations

### API Integration Patterns

```javascript
// Service layer abstracts external APIs
const poetryApi = {
  searchPoems: async (searchTerm) => {
    // Check cache first
    const cached = await cacheService.get(`poems_${searchTerm}`);
    if (cached) return cached;
    
    // Fetch and cache
    const results = await poemService.searchByTitle(searchTerm);
    await cacheService.set(`poems_${searchTerm}`, results);
    return results;
  }
};
```

### Future Backend Integration

The architecture is specifically designed for Spring Boot migration:

1. **Minimal Changes Required**: Only service layer implementations change
2. **JWT Ready**: Token management infrastructure in place
3. **Consistent Interfaces**: All hooks and components remain unchanged
4. **Gradual Migration**: Feature flags support parallel implementations

Example migration:
```javascript
// Only authService.js changes for Spring Boot
export const login = async (email, password) => {
  // Change from Supabase to Spring Boot endpoint
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });
  // Same return format
};
```

## Development Guidelines

### Code Organization
- Components are organized by feature in `/components/`
- Shared utilities in `/utils/`
- API logic in `/services/`
- Reusable React logic in `/hooks/`
- Page containers in `/pages/`

### Best Practices
- Use SCSS modules (`.module.scss`) for component styling
- Follow existing JSDoc patterns for documentation
- Implement centralized error handling through services
- Use consistent return formats: `{success: boolean, data?: any, error?: string}`
- Place tests in `__tests__` directories next to the code
- Use `useDebounce` for search/filter operations

### State Management Decision Tree
```
Need UI updates? → Use hooks (useAuth, usePoems, etc.)
Utility function? → Use service directly
Global state? → Use Context
Local state? → Use useState in component
```

### Error Handling Pattern
```javascript
const result = await someAuthFunction();
if (result.success) {
  // Handle success
} else {
  // Display result.error to user
}
```

### Canvas Development
- Use Factory pattern for creating elements
- Implement Command pattern for user actions
- Separate rendering strategies for flexibility
- Layer-based approach for complex compositions