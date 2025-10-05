import React from 'react';
import styles from './Tooltip.module.scss';

export function Tooltip({ message, show, targetRef }) {
    if (!show || !targetRef.current) {
        return null;
    }

    const targetRect = targetRef.current.getBoundingClientRect();
    const top = targetRect.bottom + window.scrollY + 5; // 5px onder het element
    const left = targetRect.left + window.scrollX;

    return (
        <div className={styles.tooltip} style={{ top: `${top}px`, left: `${left}px` }}>
            {message}
        </div>
    );
}
