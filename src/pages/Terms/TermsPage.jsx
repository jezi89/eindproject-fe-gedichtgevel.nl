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
      <h1 className="page-title">Algemene Voorwaarden</h1>
      <p className="page-subtitle">Gebruiksvoorwaarden en privacybeleid</p>

      <section className="terms-section">
        <h2>Gebruiksvoorwaarden</h2>
        <p>
          Door GedichtGevel.nl te gebruiken, ga je akkoord met de volgende
          voorwaarden:
        </p>
        <ul>
          <li>
            De gedichten op deze site zijn alleen voor persoonlijk gebruik
          </li>
          <li>Respecteer de auteursrechten van dichters</li>
          <li>Commercieel gebruik is niet toegestaan zonder toestemming</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2>Privacy</h2>
        <p>
          Wij respecteren je privacy. Je gegevens worden veilig opgeslagen en
          niet gedeeld met derden. Voor vragen over deze voorwaarden kun je
          contact met ons opnemen via de contactpagina.
        </p>
      </section>
    </div>
  );
}
