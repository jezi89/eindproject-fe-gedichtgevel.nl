import React, {memo} from 'react';
import styles from './ResponsiveLayout.module.scss';

export const ResponsiveLayout = memo(({
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
            {/* Canvas - Always full size, bottom layer (z-index: 1) */}
            <div className={styles.canvasWrapper}>
                {canvas}

                {/* Open Buttons - Render OVER canvas when panels collapsed */}
                {!layout.controlsVisible && (
                    <button
                        className={`${styles.openButton} ${styles.openControlsButton}`}
                        onClick={layout.toggleControls}
                        aria-label="Open styling controls"
                    >
                        ☰
                    </button>
                )}

                {!layout.navVisible && (
                    <button
                        className={`${styles.openButton} ${styles.openNavButton}`}
                        onClick={layout.toggleNav}
                        aria-label="Open navigation"
                    >
                        ☰
                    </button>
                )}
            </div>

            {/* Left Controls Panel - Overlay (z-index: 10) */}
            <div className={controlsPanelClass}>
                {React.cloneElement(controls, {toggle: layout.toggleControls})}
            </div>

            {/* Right Navigation Panel - Overlay (z-index: 10) */}
            <div className={navPanelClass}>
                {React.cloneElement(navigation, {
                    navWidth: layout.navWidth,
                    navVisible: layout.navVisible,
                    toggle: layout.toggleNav
                })}
            </div>
        </div>
    );
});
