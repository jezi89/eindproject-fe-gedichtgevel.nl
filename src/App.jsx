import '@/index.scss';
import { Outlet, useLocation } from "react-router"; // Import Outlet
import {NavBar} from "@/layouts/NavBar/NavBar.jsx";
import {useWindowSize} from "@/hooks/useWindowSize.js";
import {useEffect, useState} from "react";
// import StatusBanner from "@/layouts/StatusBanner/StatusBanner.jsx";
// import styles from "@/styles/pageStylesTemp.module.css";


export default function App() {
    const location = useLocation();
    const {height: windowHeight} = useWindowSize();
    const [navbarOverlayOpen, setNavbarOverlayOpen] = useState(false);
    const isHomePage = location.pathname === "/"
    const isDesignPage = location.pathname.startsWith("/designgevel")

    // Close navbar overlay when route changes
    useEffect(() => {
        setNavbarOverlayOpen(false);
    }, [location.pathname]);

    // Pass toggle function to Outlet context so DesignPage can access it
    const outletContext = {
        toggleNavbarOverlay: () => setNavbarOverlayOpen(prev => !prev),
        navbarOverlayOpen
    };

    return (
        <div className={`app ${isDesignPage ? 'design-page' : ''}`}>
            <NavBar
                isOverlayOpen={navbarOverlayOpen}
                onOverlayClose={() => setNavbarOverlayOpen(false)}
            />
            <div
                className={`app-content ${isDesignPage ? 'design-page-layout' : ''}`}
                style={isDesignPage ? {height: `${windowHeight}px`} : undefined}
            >
                <Outlet context={outletContext}/> {/* Placeholder required to let React Router know where to render the child routes */}
            </div>
            {/*{isHomePage && <StatusBanner/>}*/}
        </div>
    );
}
