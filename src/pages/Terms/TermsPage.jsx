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
            <h1 className="page-title">Voorwaarden</h1>
            <p className="page-subtitle">Gebruiksvoorwaarden en privacybeleid</p>

            <section className="terms-section">
                <h2>Gebruiksvoorwaarden</h2>
                <p>
                    Door gebruik te maken van GedichtGevel.nl gaat u akkoord met de volgende voorwaarden:
                </p>
                <ul>
                    <li>De gedichten op deze site zijn alleen voor persoonlijk gebruik</li>
                    <li>Respecteer de auteursrechten van dichters</li>
                    <li>Commercieel gebruik is niet toegestaan zonder toestemming</li>
                </ul>
            </section>

            <section className="terms-section">
                <h2>Privacy</h2>
                <p>
                    Wij respecteren uw privacy. Uw gegevens worden veilig opgeslagen en niet gedeeld met derden.
                </p>
            </section>

            <section className="terms-section">
                <h2>Auteursrecht</h2>
                <p>
                    Alle gedichten blijven eigendom van hun respectievelijke auteurs.
                    GedichtGevel faciliteert alleen de presentatie ervan.
                </p>
            </section>

            <section className="terms-section">
                <h2>Contact</h2>
                <p>
                    Voor vragen over deze voorwaarden kunt u contact opnemen via de contactpagina.
                </p>
            </section>
        </div>
    );
}