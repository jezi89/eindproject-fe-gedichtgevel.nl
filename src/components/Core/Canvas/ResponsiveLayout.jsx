import React, {memo} from 'react';
import styles from './ResponsiveLayout.module.scss';

export const ResponsiveLayout = memo(
  ({
    layout,
    controls,
    canvas,
    navigation,
    previewState = "normal",
    layoutPosition = "standard", // 'standard' (Controls Left) or 'swapped' (Controls Right)
    onToggleLayoutPosition,
    isMobile,
    onMobileCycle,
  }) => {
    const getLayoutClass = () => {
      let className = styles.layoutContainer;
      if (previewState === "dimmed") className += ` ${styles.dimmed}`;
      else if (previewState === "preview") className += ` ${styles.preview}`;
      return className;
    };

    const isSwapped = layoutPosition === "swapped";

    const controlsPanelClass = `${styles.controlsPanel} ${
      !layout.controlsVisible ? styles.collapsed : ""
    } ${isSwapped ? styles.swapped : ""}`;
    const navPanelClass = `${styles.navPanel} ${
      !layout.navVisible ? styles.collapsed : ""
    } ${isSwapped ? styles.swapped : ""}`;

    const openControlsBtnClass = `${styles.openButton} ${
      styles.openControlsButton
    } ${isSwapped ? styles.swapped : ""}`;
    const openNavBtnClass = `${styles.openButton} ${styles.openNavButton} ${
      isSwapped ? styles.swapped : ""
    }`;

    return (
      <div className={getLayoutClass()}>
        {/* Canvas - Always full size, bottom layer (z-index: 1) */}
        <div className={styles.canvasWrapper}>
          {canvas}

          {/* Open Buttons - Render OVER canvas when panels collapsed */}
          {/* Open Buttons - Render OVER canvas when panels collapsed */}
          {/* Mobile Cycle Button - Only on Mobile */}
          {isMobile && onMobileCycle && (
            <button
              className={styles.mobileCycleButton}
              onClick={onMobileCycle}
              aria-label="Cycle View"
            >
              {layout.navVisible ? "🎨" : layout.controlsVisible ? "✕" : "☰"}
            </button>
          )}

          {/* Desktop Open Buttons - Hide on Mobile */}
          {!isMobile && !layout.controlsVisible && (
            <button
              className={openControlsBtnClass}
              onClick={layout.toggleControls}
              aria-label="Open styling controls"
            >
              ☰
            </button>
          )}

          {!isMobile && !layout.navVisible && (
            <button
              className={openNavBtnClass}
              onClick={layout.toggleNav}
              aria-label="Open navigation"
            >
              ☰
            </button>
          )}
        </div>

        {/* Controls Panel */}
        <div className={controlsPanelClass}>
          {React.cloneElement(controls, {
            toggle: layout.toggleControls,
            onToggleLayoutPosition: onToggleLayoutPosition, // Pass toggle handler
          })}
        </div>

        {/* Navigation Panel */}
        <div className={navPanelClass}>
          {React.cloneElement(navigation, {
            navWidth: layout.navWidth,
            navVisible: layout.navVisible,
            toggle: layout.toggleNav,
          })}
        </div>
      </div>
    );
  }
);
