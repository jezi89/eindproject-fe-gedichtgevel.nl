# Canvas Data Service

The Canvas Data Service handles poem data transport between search results and the canvas component. It provides secure, validated data storage using sessionStorage.

## Features

- **Data Standardization**: Converts various poem data formats into a consistent structure
- **XSS Protection**: Sanitizes all text content to prevent security vulnerabilities
- **Validation**: Ensures data integrity before storage and after retrieval
- **Error Handling**: Graceful error handling with logging and recovery
- **Storage Management**: Automatic cleanup and size limits

## Usage

```javascript
import { CanvasDataService } from '@/services/canvas';

// Store poem data for canvas
const poemData = {
    title: 'My Poem',
    author: 'Author Name',
    lines: ['Line 1', 'Line 2', 'Line 3']
};

const standardized = CanvasDataService.storePoemForCanvas(poemData);

// Retrieve poem data in canvas
const retrievedData = CanvasDataService.getPoemForCanvas();

// Clear data when done
CanvasDataService.clearPoemData();
```

## Data Format

The service standardizes all poem data to this format:

```javascript
{
    id: 'unique-poem-id',
    title: 'Poem Title',
    author: 'Author Name',
    lines: ['Line 1', 'Line 2', 'Line 3'],
    source: 'search',
    timestamp: 1234567890,
    metadata: {
        originalUrl: 'https://example.com',
        wordCount: 6,
        lineCount: 3,
        originalFormat: 'lines-array'
    }
}
```

## Security

- All text content is sanitized to prevent XSS attacks
- Storage size is limited to prevent abuse
- Data validation ensures integrity
- Automatic cleanup of corrupted data

## Error Handling

The service includes comprehensive error handling:
- Invalid data is rejected with clear error messages
- Corrupted storage data is automatically cleared
- Storage availability is checked before operations
- All errors are logged for debugging