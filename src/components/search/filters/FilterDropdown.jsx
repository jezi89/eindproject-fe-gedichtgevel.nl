/**
 * FilterDropdown Component
 * Dropdown selector for era and language filters
 */

import { useState, useRef, useEffect } from 'react';
import { ERAS } from '@/utils/eraMapping.js';
import styles from './FilterDropdown.module.scss';

/**
 * @param {Object} props
 * @param {string} props.type - 'era' or 'language'
 * @param {string} props.value - Current selected value
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
            const era = Object.values(ERAS).find(e => e.id === value);
            return era ? era.label : ERAS.ALL.label;
        }
        if (type === 'language') {
            return value === 'en' ? 'Engels' : 'Selecteer taal';
        }
        return 'Selecteer...';
    };

    const handleSelect = (newValue) => {
        onChange(newValue);
        setIsOpen(false);
    };

    const isActive = () => {
        if (type === 'era') return value !== ERAS.ALL.id;
        if (type === 'language') return value !== 'en';
        return false;
    };

    // Render era options
    const renderEraOptions = () => {
        return Object.values(ERAS).map(era => (
            <button
                key={era.id}
                className={`${styles.dropdownOption} ${value === era.id ? styles.selected : ''}`}
                onClick={() => handleSelect(era.id)}
            >
                {era.label}
                {value === era.id && (
                    <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            fill="currentColor"
                        />
                    </svg>
                )}
            </button>
        ));
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
