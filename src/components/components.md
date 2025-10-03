# Components Directory

This directory contains all reusable UI components for the application, organized by function and feature.

## Directory Structure

### /Core

Core feature-specific components for the main functionality of the application.

- **/Canvas**: Components for the canvas editor to place poems on façades
    - Visual representation of poems
    - Text positioning and styling
    - Background management

- **/Collections**: Components for managing poem collections
    - Collection listings
    - Collection items
    - Collection creation and editing

- **/Recording**: Audio recording and playback components
    - Audio player with controls
    - Recording interface
    - Audio visualization

### /common

Generic UI elements used throughout the application.

- **Icon.jsx**: Centralized icon component for consistent icon usage
- Additional common components like loaders, tooltips, etc.

### /forms

Form components for user input.

- **FormField.jsx**: Reusable form field component
- **LoginForm.jsx**: Login form
- **SignupForm.jsx**: User registration form
- Authentication-related forms

### /search

Search interface components.

- **AltSearchBar.jsx**: Main search input component
- **SearchResults.jsx**: Search results display
- Filter controls and search options

### /system

System-related components for application status and maintenance.

- **ApiStatusCard.jsx**: Display API connection status
- Error boundaries, notifications, and status indicators

### /ui

Base UI building blocks used throughout the application.

- **/button**: Button components
    - **Button.jsx**: Base button component
    - **ActionButton.jsx**: Primary action button

## Component Design Principles

1. **Single Responsibility**: Each component should do one thing well
2. **Composability**: Components should be designed to work together
3. **Reusability**: Components should be reusable across the application
4. **Consistency**: Components should maintain consistent styling and behavior
5. **Testability**: Components should be easy to test in isolation

## Code Guidelines

- Use functional components with hooks
- Document components with JSDoc comments
- Include PropTypes for all components
- Keep components focused and small
- Extract complex logic to custom hooks