import { useEffect, useCallback } from 'react';

/**
 * A hook to detect a keyboard shortcut (e.g., Alt+G) without causing re-renders.
 * @param {function} callback The function to execute when the shortcut is pressed.
 */
export const useEasterEgg = (callback) => {
    const onKeyDown = useCallback((event) => {
        // Check for Alt+G combination
        if (event.altKey && event.key.toLowerCase() === 'g') {
            // Prevent default browser action (e.g., focus search bar in some browsers)
            event.preventDefault();
            callback();
        }
    }, [callback]);

    useEffect(() => {
        // Add event listener when the component mounts
        window.addEventListener('keydown', onKeyDown);

        // Remove event listener on cleanup
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);
};
