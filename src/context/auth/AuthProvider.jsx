import supabaseClient from "@/services/supabase/supabaseClient.js";
import AuthContext from './AuthContext';
import {useEffect, useState} from "react";


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
 *  @module context/auth/AuthProvider
 */

/**
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The AuthProvider component
 */



export function AuthProvider({children}) {
    const auth = useSupabaseAuth();

    // Create a context value that maintains backward compatibility
    // while using the new auth hook internally
    const value = {

        //State
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        isAuthenticated: auth.isAuthenticated,

        // Auth methods (maintain original naming for backward compatibility)
        signUp: auth.signup,
        signIn: auth.login,
        signOut: auth.logout,
        checkAuth: async () => {
            const {user, error} = await auth.getCurrentUser?.() || {};
            return {
                isAuthenticated: !!user,
                user,
                error
            };
        },

        // Password methods
        resetPassword: auth.sendPasswordReset,
        updatePassword: auth.updatePassword,

        // Profile methods
        getUserProfile: auth.getUserProfile,
        updateUserProfile: auth.updateUserProfile,

        // Token methods
        refreshToken: auth.refreshToken,

        // Utility methods
        clearError: auth.clearError,

        // Form states (additions for form integration)
        loginForm: auth.loginForm,
        signupForm: auth.signupForm,
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

