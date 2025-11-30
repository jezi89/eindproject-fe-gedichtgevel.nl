import {useMemo, useState} from "react";
import {useWindowSize} from "../useWindowSize.js";

/**
 * Custom hook for responsive canvas sizing with fixed controls/nav widths
 */
export function useResponsiveCanvas() {
    const {width: windowWidth, height: windowHeight} = useWindowSize();
    const [controlsVisible, setControlsVisible] = useState(true);
    const [navVisible, setNavVisible] = useState(true);

    const layout = useMemo(() => {
        const safeWindowWidth = windowWidth || 1920;
        const safeWindowHeight = windowHeight || 1080;

        return {
            windowWidth: safeWindowWidth,
            windowHeight: safeWindowHeight,
            controlsWidth: 340,
            navWidth: 120,
            canvasWidth: Math.round(safeWindowWidth),
            canvasHeight: Math.round(safeWindowHeight),
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