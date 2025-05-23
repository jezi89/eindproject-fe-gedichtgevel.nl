# Context Directory

This directory contains React Context providers and consumers for managing application-wide state.

## Authentication Context

### /auth/AuthContext.jsx
- Defines the authentication context and associated hook
- Provides default values and type definitions

### /auth/AuthProvider.jsx
- Implements the authentication provider with Supabase
- Manages user sessions, login, registration, and logout
- Handles authentication state changes

## Context Design

The context implementation follows these principles:

1. **Separation of Definition and Implementation**:
   - Context definitions are separate from their providers
   - This allows for easier testing and mocking

2. **Custom Hooks for Consumption**:
   - Each context has an associated custom hook (e.g., `useAuthContext`)
   - Provides type safety and error checking for context consumption

3. **Error Handling**:
   - Contexts include error states and handling
   - Proper error propagation and user feedback

4. **Performance Optimization**:
   - Contexts are designed to minimize unnecessary re-renders
   - State is properly memoized where needed

## Usage Examples

### AuthContext Usage

```jsx
// In a component:
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user, loading, error, signOut } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={signOut}>Log Out</button>
    </div>
  );
}
```

## Future Context Extensions

As the application grows, additional contexts may be added for:

- **ThemeContext**: Application theming and appearance
- **NotificationContext**: Global notification management
- **SettingsContext**: User preferences and settings

Each new context should follow the established patterns and guidelines to maintain consistency across the application.