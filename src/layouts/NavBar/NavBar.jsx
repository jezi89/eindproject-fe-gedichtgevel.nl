/**
 * NavBar Component
 *
 * Main navigation for the gedichtgevel.nl application.
 * Handles responsive menu and authentication-related navigation.
 *
 * @module layouts/NavBar/NavBar
 */

import {useState, useRef, useEffect} from "react";
import {Link} from "react-router";
import MainNavLink from "./MainNavLink.jsx";
import {ActionButton} from "@/components/ui/button/ActionButton.jsx";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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
            // Navigation is handled by auth state change
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
        <div className={styles.navbar}>
            <div className={styles.navbarContainer}>
                {/* Logo - always visible */}
                <Link to="/" className={styles.logo}>
                    GedichtGevel
                </Link>

                {/* Desktop navigation wrapper */}
                <div className={styles.desktopNavWrapper}>
                    <nav className={styles.navLinks}>
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
                            {/* Account link when logged in */}
                            {user && (
                                <li className={styles.navLink}>
                                    <MainNavLink to="/account">Mijn Account</MainNavLink>
                                </li>
                            )}
                            {/* Dropdown menu */}
                            <li className={`${styles.navLink} ${styles.dropdown}`} ref={dropdownRef}>
                                <button 
                                    className={styles.dropdownToggle}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    aria-expanded={isDropdownOpen}
                                >
                                    Meer <span className={styles.arrow}>▼</span>
                                </button>
                                <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.open : ''}`}>
                                    <Link to="/hoedan" onClick={() => setIsDropdownOpen(false)}>Hoe dan?</Link>
                                    <Link to="/voorwaarden" onClick={() => setIsDropdownOpen(false)}>Voorwaarden</Link>
                                    <Link to="/contact" onClick={() => setIsDropdownOpen(false)}>Over ons</Link>
                                </div>
                            </li>
                        </ul>
                    </nav>
                    
                    {/* Desktop auth button */}
                    <AuthButton />
                </div>

                {/* Mobile controls */}
                <div className={styles.mobileControls}>
                    {/* Mobile auth button - always visible */}
                    <AuthButton />
                    
                    {/* Hamburger menu toggle */}
                    <button 
                        className={`${styles.menuToggle} ${isMenuOpen ? styles.isOpen : ''}`} 
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Sluit menu' : 'Open menu'}
                    >
                        <span></span>
                    </button>
                </div>

                {/* Mobile menu */}
                <nav className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
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
                        {/* Account link when logged in */}
                        {user && (
                            <li className={styles.navLink}>
                                <MainNavLink to="/account" onClick={toggleMenu}>Mijn Account</MainNavLink>
                            </li>
                        )}
                        {/* Dropdown items in mobile menu */}
                        <li className={styles.navLink}>
                            <MainNavLink to="/hoedan" onClick={toggleMenu}>Hoe dan?</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/voorwaarden" onClick={toggleMenu}>Voorwaarden</MainNavLink>
                        </li>
                        <li className={styles.navLink}>
                            <MainNavLink to="/contact" onClick={toggleMenu}>Over ons</MainNavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            
            {/* Mobile menu overlay */}
            <div 
                className={`${styles.menuOverlay} ${isMenuOpen ? styles.open : ''}`} 
                onClick={toggleMenu}
            ></div>
        </div>
    );
}

export default NavBar;