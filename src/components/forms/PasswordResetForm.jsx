import {useState} from 'react';
import {useAuth} from '@/hooks/auth/useAuth.js';
import {usePrefilledEmail} from '@/hooks/useNavigationState.js';
import {SubmitButton} from '@/components/ui/button/ActionButton.jsx';
import {FormField} from './FormField';
import styles from './forms.module.scss';

export default function PasswordResetForm() {
    const [email, setEmail] = useState(usePrefilledEmail());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const {requestPasswordResetEmail} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        if (!email) {
            setError('Vul een emailadres in');
            setIsSubmitting(false);
            return;
        }

        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Vul een geldig emailadres in');
            setIsSubmitting(false);
            return;
        }

        const result = await requestPasswordResetEmail(email);

        if (result.success) {
            setSuccess(true);
            setEmail('');
        } else {
            setError(result.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2>Wachtwoord vergeten</h2>

            {error && (
                <div className={styles.formError} role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className={styles.formSuccess}>
                    We hebben een email gestuurd naar {email} met instructies om je wachtwoord te resetten.
                    Controleer ook je spam folder.
                </div>
            )}

            {!success && (
                <>
                    <p className={styles.formInfo}>
                        Vul je emailadres in en we sturen je een link om je wachtwoord te resetten.
                    </p>

                    <FormField
                        label="Email"
                        type="email"
                        name="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="jouw@email.nl"
                        disabled={isSubmitting}
                        error={error && error.includes("email") ? error : null}
                    />

                    <SubmitButton
                        type="submit"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Bezig met versturen...' : 'Verstuur reset link'}
                    </SubmitButton>
                </>
            )}
        </form>
    );
}
