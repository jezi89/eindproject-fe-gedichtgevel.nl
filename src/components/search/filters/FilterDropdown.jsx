/**
 * FilterDropdown Component
 * Dropdown selector for era and language filters
 * Supports both single-select (language) and multi-select (era) modes
 */

import { useState, useRef, useEffect } from 'react';
import { ERAS } from '@/utils/eraMapping.js';
import styles from './FilterDropdown.module.scss';
import { countAuthorsPerEra } from '@/utils/eraMapping.js';


/**
 * @param {Object} props
 * @param {string} props.type - 'era' or 'language'
 * @param {string|string[]} props.value - Current selected value(s) - string for language, array for era
 * @param {function} props.onChange - Callback when value changes
 * @param {string} [props.label] - Dropdown label (defaults based on type)
 */
export function FilterDropdown({
    type,
    value,
    onChange,
    label
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // For era type, value is an array; for language, value is a string
    const isMultiSelect = type === 'era';
    const selectedValues = isMultiSelect ? (Array.isArray(value) ? value : []) : value;

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

    const getLabel = () => {
        if (label) return label;
        return type === 'era' ? 'Tijdperk' : 'Taal';
    };

    const getDisplayValue = () => {
        if (type === 'era') {
            // Multi-select: show count or "Alle Tijdperken"
            if (selectedValues.length === 0) {
                return 'Alle Tijdperken';
            } else if (selectedValues.length === 1) {
                const era = Object.values(ERAS).find(e => e.id === selectedValues[0]);
                return era ? era.label : 'Selecteer tijdperk';
            } else {
                return `${selectedValues.length} geselecteerd`;
            }
        }
        if (type === 'language') {
            return value === 'en' ? 'Engels' : 'Selecteer taal';
        }
        return 'Selecteer...';
    };

    const handleSelect = (newValue) => {
        if (isMultiSelect) {
            // For era multi-select: toggle the value in the array
            if (newValue === 'all') {
                // Toggle all: if any selected, clear all; otherwise select none (same behavior)
                onChange([]);
            } else {
                const newValues = selectedValues.includes(newValue)
                    ? selectedValues.filter(v => v !== newValue)
                    : [...selectedValues, newValue];
                onChange(newValues);
            }
            // Don't close dropdown for multi-select
        } else {
            // Single select: just set the value and close
            onChange(newValue);
            setIsOpen(false);
        }
    };

    const isActive = () => {
        if (type === 'era') return selectedValues.length > 0;
        if (type === 'language') return value !== 'en';
        return false;
    };

    const eraCounts = countAuthorsPerEra({ excludeContemporary: true });

    const renderEraOptions = () => {
        return Object.values(ERAS).map(era => {
            // Skip 'all' for multi-select - we handle it separately
            if (era.id === 'all') {
                return (
                    <button
                        key={era.id}
                        className={`${styles.dropdownOption} ${selectedValues.length === 0 ? styles.selected : ''}`}
                        onClick={() => handleSelect('all')}
                    >
                        {era.label}
                        {selectedValues.length === 0 && (
                            <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                                    fill="currentColor"
                                />
                            </svg>
                        )}
                    </button>
                );
            }

            const isSelected = selectedValues.includes(era.id);

            return (
                <button
                    key={era.id}
                    className={`${styles.dropdownOption} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelect(era.id)}
                >
                    <span className={styles.checkboxWrapper}>
                        <span className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                            {isSelected && (
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                                        fill="currentColor"
                                    />
                                </svg>
                            )}
                        </span>
                    </span>
                    {era.label}
                    {/* Show count if available */}
                    {eraCounts[era.id] !== undefined && (
                        <span className={styles.countBadge}>{eraCounts[era.id]}</span>
                    )}
                </button>
            );
        });
    };

    // Render language options
    const renderLanguageOptions = () => {
        return (
            <>
                <button
                    className={`${styles.dropdownOption} ${value === 'en' ? styles.selected : ''}`}
                    onClick={() => handleSelect('en')}
                >
                    Engels
                    {value === 'en' && (
                        <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                                fill="currentColor"
                            />
                        </svg>
                    )}
                </button>

                <div className={styles.dropdownDivider}></div>

                <div className={styles.dropdownGroup}>
                    <div className={styles.groupLabel}>Binnenkort</div>
                    <button className={`${styles.dropdownOption} ${styles.disabled}`} disabled>
                        Nederlands
                    </button>
                    <button className={`${styles.dropdownOption} ${styles.disabled}`} disabled>
                        Duits
                    </button>
                    <button className={`${styles.dropdownOption} ${styles.disabled}`} disabled>
                        Frans
                    </button>
                </div>

                <div className={styles.dropdownDivider}></div>

                <a
                    href="https://www.poetryinternational.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dropdownLink}
                >
                    <svg className={styles.linkIcon} viewBox="0 0 24 24" fill="none">
                        <path
                            d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"
                            fill="currentColor"
                        />
                    </svg>
                    Meer talen op Poetry International
                </a>
            </>
        );
    };

    return (
        <div className={styles.filterDropdown} ref={dropdownRef}>
            <button
                className={`${styles.dropdownButton} ${isOpen ? styles.open : ''} ${isActive() ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.dropdownValue}>{getLabel()}</span>
                <div className={styles.dropdownArrow}>
                    <svg className={styles.arrowVector} viewBox="0 0 21 16">
                        <path d="M0 0L21 0L10.5 15L0 0Z" fill="#EFEFEF"/>
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {type === 'era' && renderEraOptions()}
                    {type === 'language' && renderLanguageOptions()}
                </div>
            )}
        </div>
    );
}
