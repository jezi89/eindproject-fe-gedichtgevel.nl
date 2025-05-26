/**
 * LoginForm Component
 *
 * Handles user authentication through a login form with
 * validation, error handling, and form submission.
 *
 * @module components/forms/LoginForm
 */

import {useState} from "react";
// import {useNavigate} from 'react-router-dom';
// import {useAuth} from '@/hooks/useAuth.js';
// import useAuthForm from '@/hooks/useAuthForm.js';
// import {SubmitButton} from '@/components/ui/button/ActionButton.jsx';
// import FormField from '@/components/forms/FormField.jsx';
// import styles from './LoginAndSignupForms.module.css';
// import {post} from "axios";

/**
 * LoginForm component for user authentication
 *
 * @component
 * @returns {JSX.Element} Login form component
 */
function LoginForm() {
    // States
    // - loginAttempted: Tracks if login has been attempted

    // Navigation
    // - Use React Router's useNavigate for redirection after login

    // Form Management
    // - Use useAuthForm for form state management
    // - Handle email and password validation
    // - Track submission state

    // Authentication
    // - Use signIn from AuthContext

    /**
     * Validates form inputs
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {boolean} Whether the form is valid
     */
    function validateForm(formData) {
        // Validate email (required)
        // Validate password (required)
        // Set validation errors
        // Return validation result
    }

    /**
     * Handles form submission
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {Promise<Object|void>} Login result or undefined on error
     */
    const handleFormSubmit = createFormAction(async (formData) => {
        // Validate form
        // Set login attempted state
        // Handle captcha token for production/development environments
        // Submit login credentials
        // Handle success (redirect to home page)
        // Handle errors (display user-friendly messages)
    });

    return (
        // Form container
        <div className={styles.formContainer}>
            {/*Method post is purely semantic here, as we are using a custom action handler, though it could be useful as a fallback if the action handler fails.*/}

            {/*Form with email and password fields*/}
            <form action={handleFormSubmit} className={styles.form} method={post}>
                <h2>Inloggen</h2>

                {/*Error message display*/}
                {errors.form && (
                    <div className={styles.errorMessage}>{errors.form}</div>
                )}

                {/*Login button with loading state*/}
                {loginAttempted && !errors.form && (
                    <div className={styles.infoMessage}>
                        De dichtersgilde haalt haar deuren van het slot... wachtwoord waar?! Dan zijn we vast al klaar!
                    </div>
                )}
                <FormField
                    is="login-email"
                    label="E-mailadres"
                    name="email"
                    type="email"
                    placeholder="Voer je e-mailadres in"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />

                <FormField
                    id="login-password"
                    label="Wachtwoord"
                    name="password"
                    type="password"
                    placeholder="Voer je wachtwoord in"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                />

                <SubmitButton
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !validateForm(values)}
                >
                </SubmitButton>
            </form>

            {/*Footer with registration link*/}
            <div className={styles.formFooter}>
                <p>
                    Nog geen account? <a href="/signup">Registreer hier</a>
                </p>
            </div>
        </div>
    );

}

export default LoginForm;