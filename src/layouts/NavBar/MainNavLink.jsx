/**
 * MainNavLink Component
 *
 * Specialized NavLink component for main navigation
 * with active state styling.
 *
 * @module layouts/NavBar/MainNavLink
 */

import {NavLink} from 'react-router';
import styles from "./NavBar.module.scss"

/**
 * MainNavLink component for route navigation with active state
 * Uses React 19 features and React Router v7
 *
 * @component
 * @param {Object} props
 * @param {string} props.to - Target route path
 * @param {React.ReactNode} props.children - Link content
 * @param {Function} [props.onClick] - Optional click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.prefetch] - Enable prefetching (React Router v7)
 * @param {Object} [props...rest] - Additional props to pass to NavLink
 * @returns {JSX.Element} Styled navigation link
 */
const MainNavLink = ({to, children, onClick, className = '', prefetch = 'intent', ...rest}) => {
    // Return NavLink with active/inactive styling based on current route
    // Uses React Router v7 features like prefetch
    return (

        <NavLink
            to={to}
            prefetch={prefetch}
            className={({isActive}) => {
                const baseClass = className || '';
                return isActive ? `${baseClass} ${styles.active}`.trim() : baseClass;
            }}
            onClick={onClick}
            {...rest}
        >
            {children}
        </NavLink>

    );
};

export default MainNavLink;