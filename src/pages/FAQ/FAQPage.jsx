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
        <h1 className="page-title">How does it work?</h1>
        <p className="page-subtitle">
          Frequently asked questions about GedichtGevel
        </p>

        <section className="faq-section">
          <h2>How does it work?</h2>
          <p>Here you will find an explanation of how to use GedichtGevel.</p>
        </section>

        <section className="faq-section">
          <h2>Searching for poems</h2>
          <p>Use the search bar to find poems by title, poet, or keyword.</p>
        </section>

        <section className="faq-section">
          <h2>Designing facades</h2>
          <p>
            In the Design Facade, you can place and style poems on a facade.
          </p>
        </section>

        <section className="faq-section">
          <h2>Recording audio</h2>
          <p>With Speak Facade, you can record and listen to poems.</p>
        </section>
      </div>
    );
}