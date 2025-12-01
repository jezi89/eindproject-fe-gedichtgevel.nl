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
        <h1 className="page-title">About GedichtGevel</h1>
        <p className="page-subtitle">Poetry in the streetscape</p>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            GedichtGevel aims to make poetry accessible to everyone. We believe
            that poems belong not only in books but should also be visible in
            our daily environment.
          </p>
        </section>

        <section className="about-section">
          <h2>The Project</h2>
          <p>
            This project collects and presents poems found on facades, walls,
            and in public spaces. By making these works digitally accessible, we
            preserve cultural heritage and inspire passersby to pause for a
            moment.
          </p>
        </section>

        <section className="about-section">
          <h2>Join Us</h2>
          <p>
            Do you know a poem in your neighborhood that is not yet on our map?
            Or are you a poet yourself and want to contribute? Contact us via
            the contact page.
          </p>
        </section>
      </div>
    );
}
