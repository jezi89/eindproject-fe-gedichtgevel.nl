/**
 * Custom hook for authentication functionality
 *
 * @module hooks/useAuth
 */

import {setup} from "@storybook/experimental-addon-test/internal/global-setup";
import {useCallback, useState} from "react";
import {useAuthContext} from "@/context/auth/AuthContext.jsx";

/**
 * useAuth Hook
 *
 * Provides access to authentication state and methods from the AuthContext.
 * This hook separates the logic of authentication from the UI components,
 * making it easier to use auth functionality throughout the application.
 *
 * @returns {Object} Authentication state and methods
 * @returns {Object|null} .user - The current authenticated user or null
 * @returns {boolean} .loading - Whether auth is in a loading state
 * @returns {string|null} .error - Authentication error message or null
 * @returns {Function} .signUp - Function to register a new user
 * @returns {Function} .signIn - Function to log in an existing user
 * @returns {Function} .signOut - Function to log out the current user
 * @returns {Function} .checkAuth - Function to check authentication status
 */
export function useAuth() {
    const context = useAuthContext();
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetError, setResetError] = useState(null);

    // Enhanced signUp following the learned FE authentication pattern
    // Let Supabase handle automatic identity linking and profile creation via database triggers
    const signUpWithCheck = useCallback(async (email, password, additionalData = {}) => {
        try {
            // Proceed with signup - Supabase will handle duplicate emails via automatic linking
            const result = await context.signUp(email, password);

            if (result.error) {
                // Handle specific Supabase errors for better UX
                if (result.error.includes('je bent al gregistreerd')) {
                    return {success: false, error: 'Een account met dit e-mailadres bestaat al. Probeer in te loggen. We sturen je door naar de login pagina'};
                }
                return {success: false, error: result.error};
            }
            return {success: true, user: result.user};
        } catch (error) {
            console.error('Signup fout:', error);
            return {success: false, error: error.message};

        }
    }, [context]);

    // Password reset functionality
    const requestPasswordReset = useCallback(async (email) => {
        setResetError(null);
        setResetEmailSent(false);
        try {
            const result = await context.resetPassword(email);

            if (result.success) {
                setResetEmailSent(true);
                return {success: true};
            } else {
                setResetError(result.error);
                return {success: false, error: result.error};
            }
        } catch (error) {
            setResetError(error.message);
            return {success: false, error: error.message};

        }
    }, []);

    // Update password after reset
    const resetPassword = useCallback(async (newPassword) => {
        try {
            const result = await context.updatePassword(newPassword);
            return result;
        } catch (error) {
            return {success: false, error: error.message};
        }
    }, []);

    // Check if email exists (useful for form validation)
    const checkEmailExists = useCallback(async (email) => {
        return await context.checkUserExists(email);
    }, []);

    return {
        ...context,
        signUpWithCheck,
        requestPasswordReset,
        resetPassword,
        checkEmailExists,
        resetEmailSent,
        resetError
    };
}