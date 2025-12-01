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
            <h2 className={styles.title}>Page not found</h2>
            <p className={styles.message}>
              This page does not exist (anymore). Maybe the link is outdated or
              you made a typo?
            </p>

            <div className={styles.actions}>
              <Link to="/" className={styles.homeButton}>
                Back to home
              </Link>
            </div>

            <div className={styles.suggestions}>
              <p className={styles.suggestionsTitle}>Popular pages:</p>
              <ul className={styles.linkList}>
                <li>
                  <Link to="/designgevel">
                    Design Facade - Design your own poem facade
                  </Link>
                </li>
                <li>
                  <Link to="/spreekgevel">Speak Facade - Record your poem</Link>
                </li>
                <li>
                  <Link to="/collectiegevel">
                    Collection Facade - View your collection
                  </Link>
                </li>
                <li>
                  <Link to="/overmij">About this project</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
}
