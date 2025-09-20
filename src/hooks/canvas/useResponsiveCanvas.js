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
        // Fixed dimensions - maintain minimum ratios
        const baseControlsWidth = 340;
        const baseNavWidth = 120;
        const baseScreenWidth = 1920;
        
        // Ensure we have valid window dimensions
        const safeWindowWidth = windowWidth || 1920;
        const safeWindowHeight = windowHeight || 1080;

        // Calculate widths - never smaller than base ratios
        const controlsWidth = controlsVisible
            ? Math.max(
                baseControlsWidth,
                (baseControlsWidth / baseScreenWidth) * safeWindowWidth
            )
            : 0;
        const navWidth = navVisible
            ? Math.max(baseNavWidth, (baseNavWidth / baseScreenWidth) * safeWindowWidth)
            : 0;

        // Canvas takes remaining space
        const canvasWidth = safeWindowWidth - controlsWidth - navWidth;
        return {
            windowWidth: safeWindowWidth,
            windowHeight: safeWindowHeight,
            controlsWidth: Math.round(controlsWidth),
            navWidth: Math.round(navWidth),
            canvasWidth: Math.max(300, Math.round(canvasWidth)), // Minimum canvas width
            canvasHeight: Math.max(200, Math.round(safeWindowHeight)), // Minimum canvas height
            controlsVisible,
            navVisible,
            leftSpacer: 0, // No spacers
            rightSpacer: 0, // No spacers
        };
    }, [windowWidth, windowHeight, controlsVisible, navVisible]);

    const toggleControls = () => setControlsVisible(!controlsVisible);
    const toggleNav = () => setNavVisible(!navVisible);

    return {
        ...layout,
        toggleControls,
        toggleNav,
    };
}
