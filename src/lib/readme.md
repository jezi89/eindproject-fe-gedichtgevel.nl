This directory contains wrapper components and utilities for external libraries, providing standardized interfaces and abstractions.

## Structure

### `/audio/` - Audio Library Wrappers
- WaveSurfer.js wrapper components
- Audio processing utilities
- Recording/playback abstractions

### `/canvas/` - Canvas Library Wrappers
- Pixi.js wrapper components
- Canvas manipulation utilities
- Drawing/rendering abstractions

### `/ui/` - UI Library Wrappers
- External UI component wrappers
- Third-party component adapters
- Styling normalizations

### `/utils/` - Utility Libraries
- Data processing utilities
- Format converters
- Common algorithms

## Guidelines

1. **Wrap, Don't Replace**: Provide thin abstractions over libraries
2. **Consistent APIs**: Standardize interfaces across similar libraries
3. **Error Handling**: Centralize error handling for external dependencies
4. **Testing**: Mock-friendly interfaces for easier testing
5. **Documentation**: Clear examples of wrapper usage

## Example Structure

```
/lib/
  /audio/
    WaveSurferWrapper.jsx
    WaveSurferWrapper.module.scss
    AudioRecorder.js
    audioUtils.js
  /canvas/
    PixiCanvas.jsx
    PixiCanvas.module.scss
    canvasUtils.js
  /ui/
    ExternalModal.jsx
    ExternalModal.module.scss