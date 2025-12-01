import React, { useState, useEffect, useRef } from 'react';
import styles from '../Canvas.module.scss';

const MAX_RECENT_COLORS = 5;
const STORAGE_KEY = 'gedichtgevel_recent_colors';

export default function ColorPicker({
    value,
    onChange,
    onActiveChange,
    title
}) {
    const [recentColors, setRecentColors] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load recent colors from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setRecentColors(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load recent colors', e);
        }
    }, []);

    const saveColorToHistory = (color) => {
        if (!color) return;
        
        setRecentColors(prev => {
            // Remove if exists (to move to top)
            const filtered = prev.filter(c => c !== color);
            // Add to front
            const newColors = [color, ...filtered].slice(0, MAX_RECENT_COLORS);
            
            // Save to local storage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
            } catch (e) {
                console.error('Failed to save recent colors', e);
            }
            
            return newColors;
        });
    };

    const handleBlur = () => {
        onActiveChange?.(false);
        saveColorToHistory(value);
    };

    const handleFocus = () => {
        onActiveChange?.(true);
    };

    return (
        <div className={styles.colorPickerWrapper}>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                title={title}
                className={styles.colorInput}
            />
            
            {recentColors.length > 0 && (
                <div className={styles.recentColors}>
                    {recentColors.map((color, index) => (
                        <button
                            key={`${color}-${index}`}
                            className={styles.recentColorSwatch}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                onChange(color);
                                // Optional: Move to top of history immediately or wait for blur
                            }}
                            title={`Gebruik ${color}`}
                            type="button"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
