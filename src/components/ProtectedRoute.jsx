/**
 * Protected Route component for securing authenticated routes
 *
 * @module components/ProtectedRoute
 */

import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth.js';

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * they will be redirected to the login page with a redirect URL to return
 * after successful login.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components to render if authenticated
 * @param {string} [props.redirectTo="/login"] - Where to redirect unauthenticated users
 * @returns {JSX.Element} The protected route
 */
function ProtectedRoute({children, redirectTo = '/login'}) {
    // Implementation
    // - Get auth state from useAuth hook
    // - Get current location for redirect URL

    // Show loading state while checking authentication
    // - Display loading indicator when auth state is loading

    // If not authenticated, redirect to login with return URL
    // - Use Navigate component to redirect
    // - Include current path as redirect parameter

    // User is authenticated, render children
    // - Return children directly when user is authenticated
}

export default ProtectedRoute;