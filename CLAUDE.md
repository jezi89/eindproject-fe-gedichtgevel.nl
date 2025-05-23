# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project is a React application built with Vite that serves as a poetry platform with audio recording/playback capabilities and poem collections. It features user authentication via Supabase, poem search functionality, and an audio interface for recording and playback.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run Storybook for component development
npm run storybook

# Build Storybook
npm run build-storybook

# Run tests (if implemented)
npm run test
```

## Architecture Overview

### Core Structure

- **React 19** with **React Router 7** for routing
- **Supabase** for authentication and data storage
- **WaveSurfer.js** for audio processing
- **Pixi.js** for canvas/graphics

### Key Components

The project follows a modular architecture with clear separation of concerns:

1. **Authentication System**
   - Implemented with Supabase
   - `AuthContext` and `AuthProvider` manage auth state
   - Protected routes for authenticated users

2. **Audio Interface**
   - `AudioPlayer` components for playback
   - `useAudioRecorder` hook for recording functionality
   - `audioStorageService` for storage integration

3. **Poetry Collections & Search**
   - Integration with PoetryDB API
   - Search with intelligent term analysis
   - Filtering by author, language, theme

4. **Services Layer**
   - API interactions isolated in service modules
   - `poetryApi.js` for PoetryDB interactions
   - `supabaseClient.js` for Supabase operations

### Core Patterns

- **Custom hooks** for reusable logic (useAuth, usePoems, useCanvas)
- **Context API** for state management
- **Service modules** for external API interactions
- **Component composition** pattern for UI organization

## File Structure Highlights

- `src/components/Core` - Main feature components
- `src/hooks` - Custom React hooks
- `src/services` - API and data services
- `src/context` - React contexts (auth, etc.)
- `src/pages` - Page components
- `src/layouts` - Layout components (Navbar, etc.)

## Important Implementation Details

1. **Authentication Flow**:
   - Uses Supabase JWT tokens
   - Session persistence with localStorage
   - Protected routes require valid auth state

2. **API Integration**:
   - PoetryDB for poem data
   - Health check monitoring for API status

3. **Audio Processing**:
   - Recording saved to Supabase storage
   - Custom player controls with WaveSurfer integration