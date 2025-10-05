/**
 * LoginForm Component
 *
 * Handles user authentication through a login form with
 * validation, error handling, and form submission.
 *
 * @module components/forms/LoginForm
 */

import {Link, useNavigate} from 'react-router';
import {useAuth} from '@/hooks/auth/useAuth.js';
import {useAuthForm} from '@/hooks/auth/useAuthForm.js';
import {SubmitButton} from '@/components/ui/button/ActionButton.jsx';
import {FormField} from '@/components/forms/FormField.jsx';
import {useNavigationState, usePrefilledEmail} from "@/hooks/useNavigationState.js";
import styles from './forms.module.scss';
import {useEffect, useRef, useState} from "react";

/**
 * LoginForm component for user authentication
 *
 * @component
 * @returns {JSX.Element} Login form component
 */

export function LoginForm() {
    // - loginAttempted: Tracks if login has been attempted
    // Navigation
    // - Use React Router's useNavigate for redirection after login

    const navigate = useNavigate();
    const passwordRef = useRef(null); // Reference to password input field
    const [loginAttempted, setLoginAttempted] = useState(false);

    // Get email from navigation state if redirected from Signup
    const emailFromSignup = usePrefilledEmail();
    const shouldFocusPassword = useNavigationState('focusPassword', false);

    // Form Management
    // - Use useAuthForm for form state management
    // - Handle email and password validation
    // - Track submission state
    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        setErrors,
        createFormAction
    } = useAuthForm({
        email: emailFromSignup || '',
        password: ''
    });

    // Focus password field if redirected from Signup
    useEffect(() => {
        if (shouldFocusPassword && passwordRef.current) {
            passwordRef.current.focus();
        }
    }, [shouldFocusPassword]);

    // Authentication
    // - Use signIn from AuthContext
    const {signIn, signInWithGoogle} = useAuth();

    const handleGoogleSignIn = async () => {
        await signInWithGoogle();
        // The onAuthStateChange listener will handle navigation or state updates
    };

    /**
     * Validates form inputs
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = (formData) => {
        // Validate form
        const newErrors = {};
        const email = formData?.get('email') || values.email;
        const password = formData?.get('password') || values.password;

        if (!email) newErrors.email = 'E-mailadres is verplicht';
        if (!password) newErrors.password = 'Wachtwoord is verplicht';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles form submission
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {Promise<Object|void>} Login result or undefined on error
     */
    const handleFormSubmit = createFormAction(async (formData) => {
        // Validate form
        if (!validateForm(formData)) return;
        // Set login attempted state
        setLoginAttempted(true);

        // Handle captcha token for production/development environments

        try {
            // Submit login credentials
            const email = formData?.get('email') || values.email;
            const password = formData?.get('password') || values.password;

            const result = await signIn(email, password);

            // Handle success (redirect to home page)
            if (result.success) {
                navigate('/');
            } else {
                // Handle errors (display user-friendly messages)
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    form: result.error || 'Onbekende fout bij inloggen'
                }));

            }
        } catch (error) {
            // Handle errors (display user-friendly messages)
            setErrors({
                form: typeof error === 'string' ? error :
                    error.message || 'Inloggen mislukt. Controleer je gegevens.'
            });
        }
    });
    return (
        // Form container
        <div className={styles.formContainer}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleFormSubmit(new FormData(e.currentTarget));
                }}
                className={styles.form}
                noValidate
            >
                <h2>Inloggen</h2>

                {errors.form && (
                    <div className={styles.formError} role="alert">{errors.form}</div>
                )}

                {loginAttempted && !errors.form && !isSubmitting && (
                    <div className={styles.formInfo}>
                        Een moment geduld...
                    </div>
                )}

                <FormField
                    id="login-email"
                    label="E-mail"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    autoComplete="username"
                />

                <FormField
                    id="login-password"
                    label="Wachtwoord"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                    ref={passwordRef}
                    autoComplete="current-password"
                />

                <div className={styles.formHelp}>
                    <Link
                        to="/password-reset"
                        state={{email: values.email}}
                        className={styles.formLink}
                    >
                        Wachtwoord vergeten?
                    </Link>
                </div>

                <SubmitButton type="submit" disabled={isSubmitting} loading={isSubmitting}>
                    {isSubmitting ? 'Bezig met inloggen...' : 'Inloggen'}
                </SubmitButton>

                <div className={styles.formDivider}>
                    <span>of</span>
                </div>

                <SubmitButton
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="secondary"
                    disabled={isSubmitting}
                >
                    Inloggen met Google
                </SubmitButton>
            </form>
        </div>
    );
}

