/**
 * NavBar Component
 *
 * Main navigation for the gedichtgevel.nl application.
 * Handles responsive menu and authentication-related navigation.
 *
 * @module layouts/NavBar/NavBar
 */

import {useState, useRef, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router";
import MainNavLink from "./MainNavLink.jsx";
import {ActionButton} from "@/components/ui/button/ActionButton.jsx";
import styles from "./NavBar.module.scss"
import {useAuth} from "@/hooks/auth/useAuth.js";

/**
 * NavBar component for main site navigation
 *
 * @component
 * @returns {JSX.Element} Navigation bar component
 */
function NavBar({isOverlayOpen, onOverlayClose}) {
    // States
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Route detection
    const location = useLocation();
    const isDesignPage = location.pathname.startsWith("/designgevel");

    const navigate = useNavigate();

    // Authentication
    const {user, signOut} = useAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * Toggles mobile menu open/closed state
     */
    function toggleMenu() {
        setIsMenuOpen(prevState => !prevState);
    }

    /**
     * Handles user logout
     * @param {React.MouseEvent} e - Click event
     */
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut();
            navigate('/'); // Navigate to homepage after logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Single auth button component to ensure DRY
    const AuthButton = ({className = '', fullWidth = false}) => (
        user ? (
            <ActionButton
                onClick={handleLogout}
                className={`${styles.authButton} ${className}`}
                fullWidth={fullWidth}
            >
                Uitloggen
            </ActionButton>
        ) : (
            <ActionButton
                as={Link}
                to="/welkom"
                className={`${styles.authButton} ${className}`}
                fullWidth={fullWidth}
            >
                Inloggen/Registreren
            </ActionButton>
        )
    );

    return (
        <div className={`${styles.navbar} ${isDesignPage ? styles.fixedOverlay : ''} ${isDesignPage && isOverlayOpen ? styles.open : ''}`}>
            <div className={styles.navbarContainer}>
                {/* Logo - always visible */}
                <Link to="/" className={styles.logo}>
                    GedichtGevel
                </Link>

                {/* Close button for overlay mode on DesignPage */}
                {isDesignPage && isOverlayOpen && (
                    <button
                        className={styles.overlayCloseButton}
                        onClick={onOverlayClose}
                        aria-label="Sluit navigatie"
                    >
                        ✕
                    </button>
                )}

                {/* Desktop navigation wrapper */}
                <nav className={styles.desktopNav}> {/* Changed from div, use <nav> for semantics */}
                    <ul className={styles.navLinks}> {/* This is the <ul> */}
                        <li className={styles.navLink}>
                            <MainNavLink to="/designgevel">Designgevel</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/spreekgevel">Spreekgevel</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/collectiegevel">Collectiegevel</MainNavLink>
                        </li>
                        {user && (
                            <li className={styles.navLink}>
                                <MainNavLink to="/account">Mijn Account</MainNavLink>
                            </li>
                        )}
                        {/* Dropdown menu */}
                        <li className={`${styles.navLink} ${styles.dropdown}`} ref={dropdownRef}>
                            <button
                                className={styles.dropdownToggle} // This button has anchor-name via SCSS
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                aria-expanded={isDropdownOpen}
                                aria-controls="meer-dropdown-menu" // Good for accessibility
                            >
                                Meer <span className={styles.arrow} aria-hidden="true">▼</span>
                            </button>
                            <div
                                id="meer-dropdown-menu" // For aria-controls
                                className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.open : ''}`}
                            >
                                <Link to="/hoedan" onClick={() => setIsDropdownOpen(false)}>Hoe dan?</Link>
                                <Link to="/voorwaarden" onClick={() => setIsDropdownOpen(false)}>Voorwaarden</Link>
                                <Link to="/contact" onClick={() => setIsDropdownOpen(false)}>Over ons</Link>
                            </div>
                        </li>
                    </ul>
                </nav>

                {/* Desktop Auth Button Area */}
                <div className={styles.desktopAuth}>
                    <AuthButton/> {/* AuthButton component already applies .authButton */}
                </div>

                {/* Mobile controls: AuthButton and MenuToggle */}
                <div className={styles.mobileControls}>
                    <AuthButton/> {/* Mobile Auth Button */}
                    <button
                        className={`${styles.menuToggle} ${isMenuOpen ? styles.isOpen : ''}`}
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Sluit menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu-nav" // Good for accessibility
                    >
                        <span aria-hidden="true"></span>
                    </button>
                </div>
            </div>
            {/* End of navbarContainer */}

            {/* Mobile menu (ensure it has an id for aria-controls) */}
            <nav
                id="mobile-menu-nav"
                className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}
                aria-hidden={!isMenuOpen}
            >
                <ul>
                    <li className={styles.navLink}>
                        <MainNavLink to="/designgevel" onClick={toggleMenu}>Designgevel</MainNavLink>
                    </li>
                    <li className={styles.navLink}>
                        <MainNavLink to="/spreekgevel" onClick={toggleMenu}>Spreekgevel</MainNavLink>
                    </li>
                    <li className={styles.navLink}>
                        <MainNavLink to="/collectiegevel" onClick={toggleMenu}>Collectiegevel</MainNavLink>
                    </li>
                    {user && (
                        <li className={styles.navLink}>
                            <MainNavLink to="/account" onClick={toggleMenu}>Mijn Account</MainNavLink>
                        </li>
                    )}
                    <li className={styles.navLink}>
                        <Link to="/hoedan" onClick={toggleMenu}>Hoe dan?</Link>
                    </li>
                    <li className={styles.navLink}>
                        <Link to="/voorwaarden" onClick={toggleMenu}>Voorwaarden</Link>
                    </li>
                    <li className={styles.navLink}>
                        <Link to="/contact" onClick={toggleMenu}>Over ons</Link>
                    </li>
                </ul>
            </nav>

            {/* Mobile menu overlay */}
            {isMenuOpen && ( // Conditionally render overlay or use class for visibility
                <div
                    className={`${styles.menuOverlay} ${isMenuOpen ? styles.open : ''}`}
                    onClick={toggleMenu}
                    aria-hidden="true"
                ></div>
            )}
        </div>
    );
}

export default NavBar;