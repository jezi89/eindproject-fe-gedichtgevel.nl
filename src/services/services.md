# Services Directory

This directory contains service modules that handle external interactions and business logic separated from the UI.

## Service Categories

### API Services

- **/api/axios.js**: Configured Axios instance for API requests
  - Base configuration with interceptors
  - Request/response handling

- **/api/poemService.js**: Basic API calls for poem data
  - Direct calls to PoetryDB API
  - Single-responsibility methods

- **/api/poemSearchService.js**: Advanced search functionality
  - Intelligent search term analysis
  - Multi-field search and filtering
  - Search optimization and combination strategies

### Authentication

- **/auth/authService.js**: Authentication service methods
  - Login, register, logout functionality
  - Token management

### Storage

- **/storage/audioStorageService.js**: Service for audio storage
  - Saving recorded audio to Supabase
  - Retrieving user recordings
  - Managing audio metadata

### Data Access

- **/dataAccess/collectionsService.js**: Service for collections data
  - CRUD operations for user collections
  - Collection membership management

### Third-party Integrations

- **/supabase/supabaseclient.js**: Supabase client configuration
  - Authentication setup
  - Database and storage access

### Error Handling and Monitoring

- **/error-tracking/errorService.js**: Error tracking service
  - Centralized error handling
  - Error logging and reporting
  - User-friendly error messages

- **/monitoring/checkPoetryDbHealth.js**: API health monitoring
  - Checks availability of PoetryDB API
  - Provides health status information

### Caching

- **cacheService.js**: Client-side caching service
  - In-memory cache for API responses
  - Cache invalidation and expiry

## Design Principles

1. **Abstraction**: Services abstract complex operations into simple interfaces
2. **Single Responsibility**: Each service has a specific focus
3. **Separation of Concerns**: Separate data access from business logic
4. **Error Handling**: Centralized error handling and reporting
5. **Reusability**: Services are designed to be reused throughout the application

## Architecture Benefits

- **Testability**: Services can be easily mocked for testing
- **Maintainability**: Changes to external APIs are isolated to service modules
- **Consistency**: Consistent patterns for accessing external resources
- **Extensibility**: Adding new data sources or APIs is simplified
- **Performance**: Centralized location for optimizations like caching