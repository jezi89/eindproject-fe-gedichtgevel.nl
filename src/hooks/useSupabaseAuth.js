/**
 * useSupabaseAuth Hook
 *
 * A custom React hook that provides a complete authentication solution
 * combining Supabase auth operations with form handling capabilities.
 *
 * Architecture Overview:
 * - This hook serves as the primary interface for authentication in React components
 * - It uses the authService for actual Supabase operations (separation of concerns)
 * - It integrates useAuthForm for form state management
 * - The AuthProvider will use this hook internally for context state management
 *
 * Benefits:
 * - Can be used directly in components for auth operations
 * - Combines auth logic with form handling
 * - Provides loading states and error handling
 * - Fully typed and testable
 *
 * @example
 * // In a component
 * const { loginForm, signupForm, user, logout } = useSupabaseAuth();
 *
 * // In AuthProvider
 * const auth = useSupabaseAuth();
 * return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
 */

import {useCallback, useEffect, useState} from "react";
import useAuthForm from "@/hooks/useAuthForm.js";

export function useSupabaseAuth() {
// Auth state
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

// Form hooks for different auth operations
    const loginForm = useAuthForm({email: '', password: ''});
    const signupForm = useAuthForm({email: '', password: '', confirmPassword: ''});
    const resetPasswordForm = useAuthForm({email: ''});
    const updatePasswordForm = useAuthForm({password: '', confirmPassword: ''});

// Initialize auth state and subscriptions
    useEffect(() => {
        let unsubscribe;

        const initAuth = async () => {
            try {
                setLoading(true);
                const {session: currentSession, error} = await authService.getSession();

                if (error) throw new Error(error);

                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Initialize auth state and subscribe to auth changes

        initAuth();

        unsubscribe = authService.subscribeToAuthChanges((newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
        });

        // Cleanup subscription on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Login handler
    // TODO captchaToken als AdditionalData?? of direct een captcha token implementeren
    const login = useCallback(async (email, password) => {
        try {
            setError(null);
            const {success, data, error} = await authService.login(email, password);
            if (!result.success) {
                throw new Error(error);
            }

            // User state will be updated by the auth change listener
            lginForm.resetForm();
            return result;
        } catch (error) {
            setError(error.message);
            // TODO error functie user state checken
            loginForm.setErrors({form: error.message});
            throw error;
        }
    }, [loginForm]);

    // Signup handler
    // TODO captchaToken
    const signup = useCallback(async (email, password, profileData = {}) => {
        try {
            setError(null);
            const result = await authService.register(email, password, profileData);
            if (!result.success) {

                // Check for specific error messages
                if (result.error?.includes('User already registered')) {
                    throw new Error('Dit e-mailadres is al in gebruik. Probeer in te loggen of gebruik wachtwoord vergeten.');
                }
                throw new Error(result.Error);
            }


            // TODO verwijder console.log hier
            // Check if email confirmation is required
            /*        if (result.data?.user && !result.data.user.confirmed_at) {
                        // Handle unconfirmed user state
                        console.log('User needs to confirm email:', result.data.user.email);
                    }*/

            signupForm.resetForm();
            return result;
        } catch (error) {
            console.error('Signup error:', error);
            setError(error.message);
            signupForm.setErrors({form: error.message});
            throw error;
        }
    }, [signupForm]);

    // Logout handler
    const logout = useCallback(async () => {
        try {
            setError(null);
            const result = await authService.logout();
            if (!result.success) {
                throw new Error(result.error);
            }

            // Clear all form states
            loginForm.resetForm();
            signupForm.resetForm();
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, [loginForm, signupForm]);

    // Password reset handler
    const sendPasswordReset = useCallback(async (email) => {
        try {
            setError(null);
            const result = await authService.sendPasswordResetEmail(email);

            if (!result.success) {
                throw new Error(result.error);
            }

            resetPasswordForm.resetForm();
            return result;
        } catch (err) {
            setError(err.message);
            resetPasswordForm.setErrors({form: err.message});
            throw err;
        }
    }, [resetPasswordForm]);

    // Update password handler
    const updatePassword = useCallback(async (newPassword) => {
        try {
            setError(null);
            const result = await authService.updatePassword(newPassword);

            if (!result.success) {
                throw new Error(result.error);
            }

            updatePasswordForm.resetForm();
            return result;
        } catch (err) {
            setError(err.message);
            updatePasswordForm.setErrors({form: err.message});
            throw err;
        }
    }, [updatePasswordForm]);

    // Profile management
    // TODO Checken wat dit doet
    const getUserProfile = useCallback(async (userId) => {
        return await authService.getUserProfile(userId || user?.id);
    }, [user]);

    const updateUserProfile = useCallback(async (updates) => {
        if (!user) {
            const error = 'No user logged in';
            setError(error);
            return {success: false, error};
        }

        return await authService.updateUserProfile(user.id, updates);
    }, [user]);

    // Token refresh
    const refreshToken = useCallback(async () => {
        const result = await authService.refreshToken();

        if (result.success && result.session) {
            setSession(result.session);
            setUser(result.session.user);
        }

        return result;
    }, []);

    // TODO Checken wat dit doet
    // Create form actions for use with form action attribute
    const createLoginAction = useCallback(() => {
        return loginForm.createFormAction(async (formData) => {
            const email = formData.get ? formData.get('email') : formData.email;
            const password = formData.get ? formData.get('password') : formData.password;
            return await login(email, password);
        });
    }, [loginForm, login]);

    const createSignupAction = useCallback(() => {
        return signupForm.createFormAction(async (formData) => {
            const email = formData.get ? formData.get('email') : formData.email;
            const password = formData.get ? formData.get('password') : formData.password;
            return await signup(email, password);
        });
    }, [signupForm, signup]);

    return {
        // Auth state
        user,
        session,
        loading,
        error,

        // Auth methods
        login,
        signup,
        logout,
        sendPasswordReset,
        updatePassword,

        // Profile methods
        getUserProfile,
        updateUserProfile,

        // Token methods
        refreshToken,

        // Form states
        loginForm,
        signupForm,
        resetPasswordForm,
        updatePasswordForm,

        // Form actions for progressive enhancement
        createLoginAction,
        createSignupAction,

        // Utility methods
        clearError: () => setError(null),
        checkUserExists: authService.checkUserExists,
    };
}

/**
 * Implementation Notes:
 *
 * 1. AuthService Role:
 *    - Remains as a pure JavaScript module for Supabase operations
 *    - Can be used outside of React (e.g., in API routes, server-side code)
 *    - Handles all direct Supabase communication
 *    - Provides consistent error handling
 *
 * 2. useSupabaseAuth Hook Role:
 *    - React-specific implementation
 *    - Manages auth state with useState
 *    - Integrates form handling via useAuthForm
 *    - Provides ready-to-use form states and actions
 *
 * 3. AuthProvider Role:
 *    - Simply uses useSupabaseAuth internally
 *    - Provides auth context to entire app
 *    - Much simpler implementation
 *
 * 4. Usage in Components:
 *    - Can use useAuth (context) for app-wide auth state
 *    - Can use useSupabaseAuth directly for isolated auth features
 *    - Form components get both auth logic and form state management
 *
 * This architecture provides:
 * - Clear separation of concerns
 * - Reusability at different levels
 * - Easy testing (mock authService for hook tests)
 * - Progressive enhancement support via form actions
 */


