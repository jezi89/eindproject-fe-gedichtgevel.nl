/**
 * ContactPage Component
 *
 * The contact page for the gedichtgevel.nl application.
 * Displays contact information and a contact form.
 *
 * @module pages/Contact/ContactPage
 */

/**
 * ContactPage component
 *
 * @component
 * @returns {JSX.Element} Contact page component
 */
export function ContactPage() {
    return (
      <div className="page-contact">
        <h1 className="page-title">Contact</h1>
        <p className="page-subtitle">Contact us</p>

        <section className="contact-section">
          <h2>Send us a message</h2>
          <p>
            Do you have questions, suggestions, or comments about GedichtGevel?
            We'd love to hear from you!
          </p>

          <div className="contact-info">
            <p>
              <strong>Email:</strong> codingjer@gmail.com
            </p>
            <p>
              <strong>Phone:</strong> apple, pear, banana. That's none of your
              business!
            </p>
          </div>
        </section>

        <section className="contact-section">
          <h2>Collaborate</h2>
          <p>
            Are you a poet, publisher, or organization? We are open to
            collaborations to make poetry more accessible.
          </p>
        </section>

        <section className="contact-section">
          <h2>Technical Support</h2>
          <p>
            For technical questions or issues with the website, email:
            support@gedichtgevel.nl
          </p>
        </section>
      </div>
    );
}