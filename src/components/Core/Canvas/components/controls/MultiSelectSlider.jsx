// src/components/Core/Canvas/components/controls/MultiSelectSlider.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../Canvas.module.scss'; // Updated import path

const MultiSelectSlider = ({
  label,
  min,
  max,
  step,
  values, // Array of values from selected lines
  onChange,
  unit = '',
}) => {
  const isVariable = new Set(values).size > 1;
  const initialValue = isVariable ? 0 : values[0] || 0;

  const [displayValue, setDisplayValue] = useState(initialValue);
  const [isInteracting, setIsInteracting] = useState(false);



  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    setDisplayValue(newValue);
    onChange(newValue, isVariable); // Pass isVariable to indicate relative change
  };

  return (
    <div className={`${styles.controlRow} ${styles.verticalControlRow}`}>
      <label>{label}</label>
      <div className={styles.lineControls}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleSliderChange}
          onMouseDown={() => setIsInteracting(true)}
          onMouseUp={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
        />
        <span>
          {isVariable && !isInteracting ? 'Variable' : `${displayValue}${unit}`}
        </span>
      </div>
    </div>
  );
};

export default MultiSelectSlider;
