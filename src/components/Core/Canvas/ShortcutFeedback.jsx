// src/components/Core/Canvas/components/ShortcutFeedback.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './ShortcutFeedback.module.scss';

export default function ShortcutFeedback({ activeShortcut }) {
  if (!activeShortcut) return null;

  const feedbackContent = (
    <div className={styles.feedbackContainer}>
      <div className={styles.feedbackCard}>
        <span className={styles.feedbackIcon}>⌨️</span>
        <span className={styles.feedbackText}>{activeShortcut}</span>
      </div>
    </div>
  );

  return createPortal(feedbackContent, document.body);
}
