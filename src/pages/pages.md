# Pages Directory

This directory contains page components, which serve as containers for the main views of the application.

## Page Organization

Each page is organized in its own directory with related components and tests:

### /About
- **AboutPage.jsx**: About page component with project information
- Description of the project, its goals, and contributors
- Includes static content and potentially dynamic elements

### /Account
- **AccountPage.jsx**: User account management
- User profile information and settings
- Account-specific actions and data

### /Audio
- **AudioPage.jsx**: Audio recording and playback interface
- Recording poem readings
- Managing and playing back recordings

### /Collections
- **CollectionPage.jsx**: User poem collections
- Creating, viewing, and managing collections
- Adding and removing poems from collections

### /Design
- **DesignPage.jsx**: Canvas design interface for poem visualization
- Visual editor for placing poems on façades
- Text styling and positioning tools

### /Home
- **HomePage.jsx**: Main landing page
- Featured poems and content
- Navigation to key application features

### /LoginAndSignup
- **LoginAndRegisterPage.jsx**: Authentication page
- Login and registration forms
- Password reset functionality

## Page Structure Guidelines

Each page should follow these structural guidelines:

1. **Component Organization**:
   - Pages should import and compose smaller components
   - Complex UI logic should be delegated to child components

2. **Data Fetching**:
   - Pages should handle data fetching through hooks
   - Loading and error states should be managed at the page level

3. **Route Parameters**:
   - Pages should handle route parameters and query strings
   - Dynamic content based on URL parameters

4. **Layout Integration**:
   - Pages should integrate with the main application layout
   - Pages should not include global layout elements (header, footer, etc.)

5. **Authentication**:
   - Pages should respect authentication requirements
   - Protected pages should be wrapped with ProtectedRoute

## Testing

Each page directory includes a `__tests__` folder for page-specific tests:

- Component rendering tests
- Integration tests for page functionality
- User interaction simulations

## Routing

Pages are integrated into the application through the routing system in `App.jsx`. All route definitions should be centralized there for better maintainability.