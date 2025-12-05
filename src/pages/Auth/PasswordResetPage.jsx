import PasswordResetForm from "../../components/forms/PasswordResetForm.jsx";
import { Link } from "react-router";
import "../../layouts/_auth-layout.scss";

export default function PasswordResetPage() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Wachtwoord Resetten</h1>
          <p>Vul je e-mailadres in om een reset link te ontvangen.</p>
        </div>

        <PasswordResetForm />

        <div className="auth-footer">
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            <a href="/welkom">Terug naar inloggen</a>
          </p>
        </div>
      </div>
    </div>
  );
}
