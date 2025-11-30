import { useRouteError, Link, isRouteErrorResponse } from 'react-router';
import styles from './GlobalErrorBoundary.module.scss';

/**
 * Router Error Boundary voor React Router v7
 * Vangt routing errors op en toont gebruikersvriendelijke foutmeldingen.
 *
 * React Router v7 gebruikt `errorElement` in plaats van een traditionele Error Boundary.
 * Deze component wordt gebruikt in de router configuratie als errorElement.
 */
export function RouterErrorBoundary() {
    const error = useRouteError();

    // Bepaal error message
    let errorMessage = 'Er is iets misgegaan tijdens het laden van deze pagina.';
    let errorTitle = 'Fout bij navigatie';

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            errorTitle = 'Pagina niet gevonden';
            errorMessage = 'De pagina die je zoekt bestaat niet of is verplaatst.';
        } else if (error.status === 401) {
            errorTitle = 'Geen toegang';
            errorMessage = 'Je moet ingelogd zijn om deze pagina te bekijken.';
        } else if (error.status === 503) {
            errorTitle = 'Service niet beschikbaar';
            errorMessage = 'De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.';
        } else if (error.status === 500) {
            errorTitle = 'Server fout';
            errorMessage = 'Er is een fout opgetreden op de server. We zijn op de hoogte gesteld.';
        }
    }

    return (
        <div className={styles.errorBoundary}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.errorIcon}>
                        {error?.status === 404 ? '🔍' : '⚠️'}
                    </div>
                    <h1 className={styles.errorTitle}>
                        {errorTitle}
                    </h1>
                    <p className={styles.errorMessage}>
                        {errorMessage}
                    </p>

                    <div className={styles.errorActions}>
                        <Link
                            to="/"
                            className={styles.retryButton}
                        >
                            Terug naar home
                        </Link>
                        <Link
                            to="/contact"
                            className={styles.homeButton}
                        >
                            Contact opnemen
                        </Link>
                    </div>

                    {/* Toon technische details in development mode */}
                    {import.meta.env.DEV && error && (
                        <details className={styles.errorDetails}>
                            <summary>Technische details (alleen in development)</summary>
                            <pre className={styles.errorStack}>
                                {error?.status && `Status: ${error.status} ${error.statusText}\n\n`}
                                {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}
