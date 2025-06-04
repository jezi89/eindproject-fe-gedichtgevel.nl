import PasswordResetForm from '../../components/forms/PasswordResetForm.jsx';
import {Link} from 'react-router';
import '../../layouts/_auth-layout.scss';

export default function PasswordResetPage() {
    return (
        <div className="auth-layout">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Wachtwoord vergeten?</h1>
                    <p>Vul je e-mailadres in om een reset link te ontvangen</p>
                </div>

                <PasswordResetForm/>

                <div className="auth-footer">
                    <p>
                        Weet je je wachtwoord weer? {' '}
                        <Link to="/login">
                            Terug naar inloggen
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
