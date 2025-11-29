import React, { useEffect, useState } from 'react';
import styles from '../Canvas.module.scss';

export function QualityStatusOverlay({
    isVisible,
    qualityMode,
    currentDimensions,
    onClose
}) {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 10000); // Auto-hide after 10 seconds
            return () => clearTimeout(timer);
        } else {
            // Delay unmounting for animation
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!shouldRender) return null;

    const getQualityLabel = (mode) => {
        switch (mode) {
            case 'auto': return 'Auto (Optimal)';
            case 'high': return 'High (2K/4K)';
            case 'max': return 'Max (Original)';
            default: return mode;
        }
    };

    return (
        <div className={`${styles.qualityStatusOverlay} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.qualityStatusContent}>
                <span className={styles.qualityLabel}>Kwaliteit:</span>
                <span className={styles.qualityValue}>{getQualityLabel(qualityMode)}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.dimensionsLabel}>Afmetingen:</span>
                <span className={styles.dimensionsValue}>
                    {currentDimensions ? `${currentDimensions.width} × ${currentDimensions.height}` : 'Laden...'}
                </span>
            </div>
        </div>
    );
}
