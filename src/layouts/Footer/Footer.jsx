import styles from './Footer.module.scss';

// TODO Improve Footer

export function Footer() {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Gedichtgevel</h3>
              <p className={styles.footerDescription}>
                Waar poëzie en architectuur samenkomen
              </p>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Ontdekken</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/" className={styles.footerLink}>
                    Zoeken
                  </a>
                </li>
                <li>
                  <a href="/designgevel" className={styles.footerLink}>
                    Designgevel
                  </a>
                </li>
                <li>
                  <a href="/spreekgevel" className={styles.footerLink}>
                    Spreekgevel
                  </a>
                </li>
                <li>
                  <a href="/collectiegevel" className={styles.footerLink}>
                    Collectiegevel
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Account</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/account" className={styles.footerLink}>
                    Mijn Account
                  </a>
                </li>
                <li>
                  <a href="/welkom" className={styles.footerLink}>
                    Inloggen
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Info</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/overmij" className={styles.footerLink}>
                    Over
                  </a>
                </li>
                <li>
                  <a href="/contact" className={styles.footerLink}>
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/hoedan" className={styles.footerLink}>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/voorwaarden" className={styles.footerLink}>
                    Voorwaarden
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              © 2025 Gedichtgevel. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    );
}

