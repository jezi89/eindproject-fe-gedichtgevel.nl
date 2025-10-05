/**
 * FilterSlider Component
 * Range slider for filtering poems by line count
 * Provides visual hints for long poems
 */

import { useState } from 'react';
import styles from './FilterSlider.module.scss';

/**
 * @param {Object} props
 * @param {number} props.value - Current slider value
 * @param {function} props.onChange - Callback when value changes
 * @param {number} [props.min=10] - Minimum value
 * @param {number} [props.max=150] - Maximum value
 * @param {string} [props.label='Maximale lengte'] - Slider label
 */
export function FilterSlider({
    value,
    onChange,
    min = 10,
    max = 250,
    label = 'Maximale lengte'
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e) => {
        onChange(parseInt(e.target.value, 10));
    };

    const getHintMessage = () => {
        if (value > 60) {
            return {
                text: 'Let op: Gedichten langer dan 60 regels zijn vaak moeilijk leesbaar, zelfs met een klein lettertype.',
                type: 'warning'
            };
        }
        if (value > 40) {
            return {
                text: 'Hint: Gedichten langer dan 40 regels kunnen krap worden op het canvas.',
                type: 'info'
            };
        }
        return null;
    };

    const hint = getHintMessage();
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={styles.filterSlider}>
            <div className={styles.sliderHeader}>
                <label className={styles.sliderLabel} htmlFor="length-slider">
                    {label}
                </label>
                <span className={styles.sliderValue}>{value} regels</span>
            </div>

            <div className={styles.sliderContainer}>
                <input
                    id="length-slider"
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
                    style={{
                        background: `linear-gradient(to right,
                            var(--primary-color) 0%,
                            var(--primary-color) ${percentage}%,
                            #ddd ${percentage}%,
                            #ddd 100%)`
                    }}
                />
                <div className={styles.sliderTicks}>
                    <span className={styles.tick}>{min}</span>
                    <span className={styles.tick}>50</span>
                    <span className={styles.tick}>100</span>
                    <span className={styles.tick}>150</span>
                    <span className={styles.tick}>200</span>
                    <span className={styles.tick}>{max}</span>
                </div>
            </div>

            {hint && (
                <div className={`${styles.hint} ${styles[hint.type]}`}>
                    <svg
                        className={styles.hintIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                            fill="currentColor"
                        />
                    </svg>
                    <span className={styles.hintText}>{hint.text}</span>
                </div>
            )}
        </div>
    );
}
