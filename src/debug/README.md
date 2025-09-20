# 🔧 Debug Tooling Quick Start

## Development Mode Only
This debug system is automatically disabled in production builds.

## How to Use

### 1. **Enable Debug Mode**
In your browser console:
```javascript
window.debugCanvas.toggle()
```

### 2. **Debug Commands**
```javascript
window.debugCanvas.enable()         // Enable debug overlay
window.debugCanvas.disable()        // Disable debug overlay  
window.debugCanvas.getState()       // Get current debug data
window.debugCanvas.logPositioning() // Log detailed analysis
window.debugCanvas.resetViewport()  // Reset camera to center
```

### 3. **PIXI DevTools Integration**
- Install PIXI DevTools browser extension
- Open F12 → PIXI tab
- Scene components are automatically named:
  - `MainViewport` - The viewport camera
  - `ContentContainer` - Main content container

## What You'll See

### Debug Overlay Shows:
- Screen info (type, aspect ratio, size)
- Viewport center position  
- Content container position
- Calculated camera position
- Mathematical formula used
- Local vs World bounds comparison

### PIXI DevTools Shows:
- Scene graph hierarchy
- Real-time property values
- Performance metrics
- Interactive component inspection

## Perfect for Learning:
- ✅ X positioning concepts (stable container logic)
- ✅ Y positioning formula (20% from top math)
- ✅ Viewport camera coordinate system
- ✅ Local vs World coordinate differences
- ✅ Performance implications of positioning changes

## See DEVELOPMENT_GUIDE.md for complete testing strategies!