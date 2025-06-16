import {useState} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '@/hooks/auth/useAuth.js';
import {SubmitButton} from '@/components/ui/button/ActionButton.jsx';
import FormField from './FormField';
import styles from './forms.module.scss';

export default function NewPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const {updateUserPasswordAfterReset} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        let currentErrors = {};

        // Validate passwords
        if (!password) {
            currentErrors.password = 'Nieuw wachtwoord is verplicht';
        } else if (password.length < 6) {
            currentErrors.password = 'Wachtwoord moet minimaal 6 karakters bevatten';
        }

        if (!confirmPassword) {
            currentErrors.confirmPassword = 'Bevestig je wachtwoord';
        } else if (password && password !== confirmPassword) {
            currentErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
        }

        if (Object.keys(currentErrors).length > 0) {
            // For simplicity, setting a general error. Could be enhanced to set individual field errors.
            setError(Object.values(currentErrors).join(' '));
            setIsSubmitting(false);
            return;
        }

        const result = await updateUserPasswordAfterReset(password);

        if (result.success) {
            // Redirect to login page after successful password reset
            navigate('/login', {
                state: {message: 'Wachtwoord succesvol gereset. Je kunt nu inloggen met je nieuwe wachtwoord.'}
            });
        } else {
            setError(result.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2>Nieuw wachtwoord instellen</h2>

            {error && (
                <div className={styles.formError} role="alert">
                    {error}
                </div>
            )}

            <FormField
                label="Nieuw wachtwoord"
                type="password"
                name="newPassword"
                id="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimaal 6 karakters"
                disabled={isSubmitting}
                autoComplete="new-password"
            />

            <FormField
                label="Bevestig wachtwoord"
                type="password"
                name="confirmPassword"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Herhaal je nieuwe wachtwoord"
                disabled={isSubmitting}
                autoComplete="new-password"
            />

            <SubmitButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
            >
                {isSubmitting ? 'Wachtwoord instellen...' : 'Stel nieuw wachtwoord in'}
            </SubmitButton>
        </form>
    );
}
