/**
 * SignupForm Component
 *
 * Handles user registration with form validation,
 * error handling, and success messaging.
 *
 * @module components/forms/SignupForm
 */

import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import useAuthForm from "@/hooks/useAuthForm.js";
import FormField from "@/components/forms/FormField.jsx";
import {SubmitButton} from "@/components/ui/button/ActionButton.jsx"; // Correct import
import {ActionButton} from "@/components/ui/button/ActionButton.jsx"; // For cancel button
import {useAuth} from "@/hooks/useAuth.js";
import styles from './forms.module.scss';

/**
 * SignupForm component for user registration
 *
 * @component
 * @returns {JSX.Element} Signup form component
 */

function SignupForm() {
    // - Use useAuthForm for form state management
    // - Handle email, password, and confirmPassword validation
    // - Track submission state

    // States
    // - registrationSuccess: Tracks if registration was successful
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');     // - registeredEmail: Stores the email address that was registered
    const [redirectCountdown, setRedirectCountdown] = useState(null);
    const navigate = useNavigate();
    const countdownRef = useRef(null);

    // Form Management
    // Use custom hook for form management
    const {
        values,
        errors,
        isSubmitting,
        handleChange,
        setErrors,
        resetForm,
        createFormAction
    } = useAuthForm({
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Authentication
    // - Use Signup from AuthContext
    // Get Signup function from AuthContext
    const {signUpWithCheck} = useAuth();

    // Start countdown and redirect
    const startRedirectCountdown = useCallback((email) => {
        let seconds = 5;
        setRedirectCountdown(seconds);

        countdownRef.current = setInterval(() => {
            seconds -= 1;
            setRedirectCountdown(prev => prev - 1); // More reliable state update
            if (seconds <= 0) { // Changed to <= 0
                clearInterval(countdownRef.current);
                navigate('/login', {
                    state: {
                        email: email,
                        focusPassword: true
                    }
                });
            }
        }, 1000);
    }, [navigate]);

    // Cancel redirect
    const cancelRedirect = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setRedirectCountdown(null);
        setErrors({});
    }, [setErrors]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, []);

    /**
     * Validates form inputs
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = (formData) => {
        // Validate email (required)
        // Validate password (required, min length)
        // Validate confirmPassword (required, match password)
        // Set validation errors
        // Return validation result
        const newErrors = {};
        const email = formData.get('email') || values.email;
        const password = formData.get('password') || values.password;
        const confirmPassword = formData.get('confirmPassword') || values.confirmPassword;

        if (!email) newErrors.email = 'E-mail is verplicht';
        if (!password) newErrors.password = 'Wachtwoord is verplicht';
        if (password.length < 6) newErrors.password = 'Wachtwoord moet minimaal 6 tekens lang zijn en zowel letters als cijfers bevatten';
        if (!confirmPassword) newErrors.confirmPassword = 'Bevestig je wachtwoord';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handles form submission
     *
     * @param {FormData} formData - Form data from form submission
     * @returns {Promise<Object|void>} Registration result or undefined on error
     */
    const handleFormSubmit = createFormAction(async (formData) => {
        // Validate form
        if (!validateForm(formData)) return;

        // Handle captcha token for production/development environments

        try {
            // Save email for success message
            const email = formData.get('email') || values.email;
            const password = formData.get('password') || values.password;

            // Submit registration credentials
            // TODO clog weghalen
            console.log("Registratie poging met:", {email});

            setRegisteredEmail(email);

            // Register user with email and password
            const result = await signUpWithCheck(email, password);

            if (result && !result.success) {
                // Handle errors (display user-friendly messages)
                if (result.code === 'AUTH_USER_EXISTS') {
                    const emailToRedirect = formData?.get('email') || values.email;
                    startRedirectCountdown(emailToRedirect);
                }
                return result;
            }

            // Handle success (show success message, reset form)
            setRegistrationSuccess(true);
            resetForm();
            return result;
        } catch (error) {
            // Handle errors (display user-friendly messages)
            console.error('Unexpected error during Signup:', error);
            return {success: false, error: error.message || 'Er is een onverwachte fout opgetreden.'};
        }
    });

    // Conditional rendering for success state
    if (registrationSuccess) {
        return (
            <div className={styles.formContainer}>
                <div className={styles.formSuccess}>
                    <h2>Registratie succesvol!</h2>
                    <p>Je bent geregistreerd met het e-mailadres: {registeredEmail}</p>
                    <p>Controleer je e-mail voor de bevestigingslink om je account te activeren.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            <form
                onSubmit={(e) => { // Changed to use onSubmit with explicit preventDefault
                    e.preventDefault();
                    handleFormSubmit(new FormData(e.currentTarget));
                }}
                className={styles.form}
                noValidate // Prevent browser validation, rely on custom
            >
                <h2>Registreren</h2>

                {errors.form && (
                    <div className={styles.formError}>
                        {errors.form}
                        {redirectCountdown && (
                            <>
                                <div className={styles.redirectMessage}>
                                    Je wordt
                                    over {redirectCountdown} seconde{redirectCountdown !== 1 ? 'n' : ''} doorgelinkt
                                    naar inloggen...
                                </div>
                                <ActionButton
                                    type="button"
                                    onClick={cancelRedirect}
                                    variant="tertiary" // Using new button system
                                    className={styles.cancelButton} // Keep if specific styling needed beyond variant
                                >
                                    Klik hier om opnieuw te proberen
                                </ActionButton>
                            </>
                        )}
                    </div>
                )}

                <FormField
                    label="E-mail"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />

                <FormField
                    label="Wachtwoord"
                    name="password"
                    type="password"
                    value={values.password}
                    placeholder="Minstens 6 tekens, met cijfers en letters"
                    onChange={handleChange}
                    error={errors.password}
                    required
                    autoComplete="new-password"
                />

                <FormField
                    label="Bevestig Wachtwoord"
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    autoComplete="new-password"
                />

                <SubmitButton type="submit" disabled={isSubmitting || redirectCountdown !== null}
                              loading={isSubmitting}>
                    {isSubmitting ? 'Account wordt aangemaakt...' : 'Registreren'}
                </SubmitButton>
            </form>
        </div>
    );
}

export default SignupForm;
