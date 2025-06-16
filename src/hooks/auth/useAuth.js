/**
 * useAuth Hook
 *
 * Provides access to authentication state and methods from the AuthContext.
 * This hook separates the logic of authentication from the UI components,
 * making it easier to use auth functionality throughout the application.
 *
 * Uses JavaScript object definitions pattern for better organization and clarity.
 *
 * @returns {Object} Authentication state and methods
 * @returns {Object|null} .user - The current authenticated user or null
 * @returns {boolean} .loading - Whether auth is in a loading state
 * @returns {string|null} .error - Authentication error message or null
 * @returns {Function} .signUp - Function to register a new user
 * @returns {Function} .signIn - Function to log in an existing user
 * @returns {Function} .signOut - Function to log out the current user
 * @returns {Function} .checkAuth - Function to check authentication status
 * @returns {Function} .signUpWithCheck - Enhanced signup with email existence check
 * @returns {Function} .requestPasswordResetEmail - Request password reset email
 * @returns {Function} .updateUserPasswordAfterReset - Update password after reset
 * @returns {Function} .checkEmailExists - Check if email already exists
 * @returns {boolean} .resetEmailSent - Whether reset email was sent successfully
 * @returns {string|null} .resetError - Password reset error message
 */

import {useAuthContext} from '../../context/auth/AuthContext.jsx';
import {useCallback, useState} from 'react';

export function useAuth() {
    // Get authentication context
    const context = useAuthContext();

    // Local state for password reset functionality
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetError, setResetError] = useState(null);

    /**
     * Enhanced signup with user existence check
     * Handles duplicate emails gracefully with clear user messaging
     *
     * @param {string} email - User email address
     * @param {string} password - User password
     * @returns {Promise<Object>} Result object with success status and data/error
     */
    const signUpWithCheck = useCallback(async (email, password) => {
        if (!context || !context.signUp) {
            console.error("AuthContext not available or signUp method missing");
            return {
                success: false,
                error: "Authentication service not available."
            };
        }

        try {
            const result = await context.signUp(email, password);

            if (result.error || !result.success) {
                const errorMessage = result.error?.message || result.error || 'Registratie mislukt.';
                const isDuplicateUser =
                    result.error?.code === 'user_already_exists' ||
                    errorMessage.toLowerCase().includes('user already registered') ||
                    errorMessage.toLowerCase().includes('already registered');

                if (isDuplicateUser) {
                    return {
                        success: false,
                        error: 'Een account met dit emailadres bestaat al. Probeer in te loggen.',
                        code: 'AUTH_USER_EXISTS'
                    };
                }

                return {
                    success: false,
                    error: errorMessage,
                    code: result.error?.code
                };
            }

            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            console.error('Signup error in useAuth:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }, [context]);

    /**
     * Request password reset email
     * Sends a password reset link to the user's email
     *
     * @param {string} email - Email address to send reset link to
     * @returns {Promise<Object>} Result object with success status
     */
    const requestPasswordResetEmail = useCallback(async (email) => {
        if (!context || !context.sendPasswordResetEmail) {
            console.error("AuthContext not available or sendPasswordResetEmail method missing");
            return {
                success: false,
                error: "Password reset service not available."
            };
        }

        setResetError(null);
        setResetEmailSent(false);

        try {
            const result = await context.sendPasswordResetEmail(email);

            if (result.success) {
                setResetEmailSent(true);
                return {success: true};
            } else {
                setResetError(result.error);
                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            setResetError(error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }, [context]);

    /**
     * Update user password after reset
     * Used when user clicks the reset link and sets a new password
     *
     * @param {string} newPassword - The new password to set
     * @returns {Promise<Object>} Result object with success status
     */
    const updateUserPasswordAfterReset = useCallback(async (newPassword) => {
        if (!context || !context.updateUserPassword) {
            console.error("AuthContext not available or updateUserPassword method missing");
            return {
                success: false,
                error: "Password update service not available."
            };
        }

        try {
            return await context.updateUserPassword(newPassword);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }, [context]);

    /**
     * Check if email already exists in the system
     * Useful for form validation before submission
     *
     * @param {string} email - Email address to check
     * @returns {Promise<Object>} Object with exists boolean and optional error
     */
    const checkEmailExists = useCallback(async (email) => {
        if (!context || !context.checkUserExists) {
            console.error("AuthContext not available or checkUserExists method missing");
            return {
                exists: false,
                error: "User check service not available."
            };
        }
        return await context.checkUserExists(email);
    }, [context]);

    return {
        ...context,
        signUpWithCheck,
        requestPasswordResetEmail,
        updateUserPasswordAfterReset,
        checkEmailExists,
        resetEmailSent,
        resetError,
        clearResetState: useCallback(() => {
            setResetEmailSent(false);
            setResetError(null);
        }, [])
    };
}
