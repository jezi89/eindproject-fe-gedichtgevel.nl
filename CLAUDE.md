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

# Preview production build
pnpm run preview
```

## Architecture Overview

This is a React 19 application built with Vite for poem visualization and audio recording. The application combines poetry from PoetryDB, interactive canvas for facade design, and audio recording capabilities.

### Key Technologies
- **React 19** with React Router 7
- **Vite** as build tool
- **Supabase** for authentication and data storage
- **Pixi.js** for canvas rendering
- **WaveSurfer.js** for audio visualization
- **Axios** for API requests
- **SCSS modules** for styling (NOT CSS - always use .scss extension)

### Directory Structure

```
src/
├── components/         # UI components organized by feature
│   ├── Core/          # Core functionality (Canvas, Recording)
│   ├── forms/         # Form components with validation
│   ├── search/        # Search interface components
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks for business logic
├── services/          # API clients and external integrations
│   ├── api/           # Axios-based API services
│   ├── auth/          # Supabase authentication
│   └── storage/       # Audio storage service
├── context/           # React Context for global state
├── pages/             # Page components for routing
└── utils/             # Utility functions
```

### Path Aliases
- `@` → `./src`
- `@styles` → `./src/styles`

## Core Architecture Patterns

### Service Layer Pattern
All API interactions go through service modules in `/services/`:
- `poetryApi.js` - Central facade for poetry operations
- `poemService.js` - Direct PoetryDB API calls
- `authService.js` - Supabase authentication wrapper

### Custom Hooks Pattern
Business logic is encapsulated in custom hooks:
- `useAuth()` - Authentication state and methods
- `usePoems()` - Poem data fetching and caching
- `useAudioRecorder()` - Audio recording functionality
- `useCanvas()` - Canvas manipulation logic

### Context-Based State Management
Global state managed through React Context:
- `AuthContext` + `AuthProvider` for authentication state

## Key Features Implementation

### Canvas System
- Interactive text placement on facade images (`/components/Core/Canvas/`)
- Uses Pixi.js for rendering
- Supports text styling and positioning
- Export functionality for designs

### Audio Recording
- Recording interface in `AudioPlayer` components
- Uses browser MediaRecorder API
- Waveform visualization with WaveSurfer.js
- Storage through Supabase

### Poetry Search
- Real-time search with debouncing (`useDebounce` hook)
- Fuzzy search implementation in utils
- Results displayed with expandable details

## Environment Setup
Requires `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Integration with Claude Code
To integrate Supabase environment variables with Claude Code:
1. Create a `.env` file in the project root
2. Add your Supabase credentials (never commit this file)
3. Claude Code will automatically read these environment variables

### Email Configuration (Resend + Custom Domain)
The project uses Resend SMTP with gedichtgevel.nl domain for authentication emails:
- **Domain**: gedichtgevel.nl (registered at Hostinger)
- **Email Service**: Resend SMTP integration
- **From Address**: no-reply@gedichtgevel.nl
- **Redirect URLs**: Configure in Supabase dashboard for email confirmations

#### Important Email Confirmation Considerations:
1. **Email Confirmation Flow**: Users receive confirmation email after signup
2. **Pending Confirmation State**: Check `user.confirmed_at` to verify email confirmation
3. **Token Handling**: Email links contain confirmation tokens that expire
4. **Redirect After Confirmation**: Set to `/auth/callback` route

## Testing Strategy
- Component tests should be placed in `__tests__` directories
- No specific test framework is configured yet - check package.json before adding tests

## Important Implementation Notes

1. **Authentication Flow**: All auth operations go through Supabase via `authService.js`
2. **API Abstraction**: Use `poetryApi.js` facade instead of direct API calls
3. **State Management**: Use Context for global state, hooks for component state
4. **Error Handling**: Centralized error handling in services layer
5. **Styling**: SCSS modules for component-specific styles (.module.scss), global styles in `/styles/`

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

## Future Backend Integration Preparation
The architecture uses Repository and Facade patterns to ease future migration from PoetryDB to a Spring Boot backend. API services are abstracted to allow endpoint changes without affecting components.