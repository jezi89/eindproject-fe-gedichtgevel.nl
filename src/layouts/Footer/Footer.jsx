import styles from './Footer.module.scss';

// TODO Footer verbeteren

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
                            <li><a href="/zoeken" className={styles.footerLink}>Zoeken</a></li>
                            <li><a href="/collectie" className={styles.footerLink}>Collectie</a></li>
                            <li><a href="/audio" className={styles.footerLink}>Audio</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerSection}>
                        <h4 className={styles.footerSubtitle}>Account</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="/profiel" className={styles.footerLink}>Profiel</a></li>
                            <li><a href="/instellingen" className={styles.footerLink}>Instellingen</a></li>
                        </ul>
                    </div>

                    <div className={styles.footerSection}>
                        <h4 className={styles.footerSubtitle}>Info</h4>
                        <ul className={styles.footerLinks}>
                            <li><a href="/over" className={styles.footerLink}>Over ons</a></li>
                            <li><a href="/contact" className={styles.footerLink}>Contact</a></li>
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

