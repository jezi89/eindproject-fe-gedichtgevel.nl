import {Link} from 'react-router';
import styles from './NotFoundPage.module.scss';

/**
 * 404 Not Found Page
 * Displayed when a user navigates to a non-existent route
 */
export function NotFoundPage() {
    return (
        <div className={styles.notFoundPage}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.errorCode}>404</h1>
                    <h2 className={styles.title}>Pagina niet gevonden</h2>
                    <p className={styles.message}>
                        Deze pagina bestaat niet (meer). Misschien is de link verouderd of heb je een typfout gemaakt?
                    </p>

                    <div className={styles.actions}>
                        <Link to="/" className={styles.homeButton}>
                            Terug naar home
                        </Link>
                    </div>

                    <div className={styles.suggestions}>
                        <p className={styles.suggestionsTitle}>Populaire pagina's:</p>
                        <ul className={styles.linkList}>
                            <li>
                                <Link to="/designgevel">Designgevel - Ontwerp je eigen gedichtgevel</Link>
                            </li>
                            <li>
                                <Link to="/spreekgevel">Spreekgevel - Neem je gedicht op</Link>
                            </li>
                            <li>
                                <Link to="/collectiegevel">Collectiegevel - Bekijk je collectie</Link>
                            </li>
                            <li>
                                <Link to="/overmij">Over dit project</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
