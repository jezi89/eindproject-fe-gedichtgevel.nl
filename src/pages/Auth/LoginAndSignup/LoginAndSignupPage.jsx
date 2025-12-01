/**
 * LoginAndSignupPage Component
 *
 * Provides interface for user authentication through
 * login and registration forms.
 *
 * @module pages/LoginAndSignup/LoginAndSignupPage
 */

import {useEffect, useState} from "react";
import {ActionButton} from "@/components/ui/button/ActionButton.jsx";
import { useLocation } from "react-router";
import {LoginForm} from "@/components/forms/LoginForm.jsx";
import {SignupForm} from "@/components/forms/SignupForm.jsx";
import { useToast } from "@/context/ui/ToastContext";
// import LoginForm from "@/components/forms/LoginForm.jsx";
// import SignupForm from "@/components/forms/SignupForm.jsx";
// import {ActionButton} from "@/components/ui/button/ActionButton.jsx";

/**
 * LoginAndSignupPage component with toggle between login and registration
 *
 * @component
 * @returns {JSX.Element} Login and register page component
 */
export function LoginAndSignupPage() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(true);
  const { addToast } = useToast();

  // Check if we're coming from Signup with email
  useEffect(() => {
    if (location.pathname === "/login" && location.state?.email) {
      setShowLogin(true);
    }

    // Handle URL parameters for confirmation and errors
    const params = new URLSearchParams(location.search);

    if (params.get("confirmed") === "true") {
      addToast("Email succesvol bevestigd! Je kunt nu inloggen.", "success");
      setShowLogin(true);
    }

    if (params.get("error")) {
      addToast(decodeURIComponent(params.get("error")), "error");
    }
  }, [location, addToast]);

  return (
    <>
      <h1>Log In of Registreer</h1>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          margin: "1rem 0",
        }}
      >
        <ActionButton onClick={() => setShowLogin(true)}>Inloggen</ActionButton>
        <ActionButton onClick={() => setShowLogin(false)}>
          Registreren
        </ActionButton>
      </div>

      {showLogin ? <LoginForm /> : <SignupForm />}
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        {showLogin
          ? "Nog geen account? Klik op Registreren hierboven"
          : "Al een account? Klik op Inloggen hierboven"}
      </p>
    </>
  );
}

// State
// - showLogin: Whether to show login form (true) or Signup form (false)

// Toggle between login and registration forms
// Display appropriate form based on state
// Provide navigation between forms with appropriate messaging
