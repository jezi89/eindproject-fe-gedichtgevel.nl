/**
 * NavBar Component
 *
 * Main navigation for the gedichtgevel.nl application.
 * Handles responsive menu and authentication-related navigation.
 *
 * @module layouts/NavBar/NavBar
 */

import {useState} from "react";
// eslint-disable-next-line import/named
import {Link} from "react-router-dom";
import MainNavLink from "./MainNavLink.jsx";
import styles from "./NavBar.module.scss"
// import {useAuth} from "@/hooks/useAuth.js";

/**
 * NavBar component for main site navigation
 *
 * @component
 * @returns {JSX.Element} Navigation bar component
 */
function NavBar() {
    // States
    // - isMenuOpen: Whether mobile menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const {user, signOut} = useAuth(); // Get user and signOut function from auth context

    // Authentication
    // - Get user and signOut function from auth context


    /**
     * Toggles mobile menu open/closed state
     */
    function toggleMenu() {
        // Toggle menu state
        setIsMenuOpen(prevState => !prevState);
    }

    // /**
    //  * Handles user logout
    //  *
    //  * @param {React.MouseEvent} e - Click event
    //  */
    // function handleLogout(e) {
    //     // Prevent default link behavior
    //     // Call signOut function
    //     e.preventDefault();
    //     signOut();
    // }

    return (
        // Navigation container
        <div className={styles.navbar}>
            <div className={styles.navbarContainer}>

                {/* Logo/brand link */}
                <Link to="/" className={styles.logo}>
                    GedichtGevel
                </Link>

                {/* Mobile menu toggle button */}
                <button className={styles.menuToggle} onClick={toggleMenu}>
                    {isMenuOpen ? 'Sluit Menu' : 'Open Menu'}
                </button>

                <nav className={`${styles.navLinks} ${isMenuOpen ? styles.open : ''}`}>
                    <ul>
                        <li className={styles.navLink}>
                            <MainNavLink to="/designgevel">Designgevel</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/spreekgevel">Spreekgevel</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/collectiegevel">Collectiegevel</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/overmij">Over Mij</MainNavLink>
                        </li>

                        {/*Conditional rendering based on authentication state with Authentication-related links*/}
                        {/* {user ? (
                            <>
                                <li className={styles.navLink}>
                                    <a href="#" onClick={handleLogout} className={styles.defaultMenuLink}>Uitloggen</a>
                                </li>
                            </>) : (
                            <li className={styles.navLink}>
                                <MainNavLink to="/welkom">Login/Registreer</MainNavLink>
                            </li>
                        )} */}
                        <li className={styles.navLink}>
                            <MainNavLink to="/welkom">Login/Registreer</MainNavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            {/* Mobile menu overlay */}
            {isMenuOpen && <div className={styles.menuOverlay} onClick={toggleMenu}></div>}
        </div>
    );
}

export default NavBar;


