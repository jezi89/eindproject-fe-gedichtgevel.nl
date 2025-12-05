import React from 'react';
import styles from '../CanvasControls.module.scss';

export default function TextEffectControls({
    effectMode,
    onEffectModeChange,
    effectParams,
    onEffectParamsChange
}) {
    const handleParamChange = (param, value) => {
        onEffectParamsChange({
            ...effectParams,
            [param]: parseFloat(value)
        });
    };

    return (
        <div className={styles.subsection}>
            <div className={styles.subsectionHeader}>
                <span>Tekst Effect</span>
            </div>
            
            <div className={styles.subsectionContent}>
                <div className={styles.controlGroup}>
                    <label>Stijl</label>
                    <select
                        value={effectMode}
                        onChange={(e) => {
                            const val = e.target.value;
                            onEffectModeChange(val);
                        }}
                        className={styles.select}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="none">Geen</option>
                        <option value="painted">Painted (Verf/Inkt)</option>
                        <option value="raised">Raised (Losliggend)</option>
                        <option value="engraved">Engraved (Gegraveerd)</option>
                    </select>
                </div>

                {effectMode === 'painted' && (
                    <>
                        <div className={styles.controlGroup}>
                            <div className={styles.valueRow}>
                                <label>Dekking / Slijtage</label>
                                <span>{Math.round(effectParams.opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={effectParams.opacity}
                                onChange={(e) => handleParamChange('opacity', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                        <div className={styles.controlGroup}>
                            <div className={styles.valueRow}>
                                <label>Vervaging (Blur)</label>
                                <span>{effectParams.blur}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={effectParams.blur}
                                onChange={(e) => handleParamChange('blur', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                    </>
                )}

                {effectMode === 'raised' && (
                    <div className={styles.controlGroup}>
                        <div className={styles.valueRow}>
                            <label>Hoogte / Richting</label>
                            <span>{effectParams.distance}px</span>
                        </div>
                        <input
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={effectParams.distance}
                            onChange={(e) => handleParamChange('distance', e.target.value)}
                            className={styles.slider}
                        />
                    </div>
                )}

                {effectMode === 'engraved' && (
                    <>
                        <div className={styles.controlGroup}>
                            <div className={styles.valueRow}>
                                <label>Diepte</label>
                                <span>{effectParams.depth}px</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="0.5"
                                value={effectParams.depth}
                                onChange={(e) => handleParamChange('depth', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                        <div className={styles.controlGroup}>
                            <div className={styles.valueRow}>
                                <label>Dekking (Transparantie)</label>
                                <span>{Math.round((effectParams.opacity !== undefined ? effectParams.opacity : 1) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={effectParams.opacity !== undefined ? effectParams.opacity : 1}
                                onChange={(e) => handleParamChange('opacity', e.target.value)}
                                className={styles.slider}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
