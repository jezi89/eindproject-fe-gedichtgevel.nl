import {useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../../hooks/useAuth.js';
import NewPasswordForm from '../../components/forms/NewPasswordForm.jsx';
import '../../layouts/_auth-layout.scss';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const {user} = useAuth();

    useEffect(() => {
        // Check if user came from a valid reset link
        // Supabase will automatically log the user in when they click the reset link
        if (!user) {
            // If no user is logged in, redirect to password reset request page
            navigate('/password-reset');
        }
    }, [user, navigate]);

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="auth-layout">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Nieuw wachtwoord instellen</h1>
                    <p>Kies een sterk wachtwoord voor je account</p>
                </div>

                <NewPasswordForm/>
            </div>
        </div>
    );
}
