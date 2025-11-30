/**
 * Custom hook for Supabase authentication with form handling
 */

import {useCallback, useEffect, useState} from "react";
import {useAuthForm} from "@/hooks/auth/useAuthForm.js";
import {getSession, onAuthStateChange, refreshSession, register, resetPasswordForEmail, signInWithPassword, signInWithProvider, logout as authSignOut, updateUser, checkUserExists, getCurrentUser} from "@/services/auth/authService.js";

export function useSupabaseAuth() {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loginForm = useAuthForm({email: '', password: ''});
    const signupForm = useAuthForm({email: '', password: '', confirmPassword: ''});
    const resetPasswordForm = useAuthForm({email: ''});
    const updatePasswordForm = useAuthForm({password: '', confirmPassword: ''});
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

        initAuth();

        unsubscribe = onAuthStateChange((newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const signIn = useCallback(async (email, password) => {
        try {
            setError(null);
            const result = await signInWithPassword(email, password);
            if (!result.success) {
                throw new Error(result.error);
            }

            loginForm.resetForm();
            return result;
        } catch (error) {
            setError(error.message);
            loginForm.setErrors({form: error.message});
            throw error;
        }
    }, [loginForm]);

    const signUp = useCallback(async (email, password, profileData = {}) => {
        try {
            setError(null);
            const result = await register(email, password, profileData);
            if (!result.success) {
                if (result.error?.includes('User already registered')) {
                    throw new Error('Dit e-mailadres is al in gebruik. Probeer in te loggen of gebruik wachtwoord vergeten.');
                }
                throw new Error(result.error);
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

    const signOut = useCallback(async () => {
        setError(null);
        const result = await authSignOut();

        if (!result.success) {
            const isSessionMissingError =
                result.error?.name === 'AuthSessionMissingError' ||
                result.error?.message?.includes('Auth session missing');

            if (isSessionMissingError) {
                setUser(null);
                setSession(null);
            } else {
                setError(result.error?.message || 'An unknown error occurred during sign out.');
            }
        }

        loginForm.resetForm();
        signupForm.resetForm();

    }, [loginForm, signupForm]);

    const signInWithGoogle = useCallback(async () => {
        try {
            setError(null);
            const result = await signInWithProvider('google');
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }, []);

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

    const updateUserPassword = useCallback(async (newPassword) => {
        try {
            setError(null);
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

    const refreshUserSession = useCallback(async () => {
        const result = await refreshSession();

        if (result.success && result.session) {
            setSession(result.session);
            setUser(result.session.user);
        }

        return result;
    }, []);

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
        user,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        sendPasswordResetEmail,
        updateUserPassword,
        getUserProfile,
        updateUserProfile,
        refreshUserSession,
        loginForm,
        signupForm,
        resetPasswordForm,
        updatePasswordForm,
        createSignInAction,
        createSignUpAction,
        clearError: () => setError(null),
        checkUserExists,
        getCurrentUser
    };
}
