/**
 * FAQPage Component
 *
 * The FAQ (Hoe dan?) page for the gedichtgevel.nl application.
 * Displays frequently asked questions about using the platform.
 *
 * @module pages/FAQ/FAQPage
 */

/**
 * FAQPage component
 *
 * @component
 * @returns {JSX.Element} FAQ page component
 */
export function FAQPage() {
    return (
        <div className="page-faq">
            <h1 className="page-title">Hoe dan?</h1>
            <p className="page-subtitle">Veelgestelde vragen over GedichtGevel</p>

            <section className="faq-section">
                <h2>Hoe werkt het?</h2>
                <p>Hier komt uitleg over hoe je GedichtGevel kunt gebruiken.</p>
            </section>

            <section className="faq-section">
                <h2>Gedichten zoeken</h2>
                <p>Gebruik de zoekbalk om gedichten te vinden op titel, dichter of trefwoord.</p>
            </section>

            <section className="faq-section">
                <h2>Gevels ontwerpen</h2>
                <p>In de Design Gevel kun je gedichten op een gevel plaatsen en vormgeven.</p>
            </section>

            <section className="faq-section">
                <h2>Audio opnemen</h2>
                <p>Met Spreek Gevel kun je gedichten inspreken en beluisteren.</p>
            </section>
        </div>
    );
}