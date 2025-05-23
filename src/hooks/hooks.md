# Hooks Directory

This directory contains custom React hooks that encapsulate reusable logic throughout the application.

## Available Hooks

### Authentication

- **useAuth.js**: Hook for accessing authentication state and methods
  - Provides access to the current user, login/logout methods
  - Wraps AuthContext for easier consumption

- **useAuthForm.js**: Hook for managing authentication form state
  - Form values, errors, and submission state
  - Form action creation for login/signup

### API and Data

- **useApiHealth.js**: Hook for monitoring API health status
  - Checks connection to PoetryDB
  - Provides API status information

- **usePoems.js**: Hook for fetching and managing poem data
  - Searching poems by title/author
  - Fetching poem details

- **useAuthors.js**: Hook for fetching and managing author data
  - Author listing and search functionality

### Storage and Collections

- **useCollections.js**: Hook for managing user poem collections
  - CRUD operations for collections
  - Adding/removing poems to collections

- **useLocalStorage.js**: Hook for persistent browser storage
  - Wrapper around localStorage with type safety
  - Serialization/deserialization handling

### Audio Features

- **useAudioRecorder.js**: Hook for audio recording functionality
  - Recording state management
  - Media recording API integration
  - Audio blob creation

### Canvas Features

- **useCanvas.js**: Hook for canvas operations
  - Managing canvas elements
  - Text positioning and styling
  - Canvas export functionality

### Utility Hooks

- **useDebounce.js**: Hook for debouncing rapidly changing values
  - Used for search input optimization
  - Prevents excessive API calls

## Usage Guidelines

1. **Separation of Concerns**: Hooks should separate logic from UI components
2. **Reusability**: Hooks should be designed for reuse across the application
3. **Error Handling**: Hooks should include proper error handling
4. **Performance**: Hooks should be optimized for performance (memoization, etc.)
5. **Documentation**: Use JSDoc to document hooks' parameters and return values

## Example Usage

```jsx
// Using the useAuth hook
import { useAuth } from '../hooks/useAuth';

function ProfileComponent() {
  const { user, loading, error, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```