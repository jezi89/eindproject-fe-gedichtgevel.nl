// src/components/Core/Canvas/components/FloatingShortcutPanel.jsx
import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './FloatingShortcutPanel.module.scss';

const shortcuts = [
    // --- MAIN SHORTCUTS (Global) ---
    {
        id: 'toggle-ui',
        keys: ['Alt', '.'],
        description: 'Toggle UI visibility (Controls + Nav)',
        category: 'Main',
        modes: ['all'],
        priority: 100
    },
    {
        id: 'toggle-nav',
        keys: ['Alt', 'N'],
        description: 'Toggle Navigation bar',
        category: 'Main',
        modes: ['all'],
        priority: 95
    },
    {
        id: 'toggle-menu',
        keys: ['M'],
        description: 'Toggle Main Menu Overlay',
        category: 'Main',
        modes: ['all'],
        priority: 94
    },
    {
        id: 'swap-layout',
        keys: ['Alt', 'S'],
        description: 'Swap panel position (Left/Right)',
        category: 'Main',
        modes: ['all'],
        priority: 90
    },
    {
        id: 'cycle-quality',
        keys: ['Alt', 'Q'],
        description: 'Cycle image quality (Low/High/Max)',
        category: 'Main',
        modes: ['all'],
        priority: 85
    },
    {
        id: 'space',
        keys: ['Space'],
        description: 'Cycle modes: Edit → Line → Poem → Edit',
        category: 'Main',
        modes: ['all'],
        priority: 80
    },
    {
        id: 'toggle-highlight',
        keys: ['Alt', 'Y'],
        description: 'Toggle highlight visibility',
        category: 'Main',
        modes: ['all'],
        priority: 75
    },
    {
        id: 'toggle-shortcuts',
        keys: ['Alt', '?'],
        description: 'Toggle this shortcuts panel',
        category: 'Main',
        modes: ['all'],
        priority: 70
    },

    // --- MODE SPECIFIC / OTHER ---
    {
        id: 'altj',
        keys: ['Alt', 'J'],
        description: 'Focus XY sliders (poem mode) + 5s hover freeze',
        category: 'Navigation',
        modes: ['all'],
        priority: 60
    },
    {
        id: 'escape',
        keys: ['Esc'],
        description: 'Clear selection and return to Edit mode',
        category: 'Mode',
        modes: ['all'],
        priority: 50
    },
    {
        id: 'alta',
        keys: ['Alt', 'A'],
        description: 'Select all lines (Edit mode)',
        category: 'Selection',
        modes: ['edit'],
        priority: 40
    },
    {
        id: 'alth',
        keys: ['Alt', 'H'],
        description: 'Toggle XY sliders visibility',
        category: 'UI',
        modes: ['line', 'poem'],
        priority: 30
    },
    {
        id: 'shift-click',
        keys: ['Shift', 'Click'],
        description: 'Range select lines',
        category: 'Selection',
        modes: ['edit'],
        priority: 20
    },
    {
        id: 'ctrl-click',
        keys: ['Alt', 'Shift', 'Click'],
        description: 'Multi-select lines (non-adjacent)',
        category: 'Selection',
        modes: ['edit'],
        priority: 10
    }
];

export function FloatingShortcutPanel({
                                          moveMode = 'edit',
                                          selectedLines = new Set(),
                                          activeShortcut = null,
                                          xySlidersVisible = false,
                                          navWidth,
                                          navVisible = true,
                                          controlsVisible = true,
                                          controlsWidth = 340,
                                          layoutPosition = 'standard' // 'standard' (left) or 'swapped' (right)
                                      }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [otherShortcutsExpanded, setOtherShortcutsExpanded] = useState(false);

    // Filter shortcuts into sections
    const {mainShortcuts, activeModeShortcuts, otherShortcuts} = useMemo(() => {
        const main = [];
        const active = [];
        const other = [];

        shortcuts.forEach(shortcut => {
            // 1. Main Shortcuts (Always visible in top section)
            if (shortcut.category === 'Main') {
                main.push(shortcut);
                return;
            }

            // 2. Determine relevance for current mode
            const isRelevant = shortcut.modes.includes('all') || shortcut.modes.includes(moveMode);

            // 3. Active Mode Shortcuts (High priority context-aware)
            // Logic: If it's relevant AND not in Main, put in Active or Other based on context
            if (isRelevant) {
                // Specific high-value shortcuts for current context go to Active
                const isHighValue =
                    (moveMode === 'edit' && ['escape', 'alta'].includes(shortcut.id)) ||
                    (moveMode === 'line' && ['escape', 'alth'].includes(shortcut.id)) ||
                    (moveMode === 'poem' && ['escape', 'altj', 'alth'].includes(shortcut.id));

                if (isHighValue) {
                    active.push(shortcut);
                } else {
                    other.push(shortcut);
                }
            } else {
                // Not relevant for current mode -> Other (dimmed/hidden usually, but here we put all rest in Other)
                other.push(shortcut);
            }
        });

        // Sort by priority
        main.sort((a, b) => b.priority - a.priority);
        active.sort((a, b) => b.priority - a.priority);
        other.sort((a, b) => b.priority - a.priority);

        return {mainShortcuts: main, activeModeShortcuts: active, otherShortcuts: other};
    }, [moveMode]);


    const containerStyle = useMemo(() => {
        const style = {};
        
        // Determine which panel is on the right side
        // Standard: Navigation is on Right
        // Swapped: Controls are on Right
        
        let rightOffset = 0;
        
        if (layoutPosition === 'swapped') {
            // Controls are on the Right
            rightOffset = controlsVisible ? controlsWidth : 0;
        } else {
            // Navigation is on the Right (Standard)
            rightOffset = navVisible ? navWidth : 0;
        }
        
        // Apply the calculated offset
        style.right = `${rightOffset}px`;
        style.bottom = '20px';
        style.left = 'auto'; // Ensure left is auto
        
        return style;
    }, [navWidth, navVisible, controlsWidth, controlsVisible, layoutPosition]);

    // Keyboard shortcut to toggle panel (Alt + ?)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

            // Allow Shift key because ? is often Shift+/
            if (event.altKey && (event.key === '?' || event.key === '/') && !event.ctrlKey) {
                event.preventDefault();
                setIsExpanded(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleButton = (
        <div className={styles.toggleContainer}>
            <button
                className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Hide shortcuts (Alt+?)' : 'Show keyboard shortcuts (Alt+?)'}
            >
                <span className={styles.icon}>⌨️</span>
                <span className={styles.arrow}>
          {isExpanded ? (layoutPosition === 'swapped' ? '▶' : '◀') : (layoutPosition === 'swapped' ? '◀' : '▶')}
        </span>
            </button>
        </div>
    );

    const panelContent = isExpanded && (
        <div className={styles.panel}>
            {/* Panel Header */}
            <div className={styles.panelHeader}>
                <h4 className={styles.panelTitle}>
                    Keyboard Shortcuts
                </h4>
                <button 
                    className={styles.closeButton}
                    onClick={() => setIsExpanded(false)}
                    title="Close panel"
                >
                    ×
                </button>
            </div>

            {/* Main Shortcuts (All Modes) */}
            <div className={styles.activeSection}>
                <h5 className={styles.sectionTitle}>
                    ⭐ Main Shortcuts (All modes)
                </h5>
                {mainShortcuts.map((shortcut) => (
                    <div
                        key={shortcut.id}
                        className={`${styles.shortcutItem} ${activeShortcut === shortcut.description ? styles.highlighted : ''}`}
                    >
                        <div className={styles.keys}>
                            {shortcut.keys.map((key, index) => (
                                <React.Fragment key={key}>
                                    <kbd className={styles.key}>{key}</kbd>
                                    {index < shortcut.keys.length - 1 && (
                                        <span className={styles.plus}>+</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <span className={styles.description}>{shortcut.description}</span>
                    </div>
                ))}
            </div>

            {/* Active Mode Specific Shortcuts */}
            {activeModeShortcuts.length > 0 && (
                <div className={styles.activeSection} style={{marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px'}}>
                    <h5 className={styles.sectionTitle}>
                        🟢 Active ({moveMode} mode only)
                    </h5>
                    {activeModeShortcuts.map((shortcut) => (
                        <div
                            key={shortcut.id}
                            className={`${styles.shortcutItem} ${activeShortcut === shortcut.description ? styles.highlighted : ''}`}
                        >
                            <div className={styles.keys}>
                                {shortcut.keys.map((key, index) => (
                                    <React.Fragment key={key}>
                                        <kbd className={styles.key}>{key}</kbd>
                                        {index < shortcut.keys.length - 1 && (
                                            <span className={styles.plus}>+</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <span className={styles.description}>{shortcut.description}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Other Shortcuts - Collapsible */}
            <div className={styles.otherSection}>
                <button
                    className={styles.collapsibleHeader}
                    onClick={() => setOtherShortcutsExpanded(!otherShortcutsExpanded)}
                >
                    <span>⚫ Other Shortcuts</span>
                    <span className={styles.expandIcon}>
            {otherShortcutsExpanded ? '▼' : '▶'}
          </span>
                </button>

                {otherShortcutsExpanded && (
                    <div className={styles.collapsibleContent}>
                        {otherShortcuts.map((shortcut) => (
                            <div
                                key={shortcut.id}
                                className={`${styles.shortcutItem} ${styles.dimmed}`}
                            >
                                <div className={styles.keys}>
                                    {shortcut.keys.map((key, index) => (
                                        <React.Fragment key={key}>
                                            <kbd className={styles.keyDimmed}>{key}</kbd>
                                            {index < shortcut.keys.length - 1 && (
                                                <span className={styles.plus}>+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <span className={styles.descriptionDimmed}>{shortcut.description}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(
        <div className={styles.floatingContainer} style={containerStyle}>
            {toggleButton}
            {panelContent}
        </div>,
        document.body
    );
}
