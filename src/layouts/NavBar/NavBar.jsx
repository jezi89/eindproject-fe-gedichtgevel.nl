/**
 * NavBar Component
 *
 * Main navigation for the gedichtgevel.nl application.
 * Handles responsive menu and authentication-related navigation.
 *
 * @module layouts/NavBar/NavBar
 */

import {useState} from "react";
import {Link} from "react-router";
import MainNavLink from "./MainNavLink.jsx";
import styles from "./NavBar.module.scss"
import {useAuth} from "@/hooks/useAuth.js";

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

    // Authentication - get user and signOut from refactored useAuth hook
    const {user, signOut} = useAuth();


    /**
     * Toggles mobile menu open/closed state
     */
    function toggleMenu() {
        // Toggle menu state
        setIsMenuOpen(prevState => !prevState);
    }

    /**
     * Handles user logout
     * Prevents default link behavior and calls signOut
     *
     * @param {React.MouseEvent} e - Click event
     */
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut();
            // Navigation is handled by auth state change
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

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

                        {/* Authentication-related links with conditional rendering */}
                        {user ? (
                            <>
                                {/* Show account link when logged in */}
                                <li className={styles.navLink}>
                                    <MainNavLink to="/account">Mijn Account</MainNavLink>
                                </li>
                                {/* Show logout button when logged in */}
                                <li className={styles.navLink}>
                                    <a
                                        href="#"
                                        onClick={handleLogout}
                                        className={styles.defaultMenuLink}
                                    >
                                        Uitloggen
                                    </a>
                                </li>
                            </>
                        ) : (
                            /* Show login/register link when not logged in */
                            <li className={styles.navLink}>
                                <MainNavLink to="/welkom">Login/Registreer</MainNavLink>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
            {/* Mobile menu overlay */}
            {isMenuOpen && <div className={styles.menuOverlay} onClick={toggleMenu}></div>}
        </div>
    );
}

export default NavBar;


