/**
 * FilterDropdownSlider Component
 * Dropdown-style filter that expands to show a slider panel
 * Used for the "Lengte" (length) filter
 */

import { useState, useRef, useEffect } from 'react';
import { FilterSlider } from './FilterSlider.jsx';
import styles from './FilterDropdown.module.scss';

/**
 * @param {Object} props
 * @param {number} props.value - Current slider value
 * @param {function} props.onChange - Callback when value changes
 * @param {string} [props.label='Lengte'] - Dropdown label
 */
export function FilterDropdownSlider({
    value,
    onChange,
    label = 'Lengte'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = value < 150;

    return (
        <div className={styles.filterDropdown} ref={dropdownRef}>
            <button
                className={`${styles.dropdownButton} ${isOpen ? styles.open : ''} ${isActive ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.dropdownValue}>{label}</span>
                <div className={styles.dropdownArrow}>
                    <svg className={styles.arrowVector} viewBox="0 0 21 16">
                        <path d="M0 0L21 0L10.5 15L0 0Z" fill="#EFEFEF"/>
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenuSlider}>
                    <FilterSlider
                        value={value}
                        onChange={onChange}
                        min={10}
                        max={150}
                        label="Maximale lengte"
                    />
                </div>
            )}
        </div>
    );
}
