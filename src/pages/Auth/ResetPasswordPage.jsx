import {useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../../hooks/auth/useAuth.js';
import NewPasswordForm from '../../components/forms/NewPasswordForm.jsx';
import '../../layouts/_auth-layout.scss';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
      // Wait for auth to finish loading before making decisions
      if (loading) return;

      // Check if user came from a valid reset link
      // Supabase will automatically log the user in when they click the reset link
      if (!user) {
        // If no user is logged in, redirect to password reset request page
        navigate("/password-reset");
      }
    }, [user, loading, navigate]);
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <div>Laden...</div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect
    }

    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Nieuw Wachtwoord Instellen</h1>
            <p>Voer hieronder je nieuwe wachtwoord in.</p>
          </div>

          <NewPasswordForm />
        </div>
      </div>
    );
}
