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
                Where poetry and architecture meet
              </p>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Discover</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/" className={styles.footerLink}>
                    Search
                  </a>
                </li>
                <li>
                  <a href="/designgevel" className={styles.footerLink}>
                    Design Facade
                  </a>
                </li>
                <li>
                  <a href="/spreekgevel" className={styles.footerLink}>
                    Speak Facade
                  </a>
                </li>
                <li>
                  <a href="/collectiegevel" className={styles.footerLink}>
                    Collection Facade
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Account</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/account" className={styles.footerLink}>
                    My Account
                  </a>
                </li>
                <li>
                  <a href="/welkom" className={styles.footerLink}>
                    Log In
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Info</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="/overmij" className={styles.footerLink}>
                    About
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
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              © 2025 Gedichtgevel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
}

