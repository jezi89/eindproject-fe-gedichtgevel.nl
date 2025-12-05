/**
 * Protected Route component for securing authenticated routes
 *
 * @module components/ProtectedRoute
 */

import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/auth/useAuth.js";

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

export function ProtectedRoute({ children, redirectTo = "/login" }) {
  // Get authentication state using the refactored useAuth hook
  const authState = useAuth();
  const { user, loading } = authState;

  // Get current location for redirect after login
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div>Authenticatie controleren...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Using React Router 7's Navigate component with state for return URL
  if (!user) {
    return (
      <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
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

// TODO Process explanation in accountability document or simplify

/**
 * The Navigate component from React Router 6/7 and your custom hook (useNavigationState) have different goals, but work together to provide a good user experience for protected routes.
 *
 * Navigate component (React Router 6/7)
 * Goal: Declaratively navigate (redirect) to another route.
 * Usage: You use <Navigate to="/login" state={{ from: location.pathname }} /> to redirect a user and optionally pass extra state (like the original URL).
 * Benefit: You can easily perform a redirect and send extra information (like where the user came from) via the state prop.
 *
 * useNavigationState custom hook
 * Goal: Easily retrieve data from the navigation state that you sent with Navigate.
 * Usage: In your login form you can use useNavigationState('from', '/') to retrieve where the user came from, so you can send them back after logging in.
 * Benefit: You don't have to manually write location.state?.from every time; the hook makes this reusable and readable.
 *
 * How do they work together?
 * Redirect with state:
 * In ProtectedRoute you send the user to /login and pass the original location:
 * <Navigate ... />
 *
 * Retrieving state:
 * In your login form you use the custom hook to retrieve the original location:
 * const redirectTo = useNavigationState('from', '/');
 * After successful login you can then navigate back to the original page.
 *
 * Summary
 * Navigate sends the user (with extra state) to another route.
 * useNavigationState retrieves that extra state in the new route.
 * They complement each other: declarative navigation AND easy state retrieval.
 *
 * In short:
 * Navigate is for navigating and passing state, your custom hook is for reading that state. They are complementary.
 */
