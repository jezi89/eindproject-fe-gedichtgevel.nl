import {useMemo, useState} from "react";
import {useWindowSize} from "../useWindowSize.js";

/**
 * Custom hook for responsive canvas sizing with fixed controls/nav widths
 */
const MOBILE_BREAKPOINT = 768;

export function useResponsiveCanvas() {
    const {width: windowWidth, height: windowHeight} = useWindowSize();
    // Op mobiel starten beide panelen dicht zodat het canvas direct zichtbaar is;
    // de mobiele cycle-knop (☰) opent daarna Nav of Controls één voor één.
    const startsMobile = () => (typeof window !== "undefined" ? window.innerWidth : 1920) <= MOBILE_BREAKPOINT;
    const [controlsVisible, setControlsVisible] = useState(() => !startsMobile());
    const [navVisible, setNavVisible] = useState(() => !startsMobile());

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