/**
 * @fileoverview Centralized Debug Manager for PIXI Canvas Learning Project
 * 
 * @description
 * This file contains ALL debug functionality in one place, keeping the main
 * learning codebase clean and focused. It integrates with PIXI DevTools
 * and provides comprehensive development insights.
 * 
 * @version 1.0.0
 * @author Learning Project - Debug Tooling
 */

/**
 * Debug Manager Class - Singleton Pattern
 * 
 * @description
 * Centralizes all debug functionality without polluting main code.
 * Integrates with PIXI DevTools and provides real-time monitoring.
 */
class DebugManager {
  constructor() {
    this.isEnabled = false;
    this.debugData = {};
    this.rafId = null;
    this.pixiApp = null;
    this.viewport = null;
    this.contentContainer = null;
    this.customResetHandler = null; // NEW: For custom reset logic
    
    // Development mode detection
    this.isDevelopment = import.meta.env.DEV;
    
    // Initialize only in development
    if (this.isDevelopment) {
      this.initializeDebugTools();
    }
  }

  /**
   * Initialize debug tools and PIXI DevTools integration
   */
  initializeDebugTools() {
    // Check if PIXI DevTools is available
    if (window.__PIXI_DEVTOOLS__) {
      console.log('🔧 PIXI DevTools detected - Enhanced debugging available');
    }

    // Add development-only global debug commands
    if (typeof window !== 'undefined') {
      window.debugCanvas = {
        enable: () => this.enable(),
        disable: () => this.disable(),
        toggle: () => this.isEnabled ? this.disable() : this.enable(),
        getState: () => this.debugData,
        logPositioning: () => this.logDetailedPositioning(),
        resetViewport: () => this.resetViewport(),
      };
      
      console.log('🚀 Debug commands available: window.debugCanvas');
      console.log('   - window.debugCanvas.toggle() - Toggle debug overlay');
      console.log('   - window.debugCanvas.logPositioning() - Log positioning data');
      console.log('   - window.debugCanvas.resetViewport() - Reset camera position');
    }
  }

  /**
   * Register a custom reset handler from the React component
   * @param {Function} handler - The function to call on reset
   */
  registerResetHandler(handler) {
    this.customResetHandler = handler;
  }

  /**
   * Register PIXI components for debugging
   */
  registerComponents(pixiApp, viewport, contentContainer) {
    this.pixiApp = pixiApp;
    this.viewport = viewport;
    this.contentContainer = contentContainer;

    // Register with PIXI DevTools if available
    if (window.__PIXI_DEVTOOLS__ && pixiApp) {
      try {
        // Enhanced PIXI DevTools integration
        if (viewport) {
          viewport.label = 'MainViewport'; // Label for DevTools (v8 compatible)
        }
        if (contentContainer) {
          contentContainer.label = 'ContentContainer'; // Label for DevTools (v8 compatible)
        }
      } catch (error) {
        console.warn('PIXI DevTools integration failed:', error);
      }
    }
  }

  /**
   * Enable debug mode
   */
  enable() {
    if (!this.isDevelopment) return;
    
    this.isEnabled = true;
    this.startMonitoring();
    this.createDebugOverlay();
    console.log('🔧 Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable() {
    this.isEnabled = false;
    this.stopMonitoring();
    this.removeDebugOverlay();
    console.log('🔧 Debug mode disabled');
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring() {
    const updateDebugData = () => {
      if (!this.isEnabled) return;

      if (this.viewport && this.contentContainer) {
        try {
          const viewport = this.viewport;
          const content = this.contentContainer;
          
          // Get positioning data
          const localBounds = content.getLocalBounds ? content.getLocalBounds() : null;
          const worldBounds = content.getBounds ? content.getBounds() : null;
          
          // Calculate screen info
          const aspectRatio = viewport.screenWidth / viewport.screenHeight;
          const screenType = aspectRatio > 1.5 ? 'Wide' : aspectRatio < 0.8 ? 'Portrait' : 'Standard';

          // Update debug data
          this.debugData = {
            timestamp: Date.now(),
            viewport: {
              center: viewport.center ? { 
                x: Math.round(viewport.center.x), 
                y: Math.round(viewport.center.y) 
              } : null,
              size: {
                width: viewport.screenWidth,
                height: viewport.screenHeight
              },
              scale: viewport.scale ? {
                x: viewport.scale.x.toFixed(3),
                y: viewport.scale.y.toFixed(3)
              } : null
            },
            content: {
              position: {
                x: Math.round(content.x),
                y: Math.round(content.y)
              },
              localBounds: localBounds ? {
                x: Math.round(localBounds.x),
                y: Math.round(localBounds.y),
                width: Math.round(localBounds.width),
                height: Math.round(localBounds.height)
              } : null,
              worldBounds: worldBounds ? {
                x: Math.round(worldBounds.x),
                y: Math.round(worldBounds.y),
                width: Math.round(worldBounds.width),
                height: Math.round(worldBounds.height)
              } : null
            },
            screen: {
              aspectRatio: aspectRatio.toFixed(2),
              type: screenType,
              size: `${viewport.screenWidth}×${viewport.screenHeight}`
            },
            positioning: {
              calculatedCenterX: Math.round(content.x),
              cameraStrategy: "X-only positioning - Y handled by useResponsiveTextPosition",
              note: "No camera Y adjustment - static positioning for learning focus"
            }
          };

          this.updateDebugOverlay();
        } catch (error) {
          console.warn('Debug data update failed:', error);
        }
      }

      this.rafId = requestAnimationFrame(updateDebugData);
    };

    updateDebugData();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Create debug overlay UI
   */
  createDebugOverlay() {
    // Remove existing overlay
    this.removeDebugOverlay();

    const overlay = document.createElement('div');
    overlay.id = 'pixi-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 12px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 350px;
      line-height: 1.4;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    // Add header with controls
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;';
    header.innerHTML = `
      <span>🔧 PIXI Debug Console</span>
      <button onclick="window.debugCanvas.disable()" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 14px;">×</button>
    `;
    overlay.appendChild(header);

    // Add content area
    const content = document.createElement('div');
    content.id = 'debug-content';
    overlay.appendChild(content);

    // Add controls
    const controls = document.createElement('div');
    controls.style.cssText = 'margin-top: 8px; padding-top: 8px; border-top: 1px solid #333; font-size: 10px;';
    controls.innerHTML = `
      <div style="color: #888;">
        <div><strong>Console Commands:</strong></div>
        <div>• debugCanvas.logPositioning() - Log details</div>
        <div>• debugCanvas.resetViewport() - Reset camera</div>
        <div>• Open PIXI DevTools for scene graph</div>
      </div>
    `;
    overlay.appendChild(controls);

    document.body.appendChild(overlay);
  }

  /**
   * Update debug overlay content
   */
  updateDebugOverlay() {
    const content = document.getElementById('debug-content');
    if (!content || !this.debugData) return;

    const data = this.debugData;
    content.innerHTML = `
      <div><strong>Screen:</strong> ${data.screen?.type} (${data.screen?.aspectRatio}) ${data.screen?.size}</div>
      <div style="margin: 4px 0; border-top: 1px solid #333; padding-top: 4px;">
        <strong>Viewport Center:</strong><br>
        &nbsp;&nbsp;X: ${data.viewport?.center?.x || 'N/A'}<br>
        &nbsp;&nbsp;Y: ${data.viewport?.center?.y || 'N/A'}
      </div>
      <div style="margin: 4px 0;">
        <strong>Content Position:</strong><br>
        &nbsp;&nbsp;X: ${data.content?.position?.x || 'N/A'} (stable)<br>
        &nbsp;&nbsp;Y: ${data.content?.position?.y || 'N/A'}
      </div>
      <div style="margin: 4px 0;">
        <strong>Camera Positioning:</strong><br>
        &nbsp;&nbsp;X: ${data.positioning?.calculatedCenterX || 'N/A'} (auto-centered)<br>
        &nbsp;&nbsp;Y: Static positioning (no camera adjustment)<br>
        &nbsp;&nbsp;Strategy: ${data.positioning?.cameraStrategy || 'N/A'}
      </div>
      <div style="margin: 4px 0; font-size: 9px; color: #888;">
        <strong>Focus:</strong> ${data.positioning?.note || 'N/A'}
      </div>
      <div style="margin: 4px 0; border-top: 1px solid #333; padding-top: 4px;">
        <strong>Bounds (Local vs World):</strong><br>
        Local: ${data.content?.localBounds ? `${data.content.localBounds.width}×${data.content.localBounds.height}` : 'N/A'}<br>
        World: ${data.content?.worldBounds ? `${data.content.worldBounds.width}×${data.content.worldBounds.height}` : 'N/A'}
      </div>
    `;
  }

  /**
   * Remove debug overlay
   */
  removeDebugOverlay() {
    const existing = document.getElementById('pixi-debug-overlay');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Log detailed positioning information
   */
  logDetailedPositioning() {
    if (!this.debugData) {
      console.log('No debug data available');
      return;
    }

    console.group('📊 PIXI Canvas Positioning Analysis');
    console.log('Screen:', this.debugData.screen);
    console.log('Viewport:', this.debugData.viewport);
    console.log('Content:', this.debugData.content);
    console.log('Positioning Logic:', this.debugData.positioning);
    console.groupEnd();
  }

  /**
   * Reset viewport to default position
   */
  resetViewport() {
    // Use the custom handler if it's registered
    if (this.customResetHandler) {
      this.customResetHandler();
      console.log('🎯 Custom viewport reset handler executed');
      return;
    }

    // Fallback to original logic if no custom handler
    if (this.viewport && this.contentContainer) {
      const content = this.contentContainer;
      const viewport = this.viewport;
      
      // Reset to calculated center
      const centerX = content.x;
      const centerY = content.y + viewport.screenHeight * 0.3;
      
      viewport.animate({
        position: { x: centerX, y: centerY },
        time: 500,
        ease: 'easeInOutCubic'
      });
      
      console.log(`🎯 Viewport reset to default center: (${centerX}, ${centerY})`);
    }
  }
}

// Export singleton instance
export const debugManager = new DebugManager();