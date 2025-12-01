import PasswordResetForm from '../../components/forms/PasswordResetForm.jsx';
import {Link} from 'react-router';
import '../../layouts/_auth-layout.scss';

export default function PasswordResetPage() {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password?</h1>
            <p>Enter your email address to receive a reset link</p>
          </div>

          <PasswordResetForm />

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    );
}
