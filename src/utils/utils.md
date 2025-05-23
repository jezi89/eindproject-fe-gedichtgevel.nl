# Utils Directory

This directory contains utility functions and helpers that are used throughout the application.

## Available Utilities

### Authentication Utilities

- **authUtils.js**: Helper functions for authentication-related operations
  - JWT token processing
  - Session management helpers
  - Authentication validation functions

### Search Utilities

- **fuzzySearch.js**: Advanced search algorithms and utilities
  - Levenshtein distance calculation
  - Fuzzy matching for improved search results
  - Text highlighting for search results
  - Search term suggestion functionality

## Design Principles

1. **Pure Functions**: Utilities should be pure functions without side effects
2. **Single Responsibility**: Each utility should do one thing well
3. **Testability**: Functions should be easy to test in isolation
4. **Performance**: Optimize for performance, especially for frequently used utilities
5. **Documentation**: Use JSDoc to document parameters and return values

## Usage Guidelines

- Utility functions should be stateless
- Avoid dependencies on external services when possible
- Include proper error handling
- Use TypeScript or JSDoc for type safety
- Write unit tests for all utility functions

## Example Usage

```jsx
// Using fuzzy search utilities
import { fuzzySearch, highlightMatches } from '../utils/fuzzySearch';

// Search items with fuzzy matching
const items = ['apple', 'banana', 'orange', 'pear'];
const results = fuzzySearch(items, 'aple', ['name'], { threshold: 0.3 });

// Highlight matched portions of text
const textSegments = highlightMatches('apple pie', 'app');
// Returns: [{text: 'app', highlight: true}, {text: 'le pie', highlight: false}]

// Render highlighted text
function HighlightedText({ text, searchTerm }) {
  const segments = highlightMatches(text, searchTerm);
  
  return (
    <span>
      {segments.map((segment, index) => (
        segment.highlight 
          ? <mark key={index}>{segment.text}</mark>
          : <span key={index}>{segment.text}</span>
      ))}
    </span>
  );
}
```

## Future Additions

As the application grows, additional utility modules may be added:

- **dateUtils.js**: Date formatting and manipulation
- **formatUtils.js**: Text and data formatting helpers
- **validationUtils.js**: Form validation helpers
- **storageUtils.js**: Local storage and caching utilities