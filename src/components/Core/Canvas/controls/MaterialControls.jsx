import React from 'react';
import styles from '../CanvasControls.module.scss';

const AVAILABLE_MATERIALS = [
    { name: 'Geen', value: null },
    { name: 'Beton (Geschilderd)', value: '/textures/webp/concrete_floor_painted_diff_2k.webp' },
    { name: 'Beton (Muur 1)', value: '/textures/webp/concrete_wall_001_diff_2k.webp' },
    { name: 'Beton (Muur 3)', value: '/textures/webp/concrete_wall_003_diff_2k.webp' },
    { name: 'Beton (Gebarsten)', value: '/textures/webp/cracked_concrete_wall_diff_2k.webp' },
    { name: 'Beton (Vuil)', value: '/textures/webp/dirty_concrete_diff_2k.webp' },
    { name: 'Fabrieksmuur', value: '/textures/webp/factory_wall_diff_2k.webp' },
    { name: 'Metaal (Roestig Groen)', value: '/textures/webp/green_metal_rust_diff_2k.webp' },
    { name: 'Metaal (Plaat)', value: '/textures/webp/metal_plate_diff_2k.webp' },
    { name: 'Pleisterwerk (Geschilderd)', value: '/textures/webp/painted_plaster_wall_diff_2k.webp' },
    { name: 'Pleisterwerk (Rood)', value: '/textures/webp/red_plaster_weathered_diff_2k.webp' },
    { name: 'Roest (Grof)', value: '/textures/webp/rust_coarse_01_diff_2k.webp' },
    { name: 'Roest (Metaal 2)', value: '/textures/webp/rusty_metal_02_diff_2k.webp' },
    { name: 'Pleisterwerk (Wit Ruw)', value: '/textures/webp/white_rough_plaster_diff_2k.webp' },
    { name: 'Pleisterwerk (Mos)', value: '/textures/webp/worn_mossy_plasterwall_diff_2k.webp' },
    { name: 'Pleisterwerk (Geel)', value: '/textures/webp/yellow_plaster_diff_2k.webp' },
];

import TextEffectControls from './TextEffectControls';

export default function MaterialControls({
    textMaterial,
    onTextMaterialChange,
    textPadding,
    onTextPaddingChange,
    textEffectMode,
    setTextEffectMode,
    textEffectParams,
    setTextEffectParams,
    isOpen,
    setIsOpen
}) {
    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className={styles.controlSection}>
            <button
                className={styles.sectionHeader}
                onClick={toggle}
                aria-expanded={isOpen}
            >
                <h3>🧱 Materiaal & Achtergrond</h3>
                <span className={styles.arrow}>{isOpen ? '▼' : '▶'}</span>
            </button>

            {isOpen && (
                <div className={styles.sectionContent}>
                    <div className={styles.controlGroup}>
                        <label>Materiaal</label>
                        <select
                            value={textMaterial || ''}
                            onChange={(e) => onTextMaterialChange(e.target.value || null)}
                            className={styles.select}
                        >
                            {AVAILABLE_MATERIALS.map((mat) => (
                                <option key={mat.name} value={mat.value || ''}>
                                    {mat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {textMaterial && (
                        <div className={styles.controlGroup}>
                            <label>Padding: {textPadding}px</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={textPadding}
                                onChange={(e) => onTextPaddingChange(Number(e.target.value))}
                                className={styles.slider}
                            />
                        </div>
                    )}

                    <TextEffectControls
                        effectMode={textEffectMode}
                        onEffectModeChange={setTextEffectMode}
                        effectParams={textEffectParams}
                        onEffectParamsChange={setTextEffectParams}
                    />
                </div>
            )}
        </div>
    );
}
