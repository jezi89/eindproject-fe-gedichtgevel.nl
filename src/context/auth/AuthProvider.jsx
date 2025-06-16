/**
 * AuthProvider Component
 *
 * Provides authentication context to the entire application.
 * This is now a thin wrapper around the useSupabaseAuth hook.
 *
 * Architecture Benefits:
 * - All auth logic is centralized in useSupabaseAuth hook
 * - AuthProvider simply provides context distribution
 * - Components can either use useAuth (context) or useSupabaseAuth directly
 * - Maintains backward compatibility with existing code using signIn/signUp
 *
 * The provider maintains the original API (signIn, signUp, signOut) for
 * backward compatibility while internally using the new hook methods.
 *
 * Conclusie:
 * De refactor klopt als de context en alle consumers (zoals useAuth) alleen de canonical methoden gebruiken.
 * Dit houdt de architectuur schoon en consistent met Supabase conventies.
 * WWe hoeven dus alleen te zorgen dat de context en alle hooks/forms de juiste methoden aanroepen.
 *
 *  @module context/auth/AuthProvider
 */

import AuthContext from './AuthContext';
import {useSupabaseAuth} from '../../hooks/auth/useSupabaseAuth.js';

/**
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The AuthProvider component
 */

export function AuthProvider({children}) {
    const auth = useSupabaseAuth();

    // Creating a context value that maintains backward compatibility
    // while using the new auth hook internally
    const value = {

        //State
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        isAuthenticated: !!auth.user, // Calculate isAuthenticated based on user, because auth.user is null when not authenticated

        // Auth methods (maintain original naming for backward compatibility)
        signUp: auth.signUp,
        signIn: auth.signIn,
        signOut: auth.signOut,
        checkAuth: async () => {
            // Using getCurrentUser from useSupabaseAuth which in turn uses authService.getUser
            const {user: currentUser, error: currentError} = await auth.getCurrentUser?.() || {};
            return {
                isAuthenticated: !!currentUser,
                user: currentUser,
                error: currentError
            };
        },

        // Password methods
        sendPasswordResetEmail: auth.sendPasswordResetEmail,
        updateUserPassword: auth.updateUserPassword,

        // Profile methods
        getUserProfile: auth.getUserProfile,
        updateUserProfile: auth.updateUserProfile,

        // Token methods
        refreshUserSession: auth.refreshUserSession,

        // Utility methods
        clearError: auth.clearError,
        checkUserExists: auth.checkUserExists,

        // Form states (additions for form integration)
        loginForm: auth.loginForm,
        signupForm: auth.signupForm, // Corrected: was SignupForm, now signupForm
        resetPasswordForm: auth.resetPasswordForm,
        updatePasswordForm: auth.updatePasswordForm,

        // Form actions for progressive enhancement
        createLoginAction: auth.createLoginAction,
        createSignupAction: auth.createSignupAction,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

