# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server on localhost:5173
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint for code quality checks
```

## High-Level Architecture

This is a React 19 + Vite 6 poetry visualization web application (gedichtgevel.nl) that allows users to search poems, create visual designs on building facades, and record audio readings.

### Notes
- We use pnpm. If npm is not required, use pnpm commands.

### Tech Stack
- **React 19** with **React Router 7** (data router mode with JS object notation via `createBrowserRouter`)
- **Supabase** for authentication and future data storage
- **Pixi.js** for canvas rendering and poem visualization
- **WaveSurfer.js** for audio recording and playback
- **SCSS modules** for component styling
- **Axios** for API calls to PoetryDB
- **Dexie** for local IndexedDB storage
- **Framer Motion** for animations

[Rest of the file remains the same as in the original content]