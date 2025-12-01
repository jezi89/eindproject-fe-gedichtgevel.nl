/**
 * TermsPage Component
 *
 * The Terms and Conditions page for the gedichtgevel.nl application.
 * Displays the terms of use and privacy policy.
 *
 * @module pages/Terms/TermsPage
 */

/**
 * TermsPage component
 *
 * @component
 * @returns {JSX.Element} Terms page component
 */
export function TermsPage() {
    return (
      <div className="page-terms">
        <h1 className="page-title">Terms and Conditions</h1>
        <p className="page-subtitle">Terms of use and privacy policy</p>

        <section className="terms-section">
          <h2>Terms of Use</h2>
          <p>By using GedichtGevel.nl, you agree to the following terms:</p>
          <ul>
            <li>The poems on this site are for personal use only</li>
            <li>Respect the copyrights of poets</li>
            <li>Commercial use is not allowed without permission</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Privacy</h2>
          <p>
            We respect your privacy. Your data is stored securely and not shared
            with third parties. For questions about these terms, please contact
            us via the contact page.
          </p>
        </section>
      </div>
    );
}