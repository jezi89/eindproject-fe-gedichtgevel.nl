# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linting
pnpm run lint
pnpm run lint:css

# Preview production build
pnpm run preview

# Run knip (unused code detection)
pnpm run knip
```

## Architecture Overview

This is a **React 19** application built with **Vite** for interactive poem visualization, audio recording, and user account management. The application combines poetry from PoetryDB API with:
- **Canvas Design System** - Interactive text placement on facade images (Pixi.js)
- **Audio Recording** - Record poem readings with waveform visualization (WaveSurfer.js)
- **Collections & Favorites** - User poem collections and favorites management
- **Account Management** - User profiles, settings, and activity statistics

### Key Technologies
- **React 19** with React Router 7
- **TanStack Query v5** for server state management and caching
- **Vite** as build tool
- **Supabase** for authentication and data storage
- **Pixi.js** for canvas rendering
- **WaveSurfer.js** for audio visualization
- **Axios** for API requests
- **Dexie** for local IndexedDB storage (canvas designs only)
- **SCSS modules** for styling (NOT CSS - always use .scss extension)

### Directory Structure

```
src/
├── components/         # UI components organized by feature
│   ├── Core/          # Core functionality
│   │   ├── Canvas/    # Canvas design editor (Pixi.js)
│   │   └── Recording/ # Audio recording interface (WaveSurfer.js)
│   ├── account/       # Account management components
│   │   ├── AccountNav.jsx
│   │   ├── FavoritesSection.jsx
│   │   ├── SettingsSection.jsx
│   │   └── StatsSection.jsx
│   ├── forms/         # Form components with validation
│   ├── search/        # Search interface components
│   ├── poem/          # Poem display components
│   ├── daily/       # Monthly featured poems
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks for business logic
│   ├── account/       # Account-related hooks (favorites, stats, settings)
│   ├── auth/          # Authentication hooks
│   ├── canvas/        # Canvas manipulation hooks
│   ├── record/        # Audio recording hooks
│   ├── search/        # Search orchestration hooks
│   └── poem/          # Poem display logic hooks
├── services/          # API clients and external integrations
│   ├── api/           # Axios-based API services
│   ├── auth/          # Supabase authentication
│   ├── storage/       # Audio storage service
│   ├── canvas/        # Canvas data persistence (Dexie)
│   ├── favorites/     # Favorites CRUD operations
│   ├── stats/         # User statistics service
│   ├── settings/      # User settings service
│   └── supabase/      # Supabase client configuration
├── context/           # React Context for global state
│   └── auth/          # AuthProvider for authentication state
├── pages/             # Page components for routing
│   ├── Home/          # Landing page
│   ├── Design/        # Canvas design page (DesignPage.jsx)
│   ├── Audio/         # Audio recording page (AudioPage.jsx)
│   ├── Collections/   # Collections overview
│   ├── Account/       # Account management page
│   ├── Auth/          # Login/Signup/Password reset pages
│   ├── About/         # About page
│   ├── Contact/       # Contact page
│   ├── FAQ/           # FAQ page
│   └── Terms/         # Terms page
└── utils/             # Utility functions
```

### Path Aliases
- `@` → `./src`
- `@styles` → `./src/styles`

## Core Architecture Patterns

### TanStack Query for Server State
All server data fetching uses TanStack Query for automatic caching, refetching, and state management:
- Configured in `main.jsx` with `QueryClientProvider`
- L1 cache (memory) + L2 cache (localStorage persistence)
- Default `staleTime`: 5 minutes, `gcTime`: 24 hours
- DevTools available for debugging queries

Example usage:
```jsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['poems', searchBy, query],
  queryFn: () => searchPoemsByTitle(query),
  enabled: !!query,
  staleTime: 1000 * 60 * 5, // 5 minutes
});

// Data mutation
const { mutate } = useMutation({
  mutationFn: (poemData) => addFavoritePoem(userId, poemData),
  onSuccess: () => {
    queryClient.invalidateQueries(['favoritePoems', userId]);
  },
});
```

### Service Layer Pattern
All API interactions go through service modules in `/services/`:
- **API Services:**
  - `api/poemService.js` - Direct PoetryDB API calls (title, author, linecount searches)
  - `api/poemSearchService.js` - Advanced search logic and optimization
  - `api/axios.js` - Configured Axios instance
- **Authentication:**
  - `auth/authService.js` - Supabase authentication wrapper
- **Storage:**
  - `storage/audioStorageService.js` - Audio file uploads to Supabase Storage
  - `canvas/canvasDataService.js` - Canvas design persistence (Dexie IndexedDB)
- **User Data:**
  - `favorites/favoritesService.js` - Favorites CRUD (Supabase)
  - `stats/userStatsService.js` - User activity statistics (Supabase)
  - `settings/userSettingsService.js` - Account settings (Supabase)

### Custom Hooks Pattern
Business logic is encapsulated in custom hooks:
- **Authentication:** `useAuth()` - Authentication state and methods
- **Search:** `useSearchPoems()` - Poem data fetching with TanStack Query
- **Account:**
  - `useFavorites()` - Favorites management (poems & authors)
  - `useUserStats()` - Activity statistics and analytics
  - `useUserSettings()` - Account settings, theme, notifications
- **Audio:** `useWaveSurfer()` - Audio recording functionality
- **Canvas:**
  - `useCanvasStorage()` - Local design persistence
  - `useSelection()`, `useTextStyles()`, `useFontManager()` - Canvas manipulation

### Context-Based State Management
Global state managed through React Context:
- `AuthContext` + `AuthProvider` for authentication state
- `RecordingContext` for audio recording state (Controls, Time, Countdown)

### Local vs Server State Separation
**Server State (TanStack Query):**
- ✅ Poem search results from PoetryDB API
- ✅ User favorites (Supabase)
- ✅ User statistics (Supabase)
- ✅ User settings (Supabase)

**Client State (NOT TanStack Query):**
- ✅ Canvas designs (Dexie IndexedDB - large binary data)
- ✅ UI preferences (localStorage)
- ✅ Authentication state (AuthContext)
- ✅ Canvas editor state (selection, transforms)

## Key Features Implementation

### 1. Canvas Design System (`/components/Core/Canvas/`)
Interactive visual editor for placing poems on facade images:
- **Pixi.js rendering** - Hardware-accelerated text rendering
- **Controls** - Font styling, positioning, layout, 3D transforms
- **Background management** - Photo selection from Flickr/Pexels APIs
- **Responsive layout** - Adapts to screen size changes
- **Export functionality** - Save designs as images
- **Local persistence** - Dexie IndexedDB storage for user designs

**Key Components:**
- `Canvas.jsx` - Main canvas component with Pixi.js integration
- `Controls.jsx` - Unified control panel
- `controls/FontControls.jsx`, `controls/LayoutControls.jsx`, `controls/BackgroundControls.jsx`
- `FloatingPhotoGrid.jsx` - Background image selector
- `SaveDesignButton.jsx` - Design export functionality

**Key Hooks:**
- `useCanvasStorage()` - Local design save/load (Dexie)
- `useSelection()` - Element selection state
- `useTextStyles()` - Text styling state
- `useFontManager()` - Google Fonts loading
- `useKeyboardShortcuts()` - Keyboard navigation

### 2. Audio Recording System (`/components/Core/Recording/`)
"Spreekgevel" feature for recording poem readings:
- **MediaRecorder API** - Browser-native audio recording
- **WaveSurfer.js** - Real-time waveform visualization
- **Supabase Storage** - Audio file uploads
- **Timer system** - Recording duration tracking with direct DOM updates
- **Countdown** - 3-2-1 countdown before recording starts

**Key Components:**
- `RecordingBook.jsx` - Main recording interface
- `ui/AudioControls.jsx` - Play/Pause/Stop controls
- `ui/AltSearchBar.jsx` - Search bar for poem selection
- `layout/TopNavigation.jsx` - Navigation header
- `context/RecordingContext.js` - Recording state management (ControlsContext, TimeContext, CountdownContext)

**Key Hooks:**
- `useWaveSurfer.js` - Audio recording and playback logic

**Implementation Notes:**
- Uses direct DOM manipulation for timer display to avoid React re-renders during recording
- Countdown uses RAF (requestAnimationFrame) for smooth animation
- Audio stored in Supabase Storage with metadata linking to user

### 3. Account Management System (`/components/account/`)
User profile, favorites, statistics, and settings:

**A. Favorites Management**
- Add/remove favorite poems and authors
- Check if poem/author is favorited
- Display favorites list with poem details

**B. User Statistics**
- Total favorite poems and authors count
- Top favorited authors
- Recent activity timeline
- Monthly activity tracking (last 6 months)
- Favorite themes/topics analysis

**C. Settings**
- Display name customization
- Email notifications toggle
- Theme preference (dark/light)
- Password change
- Account deletion (with confirmation)
- Data export (GDPR compliance - JSON download)

**Key Hooks:**
- `useFavorites()` - Favorites CRUD operations with optimistic updates
- `useUserStats()` - Statistics fetching and formatting
- `useUserSettings()` - Settings management with auto-save feedback

**Key Services:**
- `favorites/favoritesService.js` - Supabase favorites operations
- `stats/userStatsService.js` - Statistics aggregation from Supabase
- `settings/userSettingsService.js` - Settings CRUD and account operations

### 4. Search System (`/components/search/`)
Real-time poem search with debouncing:
- **Search orchestration** - `useSearchOrchestration()` manages search state
- **Search execution** - `useSearchPoems()` uses TanStack Query for caching
- **Fuzzy search** - Implemented in `poemSearchService.js`
- **Results display** - Expandable poem cards with carousel navigation
- **Filter panel** - Search by title, author, or line count

**Key Components:**
- `Searchbar.jsx` - Main search input with debouncing
- `SearchResults.jsx` - Results grid with pagination
- `SearchLoadingState.jsx` - Loading skeleton
- `SearchErrorBoundary.jsx` - Error handling
- `ResultsOverview.jsx` - Results summary
- `CarrouselArrows.jsx`, `CarrouselDots.jsx` - Navigation controls

**Key Hooks:**
- `useSearchPoems()` - TanStack Query wrapper for search
- `useSearchOrchestration()` - Search state coordination
- `useSearchLayout()` - UI layout state

### 5. Collections System
User-created poem collections (currently basic implementation):
- Collection overview page
- My Designs page (protected route)
- Future: Full CRUD for collections

## Environment Setup

### Required Environment Variables
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration
**Authentication:**
- Email/password authentication
- Email confirmation flow (using Resend SMTP)
- Password reset functionality
- AuthCallback at `/auth/callback` route

**Email Setup (Resend + Custom Domain):**
- Domain: `gedichtgevel.nl` (Hostinger)
- Email Service: Resend SMTP integration
- From Address: `no-reply@gedichtgevel.nl`
- Confirmation flow: User receives email → clicks link → redirects to `/auth/callback`

**Database Tables:**
- `user_favorite_poems` - User's favorite poems
- `user_favorite_authors` - User's favorite authors
- `user_settings` - User preferences and settings
- `user_stats` - User activity statistics

**Storage Buckets:**
- `audio-recordings` - User-recorded audio files

**Important Notes:**
- Check `user.confirmed_at` to verify email confirmation
- Email confirmation tokens expire after set duration
- Protected routes use `<ProtectedRoute>` wrapper component

## Styling Guidelines

### SCSS Usage
- **ALWAYS use `.scss` extension**, never `.css`
- Component styles use SCSS modules: `ComponentName.module.scss`
- Import styles as: `import styles from './ComponentName.module.scss'`
- Global styles are in `/src/styles/` directory
- Use SCSS features: variables (`_variables.scss`), mixins (`_mixins.scss`), nesting

### File Structure
```
src/
├── styles/           # Global SCSS files
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _reset.scss
│   └── App.scss
└── components/
    └── Example/
        ├── Example.jsx
        └── Example.module.scss  # Component-specific styles
```

## Routing Structure

Using React Router 7 with `createBrowserRouter`:
```
/                       → HomePage
/designgevel           → DesignPage (canvas editor)
/designgevel/:poemId   → DesignPage with pre-loaded poem
/spreekgevel           → AudioPage (recording interface)
/collectiegevel        → CollectionPage
/mijn-designs          → MyDesignsPage (protected)
/account               → AccountPage (protected)
/welkom                → LoginAndSignupPage
/login                 → LoginAndSignupPage
/password-reset        → PasswordResetPage
/reset-password        → ResetPasswordPage
/auth/callback         → AuthCallback (email confirmation)
/overmij               → AboutPage
/contact               → ContactPage
/hoedan                → FAQPage
/voorwaarden           → TermsPage
```

## Testing Strategy
- Component tests in `__tests__` directories
- No specific test framework configured yet - check `package.json` before adding tests
- Vitest and Playwright are installed as dev dependencies

## Data Flow Patterns

### 1. Poem Search Flow
```
User types in SearchBar
  ↓ (debounce 300ms)
useSearchPoems hook
  ↓
TanStack Query checks cache
  ↓ (cache miss)
poemService.searchPoemsByTitle()
  ↓
Axios → PoetryDB API
  ↓
TanStack Query caches result
  ↓
Component receives data
```

### 2. Favorites Flow
```
User clicks "Add to Favorites"
  ↓
useFavorites.addPoem()
  ↓
Optimistic update (immediate UI change)
  ↓
favoritesService.addFavoritePoem()
  ↓
Supabase INSERT
  ↓ (success)
TanStack Query invalidates ['favoritePoems']
  ↓
UI refetches and syncs with server
```

### 3. Canvas Design Flow
```
User designs on canvas
  ↓
User clicks "Save Design"
  ↓
useCanvasStorage.saveDesign()
  ↓
canvasDataService.saveCanvas()
  ↓
Dexie IndexedDB (local storage)
  ↓
Toast notification "Design saved!"
```

### 4. Audio Recording Flow
```
User selects poem
  ↓
User clicks record button
  ↓
3-2-1 countdown (RAF animation)
  ↓
MediaRecorder starts
  ↓
WaveSurfer visualizes waveform
  ↓
User clicks stop
  ↓
Blob created
  ↓
audioStorageService.uploadRecording()
  ↓
Supabase Storage upload
  ↓
Metadata saved to database
```

## Important Implementation Notes

1. **Authentication Flow**: All auth operations go through Supabase via `authService.js`
2. **API Abstraction**: Use service layer instead of direct API calls
3. **State Management**:
   - TanStack Query for server state
   - React Context for auth state
   - Hooks for component state
4. **Error Handling**: Centralized error handling in services layer with consistent response format: `{ success: boolean, data?: any, error?: string }`
5. **Styling**: SCSS modules for component-specific styles, global styles in `/styles/`
6. **Performance**:
   - TanStack Query automatic request deduplication
   - Debounced search input (300ms)
   - Direct DOM updates for recording timer (no React re-renders)
7. **Data Persistence**:
   - Server data → TanStack Query cache (auto-managed)
   - Large binary data (canvas designs) → Dexie IndexedDB
   - Small UI preferences → localStorage
8. **Type Safety**: PropTypes used for component validation (future: consider migrating to TypeScript)

## Migration Status

This project is currently migrating from custom cache services to TanStack Query:
- ✅ TanStack Query installed and configured
- ✅ QueryClientProvider setup in `main.jsx`
- 🔄 In progress: Migrating hooks to use `useQuery`/`useMutation`
- 📋 TODO: Remove deprecated `apiCacheService.js` and `searchCacheService.js`
- 📋 TODO: Clean up Dexie config to only include `canvasPoems` table

## Future Backend Integration
The architecture uses Repository and Facade patterns to ease future migration from PoetryDB to a custom Spring Boot backend. API services are abstracted to allow endpoint changes without affecting components.

## Debugging Tips

### TanStack Query DevTools
Add to your component tree for debugging:
```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### Common Issues
- **Stale data showing**: Check `staleTime` and `gcTime` configuration
- **Too many requests**: Ensure `queryKey` is stable and not changing on every render
- **Cache not persisting**: Verify `PersistQueryClientProvider` is configured correctly
- **Authentication issues**: Check Supabase configuration and email confirmation status
- **Canvas not saving**: Verify Dexie is initialized correctly in `dexieConfig.js`
- **Audio recording failing**: Check browser microphone permissions

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
