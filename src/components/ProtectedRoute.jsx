/**
 * Protected Route component for securing authenticated routes
 *
 * @module components/ProtectedRoute
 */

import React from 'react';
import {Navigate, useLocation} from 'react-router';
import {useAuth} from '@/hooks/auth/useAuth.js';

//
/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * they will be redirected to the login page with a redirect URL to return
 * after successful login.
 *
 * Uses React Router 7's Navigate component for declarative navigation.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if authenticated
 * @param {string} [props.redirectTo="/login"] - Where to redirect unauthenticated users
 * @returns {JSX.Element} The protected route component
 */

export function ProtectedRoute({children, redirectTo = '/login'}) {
    // Get authentication state using the refactored useAuth hook
    const authState = useAuth();
    const {user, loading} = authState;

    // Get current location for redirect after login
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div>Authenticatie controleren...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    // Using React Router 7's Navigate component with state for return URL
    if (!user) {
        return (
            <Navigate
                to={redirectTo}
                replace
                state={{from: location.pathname}}
            />
        );
    }

    // User is authenticated, render protected content
    return children;
}


/**
 * Implementation Notes:
 *
 * 1. Authentication Check:
 *    - Uses the refactored useAuth hook with JavaScript object definitions
 *    - Accesses user and loading state from auth context
 *
 * 2. React Router 7 Features:
 *    - Navigate component for declarative redirects
 *    - useLocation hook to capture current path
 *    - State prop to pass return URL for post-login redirect
 *
 * 3. User Experience:
 *    - Shows loading state during auth verification
 *    - Preserves intended destination in navigation state
 *    - Seamless redirect after successful login
 *
 * 4. Usage Example:
 *    <ProtectedRoute>
 *      <AccountPage />
 *    </ProtectedRoute>
 */

// TODO uitleg in verantwoordingsdocument verwerken of versimpelen

/**
 * De Navigate component van React Router 6/7 en je custom hook (useNavigationState) hebben verschillende doelen, maar werken samen om een goede gebruikerservaring te bieden bij protected routes.
 *
 * Navigate component (React Router 6/7)
 * Doel: Declaratief navigeren (redirecten) naar een andere route.
 * Gebruik: Je gebruikt <Navigate to="/login" state={{ from: location.pathname }} /> om een gebruiker te redirecten en optioneel extra state (zoals de oorspronkelijke URL) mee te geven.
 * Voordeel: Je kunt eenvoudig een redirect uitvoeren en extra informatie (zoals waar de gebruiker vandaan kwam) meesturen via de state prop.
 * useNavigationState custom hook
 * Doel: Gemakkelijk data ophalen uit de navigation state die je met Navigate hebt meegestuurd.
 * Gebruik: In je login-form kun je met useNavigationState('from', '/') ophalen waar de gebruiker vandaan kwam, zodat je na inloggen weer terug kunt sturen.
 * Voordeel: Je hoeft niet telkens handmatig location.state?.from te schrijven; de hook maakt dit herbruikbaar en leesbaar.
 * Hoe werken ze samen?
 * Redirect met state:
 * In ProtectedRoute stuur je de gebruiker naar /login en geef je de oorspronkelijke locatie mee:
 * <Navigate
 * Ophalen van state:
 * In je login-form gebruik je de custom hook om de oorspronkelijke locatie op te halen:
 * const redirectTo = useNavigationState('from', '/');
 * Na succesvol inloggen kun je dan weer terugnavigeren naar de oorspronkelijke pagina.
 * Samenvatting
 * Navigate stuurt de gebruiker (met extra state) naar een andere route.
 * useNavigationState haalt die extra state weer op in de nieuwe route.
 * Ze vullen elkaar aan: declaratief navigeren én makkelijk state ophalen.
 * Kortom:
 * Navigate is voor het navigeren en state doorgeven, je custom hook is voor het uitlezen van die state. Ze zijn complementair.
 */