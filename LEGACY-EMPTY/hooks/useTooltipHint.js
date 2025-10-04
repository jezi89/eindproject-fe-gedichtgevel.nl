// TODO - Checken hoe deze useTooltipHint werkt en of ie gebruikt wordt

/**
 * useTooltipHint Hook
 * Extracted toast/tooltip functionality from PoemResultItem
 * Manages hover hints with cooldown functionality
 */

import {useState, useRef, useEffect, useCallback} from 'react';

const useTooltipHint = (enabled = true) => {
    const [showToast, setShowToast] = useState(false);
    const [lastToastTime, setLastToastTime] = useState(0);
    const toastTimeoutRef = useRef(null);

    const TOAST_COOLDOWN = 3000; // 3 seconds cooldown
    const TOAST_DURATION = 4000; // 4 seconds display time

    // Cleanup toast timeout on unmount
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    // Show toast on mouse enter (with cooldown)
    const handleMouseEnter = useCallback(() => {
        if (!enabled) return;

        const now = Date.now();

        if (now - lastToastTime > TOAST_COOLDOWN) {
            // Toast: Showing
            setShowToast(true);
            setLastToastTime(now);

            // Clear any existing timeout
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }

            // Auto-hide toast after duration
            toastTimeoutRef.current = setTimeout(() => {
                setShowToast(false);
                toastTimeoutRef.current = null;
            }, TOAST_DURATION);
        }
    }, [enabled, lastToastTime]);

    // Hide toast on mouse leave
    const handleMouseLeave = useCallback(() => {
        // Clear timeout and hide toast immediately
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
        setShowToast(false);
    }, []);

    // Manual show/hide functions
    const showTooltip = useCallback(() => {
        if (!enabled) return;
        setShowToast(true);
    }, [enabled]);

    const hideTooltip = useCallback(() => {
        setShowToast(false);
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
    }, []);

    return {
        showToast,
        handleMouseEnter,
        handleMouseLeave,
        showTooltip,
        hideTooltip
    };
};

export default useTooltipHint;