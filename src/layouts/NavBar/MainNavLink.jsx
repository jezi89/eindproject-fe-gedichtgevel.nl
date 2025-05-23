/**
 * MainNavLink Component
 * 
 * Specialized NavLink component for main navigation
 * with active state styling.
 * 
 * @module layouts/NavBar/MainNavLink
 */

import {NavLink} from 'react-router-dom';
import styles from "./NavBar.module.css"

/**
 * MainNavLink component for route navigation with active state
 * 
 * @component
 * @param {Object} props
 * @param {string} props.to - Target route path
 * @param {React.ReactNode} props.children - Link content
 * @returns {JSX.Element} Styled navigation link
 */
const MainNavLink = ({to, children}) => {
    // Return NavLink with active/inactive styling based on current route
};

export default MainNavLink;