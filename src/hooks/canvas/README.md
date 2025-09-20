# useCanvasNavigation Hook

A React hook that provides navigation utilities for the canvas integration. Handles poem data transport between search results and the canvas editor with proper data management and cleanup.

## Features

- **navigateToCanvas**: Navigate to canvas with poem data
- **navigateBack**: Navigate back from canvas with cleanup
- **navigateToCanvasDemo**: Navigate to canvas with demo content
- **hasCanvasData**: Check if canvas data is available
- **getCanvasDataInfo**: Get information about stored canvas data

## Usage

```javascript
import { useCanvasNavigation } from '@/hooks/canvas/useCanvasNavigation';

function PoemSearchResult({ poem }) {
    const { navigateToCanvas } = useCanvasNavigation();
    
    const handleOpenInCanvas = () => {
        try {
            navigateToCanvas(poem, { source: 'search' });
        } catch (error) {
            console.error('Failed to open poem in canvas:', error);
            // Handle error (show toast, etc.)
        }
    };
    
    return (
        <div>
            <h3>{poem.title}</h3>
            <p>by {poem.author}</p>
            <button onClick={handleOpenInCanvas}>
                🎨 Open in Canvas
            </button>
        </div>
    );
}
```

## API Reference

### navigateToCanvas(poemData, options)

Navigate to canvas with poem data.

**Parameters:**
- `poemData` (Object): Poem data to transport
  - `title` (string): Poem title
  - `author` (string): Poem author  
  - `lines` (Array<string>) or `text` (string): Poem content
  - `id` (string, optional): Poem ID
- `options` (Object, optional): Navigation options
  - `source` (string): Source of navigation ('search', 'collection', etc.)
  - `replace` (boolean): Whether to replace current history entry

**Returns:** Standardized poem data object

**Throws:** Error if poem data is invalid

### navigateBack(fallback, options)

Navigate back from canvas with cleanup.

**Parameters:**
- `fallback` (string): Fallback route if no history (default: '/')
- `options` (Object, optional): Navigation options
  - `replace` (boolean): Whether to replace current history entry
  - `clearData` (boolean): Whether to clear poem data (default: true)

### navigateToCanvasDemo(options)

Navigate to canvas with demo content.

**Parameters:**
- `options` (Object, optional): Navigation options
  - `replace` (boolean): Whether to replace current history entry

### hasCanvasData()

Check if canvas data is available.

**Returns:** Boolean indicating if data exists

### getCanvasDataInfo()

Get information about stored canvas data.

**Returns:** Object with data information:
- `hasData` (boolean): Whether data exists in storage
- `hasValidData` (boolean): Whether data is valid
- `poemTitle` (string): Title of stored poem
- `poemAuthor` (string): Author of stored poem
- `lineCount` (number): Number of poem lines
- `source` (string): Source of the data
- `timestamp` (number): When data was stored
- `size` (number): Storage size in bytes

## Error Handling

The hook includes comprehensive error handling:

- Validates poem data before navigation
- Handles storage failures gracefully
- Provides fallback navigation options
- Logs errors for debugging

## Data Flow

1. User clicks "Open in Canvas" button
2. `navigateToCanvas` validates and stores poem data
3. Navigation occurs to `/designgevel/{poemId}`
4. DesignPage retrieves data from storage
5. Canvas component renders with poem data
6. `navigateBack` cleans up storage when leaving

## Requirements Satisfied

This hook satisfies the following requirements from the spec:

- **1.1**: Navigate to `/designgevel/{poemId}` with poem data
- **3.1**: Navigate to canvas from search results  
- **3.2**: Navigate back with proper cleanup

## Dependencies

- `react-router`: For navigation functionality
- `CanvasDataService`: For data storage and management

## Notes

- Uses sessionStorage for temporary data transport
- Automatically generates poem IDs if not provided
- Includes data validation and sanitization
- Supports both array and string poem content formats
- Handles browser history navigation gracefully