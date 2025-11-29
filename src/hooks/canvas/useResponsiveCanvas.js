import {useMemo, useState} from "react";
// Import path aangepast voor hoofdproject
import {useWindowSize} from "../useWindowSize.js";

/**
 * Custom hook for responsive canvas sizing with fixed controls/nav widths
 * Controls: 340px minimum, Nav: 120px minimum, no spacers
 */
export function useResponsiveCanvas() {
    const {width: windowWidth, height: windowHeight} = useWindowSize();
    const [controlsVisible, setControlsVisible] = useState(true);
    const [navVisible, setNavVisible] = useState(true);

    const layout = useMemo(() => {
        const safeWindowWidth = windowWidth || 1920;
        const safeWindowHeight = windowHeight || 1080;

        // Canvas ALWAYS full viewport size - ignore panel visibility
        // Panels are overlays, not part of layout calculation
        return {
            windowWidth: safeWindowWidth,
            windowHeight: safeWindowHeight,
            controlsWidth: 340,  // Fixed, not dependent on visibility
            navWidth: 120,       // Fixed
            canvasWidth: Math.round(safeWindowWidth),   // ALWAYS full width
            canvasHeight: Math.round(safeWindowHeight), // ALWAYS full height
            controlsVisible,
            navVisible,
        };
    }, [windowWidth, windowHeight, controlsVisible, navVisible]);

    const toggleControls = () => setControlsVisible(prev => !prev);
    const toggleNav = () => setNavVisible(prev => !prev);

    return {
        ...layout,
        toggleControls,
        toggleNav,
    };
}