import React, { memo } from 'react';
import styles from './ResponsiveLayout.module.scss';

const ResponsiveLayout = memo(({ 
  layout,
  controls, 
  canvas,
  navigation,
  previewState = 'normal'
}) => {

  const getLayoutClass = () => {
    let className = styles.layoutContainer;
    if (previewState === 'dimmed') className += ` ${styles.dimmed}`;
    else if (previewState === 'preview') className += ` ${styles.preview}`;
    return className;
  };

  const controlsPanelClass = `${styles.controlsPanel} ${!layout.controlsVisible ? styles.collapsed : ''}`;
  const navPanelClass = `${styles.navPanel} ${!layout.navVisible ? styles.collapsed : ''}`;

  return (
    <div className={getLayoutClass()}>
      {/* Left Controls Panel */}
      <div 
        className={controlsPanelClass}
        style={{ width: layout.controlsWidth }}
      >
        {React.cloneElement(controls, { toggle: layout.toggleControls })}
      </div>

      {/* Main Canvas - takes remaining space */}
      <div className={styles.canvasWrapper}>
        {canvas}

        {/* Open Buttons - Rendered on top of the canvas */}
        {!layout.controlsVisible && (
          <button 
            className={`${styles.openButton} ${styles.openControlsButton}`}
            onClick={layout.toggleControls}
            aria-label="Expand Controls"
          >
            ☰
          </button>
        )}

        {!layout.navVisible && (
          <button 
            className={`${styles.openButton} ${styles.openNavButton}`}
            onClick={layout.toggleNav}
            aria-label="Expand Navigation"
          >
            ☰
          </button>
        )}
      </div>

      {/* Right Navigation Panel */}
      <div
        className={navPanelClass}
        style={{ width: layout.navWidth }}
      >
        {React.cloneElement(navigation, { 
          navWidth: layout.navWidth,
          toggle: layout.toggleNav 
        })}
      </div>
    </div>
  );
});

ResponsiveLayout.displayName = 'ResponsiveLayout';

export default ResponsiveLayout;
