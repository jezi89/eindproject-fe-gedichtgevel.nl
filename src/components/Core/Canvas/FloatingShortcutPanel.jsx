// src/components/Core/Canvas/components/FloatingShortcutPanel.jsx
import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './FloatingShortcutPanel.module.scss';

const shortcuts = [
    {
        id: 'altj',
        keys: ['Alt', 'J'],
        description: 'Focus XY sliders (poem mode) + 5s hover freeze',
        category: 'Navigation',
        modes: ['all']
    },
    {
        id: 'space',
        keys: ['Space'],
        description: 'Cycle modes: Edit → Line → Poem → Edit',
        category: 'Mode',
        modes: ['all']
    },
    {
        id: 'escape',
        keys: ['Esc'],
        description: 'Clear selection and return to Edit mode',
        category: 'Mode',
        modes: ['all']
    },
    {
        id: 'alta',
        keys: ['Alt', 'A'],
        description: 'Select all lines (Edit mode)',
        category: 'Selection',
        modes: ['edit']
    },
    {
        id: 'alth',
        keys: ['Alt', 'H'],
        description: 'Toggle XY sliders visibility',
        category: 'UI',
        modes: ['line', 'poem']
    },
    {
        id: 'shift-click',
        keys: ['Shift', 'Click'],
        description: 'Range select lines',
        category: 'Selection',
        modes: ['edit']
    },
    {
        id: 'ctrl-click',
        keys: ['Alt', 'Shift', 'Click'],
        description: 'Multi-select lines (non-adjacent)',
        category: 'Selection',
        modes: ['edit']
    },
    {
        id: 'alt-question',
        keys: ['Alt', '?'],
        description: 'Toggle this shortcuts panel',
        category: 'UI',
        modes: ['all']
    },
    {
        id: 'alty',
        keys: ['Alt', 'Y'],
        description: 'Toggle highlight visibility',
        category: 'UI',
        modes: ['all']
    }
];

export function FloatingShortcutPanel({
                                          moveMode = 'edit',
                                          selectedLines = new Set(),
                                          activeShortcut = null,
                                          xySlidersVisible = false,
                                          navWidth,
                                          navVisible = true,
                                      }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [otherShortcutsExpanded, setOtherShortcutsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(() => {
        // Load pinned state from localStorage
        try {
            const saved = localStorage.getItem('floatingShortcutPanel.isPinned');
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    // Handle pin toggle with localStorage persistence
    const handlePinToggle = () => {
        const newPinnedState = !isPinned;
        setIsPinned(newPinnedState);
        try {
            localStorage.setItem('floatingShortcutPanel.isPinned', JSON.stringify(newPinnedState));
        } catch (error) {
            console.warn('Failed to save pin state to localStorage:', error);
        }
    };

    // Auto-hide panel after inactivity if not pinned
    useEffect(() => {
        if (isExpanded && !isPinned) {
            const timeout = setTimeout(() => {
                setIsExpanded(false);
            }, 5000); // 5 seconds inactivity

            return () => clearTimeout(timeout);
        }
    }, [isExpanded, isPinned]);

    // Enhanced context-aware shortcut filtering
    const filterShortcutsByMode = (shortcuts, mode, hasSelection, xySlidersVisible) => {
        const active = [];
        const other = [];

        shortcuts.forEach(shortcut => {
            const isRelevant = shortcut.modes.includes('all') || shortcut.modes.includes(mode);
            let contextualPriority = 0;

            // Context-based priority scoring
            if (shortcut.id === 'space') {
                contextualPriority = 100; // Always highest priority - mode switching
            } else if (shortcut.id === 'escape') {
                contextualPriority = hasSelection ? 90 : 40; // High priority when selection exists
            } else if (shortcut.id === 'altj') {
                contextualPriority = mode === 'poem' ? 80 : 60; // Higher priority in poem mode
            } else if (shortcut.id === 'alth') {
                contextualPriority = (mode === 'line' || mode === 'poem') ? 70 : 20; // Context-dependent
            } else if (shortcut.id === 'alt-question') {
                contextualPriority = 30; // Medium priority - utility shortcut
            } else if (['alta', 'shift-click', 'ctrl-click'].includes(shortcut.id)) {
                contextualPriority = (mode === 'edit' && !hasSelection) ? 50 : 10; // Lower when not applicable
            }

            // Determine if shortcut should be in active section
            const shouldBeActive = isRelevant && (
                contextualPriority >= 50 || // High priority shortcuts
                (mode === 'edit' && ['space', 'escape', 'alta'].includes(shortcut.id)) ||
                (mode === 'line' && ['space', 'escape', 'alth'].includes(shortcut.id)) ||
                (mode === 'poem' && ['space', 'escape', 'altj', 'alth'].includes(shortcut.id))
            );

            if (shouldBeActive) {
                active.push({...shortcut, priority: contextualPriority});
            } else {
                other.push({...shortcut, priority: contextualPriority});
            }
        });

        // Sort by priority within each section
        active.sort((a, b) => b.priority - a.priority);
        other.sort((a, b) => b.priority - a.priority);

        return {active, other};
    };

    const {active, other} = filterShortcutsByMode(shortcuts, moveMode, selectedLines.size > 0, xySlidersVisible);

    const containerStyle = useMemo(() => ({
        right: navVisible ? `${navWidth}px` : '0px',
    }), [navWidth, navVisible]);

    // Keyboard shortcut to toggle panel (Alt + ?)
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Skip if focused on input elements
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // ONLY handle Alt + ? - don't interfere with other shortcuts
            if (event.altKey && event.key === '?' && !event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                setIsExpanded(!isExpanded);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded]);

    const toggleButton = (
        <div className={styles.toggleContainer}>
            <button
                className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Hide shortcuts (Alt+?)' : 'Show keyboard shortcuts (Alt+?)'}
            >
                <span className={styles.icon}>⌨️</span>
                <span className={styles.arrow}>
          {isExpanded ? '◀' : '▶'}
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
                    <span className={styles.modeIndicator}>({moveMode} mode)</span>
                </h4>
                <button
                    className={`${styles.pinButton} ${isPinned ? styles.pinned : ''}`}
                    onClick={handlePinToggle}
                    title={isPinned ? 'Unpin panel (auto-hide)' : 'Pin panel (keep open)'}
                >
                    📌
                </button>
            </div>

            {/* Active Shortcuts */}
            <div className={styles.activeSection}>
                <h5 className={styles.sectionTitle}>
                    🟢 Active ({moveMode}
                    {selectedLines.size > 0 && `, ${selectedLines.size} selected`}
                    {xySlidersVisible && ', XY visible'}
                    )
                </h5>
                {active.map((shortcut) => (
                    <div
                        key={shortcut.id}
                        className={`${styles.shortcutItem} ${activeShortcut === shortcut.id ? styles.highlighted : ''}`}
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
                        {other.map((shortcut) => (
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
