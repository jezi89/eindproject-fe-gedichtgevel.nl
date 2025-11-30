/**
 * AboutPage Component
 *
 * The About page for the gedichtgevel.nl application.
 * Displays information about the project and its mission.
 *
 * @module pages/About/AboutPage
 */

/**
 * AboutPage component
 *
 * @component
 * @returns {JSX.Element} About page component
 */
export function AboutPage() {
    return (
        <div className="page-about">
            <h1 className="page-title">Over GedichtGevel</h1>
            <p className="page-subtitle">Poëzie in het straatbeeld</p>

            <section className="about-section">
                <h2>Onze Missie</h2>
                <p>
                    GedichtGevel heeft als doel poëzie toegankelijk te maken voor iedereen. 
                    Wij geloven dat gedichten niet alleen in boeken thuishoren, maar ook zichtbaar moeten zijn in onze dagelijkse omgeving.
                </p>
            </section>

            <section className="about-section">
                <h2>Het Project</h2>
                <p>
                    Dit project verzamelt en presenteert gedichten die te vinden zijn op gevels, muren en in de openbare ruimte. 
                    Door deze werken digitaal te ontsluiten, bewaren we cultureel erfgoed en inspireren we voorbijgangers om even stil te staan.
                </p>
            </section>

            <section className="about-section">
                <h2>Doe Mee</h2>
                <p>
                    Kent u een gedicht in uw buurt dat nog niet op onze kaart staat? 
                    Of bent u zelf dichter en wilt u bijdragen? Neem contact met ons op via de contactpagina.
                </p>
            </section>
        </div>
    );
}
