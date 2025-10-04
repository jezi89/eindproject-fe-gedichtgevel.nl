/**
 * FilterToggle Component
 * Toggle switch for enabling/disabling filter options
 * Currently displays a disabled mock-up for "Creative Canvas" filter
 */

import { useState } from 'react';
import styles from './FilterToggle.module.scss';

/**
 * @param {Object} props
 * @param {boolean} props.checked - Toggle state
 * @param {function} props.onChange - Callback when toggle changes
 * @param {string} props.label - Toggle label text
 * @param {boolean} [props.disabled=false] - Whether toggle is disabled
 * @param {string} [props.tooltipText] - Tooltip text to display on hover
 */
export function FilterToggle({
    checked,
    onChange,
    label,
    disabled = false,
    tooltipText
}) {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const handleMouseEnter = () => {
        if (disabled && tooltipText) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div
            className={`${styles.filterToggle} ${disabled ? styles.disabled : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                className={styles.toggleLabel}
                onClick={handleToggle}
                disabled={disabled}
            >
                <span className={styles.labelText}>{label}</span>
            </button>

            {showTooltip && tooltipText && (
                <div className={styles.tooltip}>
                    <svg className={styles.tooltipIcon} viewBox="0 0 24 24" fill="none">
                        <path
                            d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                            fill="currentColor"
                        />
                    </svg>
                    <span className={styles.tooltipText}>{tooltipText}</span>
                </div>
            )}
        </div>
    );
}
