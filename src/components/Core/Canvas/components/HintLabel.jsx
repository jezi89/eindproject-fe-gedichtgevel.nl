import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './HintLabel.module.scss';

/**
 * HintLabel - Floating hint that appears above all content using Portal
 * Shows animated hint pointing to a target button for ~6 seconds
 */
export default function HintLabel({ targetRef, text, duration = 6000 }) {
    const [isVisible, setIsVisible] = useState(true);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const hintRef = useRef(null);

    // Calculate position relative to target button
    useEffect(() => {
        if (!targetRef?.current || !isVisible) return;

        const updatePosition = () => {
            const buttonRect = targetRef.current.getBoundingClientRect();
            const hintWidth = hintRef.current?.offsetWidth || 200;

            setPosition({
                top: buttonRect.top + buttonRect.height / 2,
                left: buttonRect.left - hintWidth - 8, // 8px gap
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [targetRef, isVisible]);

    // Auto-hide after duration
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    // Hide on target button hover/click
    useEffect(() => {
        if (!targetRef?.current) return;

        const handleInteraction = () => setIsVisible(false);
        const button = targetRef.current;

        button.addEventListener('mouseenter', handleInteraction);
        button.addEventListener('click', handleInteraction);

        return () => {
            button.removeEventListener('mouseenter', handleInteraction);
            button.removeEventListener('click', handleInteraction);
        };
    }, [targetRef]);

    if (!isVisible) return null;

    return createPortal(
        <div
            ref={hintRef}
            className={styles.hintLabel}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateY(-50%)',
            }}
        >
            {text}
        </div>,
        document.body
    );
}
