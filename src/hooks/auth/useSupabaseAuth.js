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
import {useAuthForm} from "@/hooks/auth/useAuthForm.js";
import {getSession, onAuthStateChange, refreshSession, register, resetPasswordForEmail, signInWithPassword, signInWithProvider, logout as authSignOut, updateUser, checkUserExists, getCurrentUser} from "@/services/auth/authService.js";

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
                const {session: currentSession, error: sessionError} = await getSession();

                if (sessionError) throw new Error(sessionError);

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

        // Subscribe to auth state changes
        unsubscribe = onAuthStateChange((newSession) => {
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
    const signIn = useCallback(async (email, password) => { // Renamed login to signIn
        try {
            setError(null);
            const result = await signInWithPassword(email, password); // Use signInWithPassword
            if (!result.success) {
                throw new Error(result.error);
            }

            // User state will be updated by the auth change listener
            loginForm.resetForm();
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
    const signUp = useCallback(async (email, password, profileData = {}) => {
        try {
            setError(null);
            const result = await register(email, password, profileData);
            if (!result.success) {

                // Check for specific error messages
                if (result.error?.includes('User already registered')) {
                    throw new Error('Dit e-mailadres is al in gebruik. Probeer in te loggen of gebruik wachtwoord vergeten.');
                }
                throw new Error(result.error);
            }


            // TODO verwijder console.log hier
            // Check if email confirmation is required
            if (result.data?.user && !result.data.user.confirmed_at) {
                // Handle unconfirmed user state
                console.log('User needs to confirm email:', result.data.user.email);
            }

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
    const signOut = useCallback(async () => {
        try {
            setError(null);
            const result = await authSignOut();
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

    // Google Sign-In handler
    const signInWithGoogle = useCallback(async () => {
        try {
            setError(null);
            const result = await signInWithProvider('google');
            if (!result.success) {
                throw new Error(result.error);
            }
            // User state will be updated by the auth change listener
            return result;
        } catch (error) {
            setError(error.message);
            // Optionally set a form error if you have a specific place to display this
            // loginForm.setErrors({ form: error.message });
            throw error;
        }
    }, []);

    // Password reset handler
    const sendPasswordResetEmail = useCallback(async (email) => {
        try {
            setError(null);
            const result = await resetPasswordForEmail(email);

            if (!result.success) {
                throw new Error(result.error);
            }

            resetPasswordForm.resetForm();
            return result;
        } catch (error) {
            setError(error.message);
            resetPasswordForm.setErrors({form: error.message});
            throw error;
        }
    }, [resetPasswordForm]);

    // Update password handler
    const updateUserPassword = useCallback(async (newPassword) => {
        try {
            setError(null);
            // TODO Checken of comment waar is
            // Instead of using updatePassword, we use updateUser, because this gives us more flexibility to update other user fields if needed
            const result = await updateUser({password: newPassword});

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
        return await getUserProfile(userId || user?.id);
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
    const refreshUserSession = useCallback(async () => {
        const result = await refreshSession();

        if (result.success && result.session) {
            setSession(result.session);
            setUser(result.session.user);
        }

        return result;
    }, []);

    // TODO Checken wat dit doet
    // Create form actions for use with form action attribute
    const createSignInAction = useCallback(() => {
        return loginForm.createFormAction(async (formData) => {
            const email = formData.get ? formData.get('email') : formData.email;
            const password = formData.get ? formData.get('password') : formData.password;
            return await signIn(email, password);
        });
    }, [loginForm, signIn]);

    const createSignUpAction = useCallback(() => {
        return signupForm.createFormAction(async (formData) => {
            const email = formData.get ? formData.get('email') : formData.email;
            const password = formData.get ? formData.get('password') : formData.password;
            return await signUp(email, password);
        });
    }, [signupForm, signUp]);

    return {
        // Auth state
        user,
        session,
        loading,
        error,

        // Auth methods
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        sendPasswordResetEmail,
        updateUserPassword,

        // Profile methods
        getUserProfile,
        updateUserProfile,

        // Token methods
        refreshUserSession, // Renamed from refreshToken

        // Form states
        loginForm,
        signupForm,
        resetPasswordForm,
        updatePasswordForm,

        // Form actions for progressive enhancement
        createSignInAction,
        createSignUpAction,

        // Utility methods
        clearError: () => setError(null),
        checkUserExists,
        getCurrentUser
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
