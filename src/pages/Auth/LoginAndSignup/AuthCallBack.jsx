// TODO Check if this component is still needed and incorporate summary into justification documentation
/**
 * The AuthCallback component serves as an intermediary page for processing the Supabase authentication callback after, for example, email confirmation or magic link login.
 *
 * What is this component for?
 * Reads the hash from the URL (containing Supabase tokens after confirmation).
 * Requests the current session from Supabase (supabase.auth.getSession()).
 * Redirect:
 * If there is a valid session: to /account.
 * No session: to /welkom.
 * On error: to /welkom?error=....
 * Is this component necessary?
 * Supabase handles the callback largely automatically:
 * Supabase processes the hash and saves the session in localStorage as soon as the page loads.
 * However, a callback page is recommended:
 * You want to give the user a clear redirect after confirmation.
 * You can show loading/error messages.
 * You can add extra logic (e.g., onboarding, analytics).
 * See also the architecture file (AUTH_FLOW_ARCHITECTURE.md), where under "Email Confirmation Callback" it states:
 *
 * // Handles Supabase email confirmation redirects
 * // Redirects to /welkom after processing
 *
 * Summary
 * Supabase processes the hash automatically, but a custom callback component is useful for UX, error handling, and redirects.
 * Your component follows the recommended architecture and is therefore useful in this flow.
 *
 * @returns {JSX.Element|null}
 * @constructor
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/services/supabase/supabase.js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL (contains access_token, etc.)
        const hash = window.location.hash;

        if (hash) {
          // Supabase will automatically handle the hash and update the session
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            throw error; // Don't wrap in new Error()
          }

          if (data.session) {
            // Redirect to welcome or dashboard
            navigate("/account", { replace: true });
          } else {
            navigate("/welkom?confirmed=true", { replace: true });
          }
        } else {
          navigate("/welkom", { replace: true });
        }
      } catch (err) {
        setError(err.message);
        // Redirect to login with error message
        navigate("/welkom?error=" + encodeURIComponent(err.message), {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
        }}
      >
        <div>Confirming your account...</div>
        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Please wait, we are processing your email confirmation.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
        }}
      >
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error confirming your account
        </div>
        <div
          style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}
        >
          {error}
        </div>
        <button onClick={() => navigate("/welkom")}>Back to login</button>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
