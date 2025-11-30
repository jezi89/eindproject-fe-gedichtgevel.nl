import {Component} from 'react';
import {Link} from 'react-router';
import styles from './GlobalErrorBoundary.module.scss';

/**
 * Global Error Boundary for catching runtime errors
 * Provides graceful fallback when components crash
 */
export class GlobalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to console in development
        if (typeof window !== 'undefined' && window.console && import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.container}>
                        <div className={styles.content}>
                            <div className={styles.errorIcon}>⚠️</div>
                            <h1 className={styles.errorTitle}>
                                Er is iets misgegaan
                            </h1>
                            <p className={styles.errorMessage}>
                                We konden deze pagina niet laden. Probeer het opnieuw of ga terug naar de homepagina.
                            </p>

                            <div className={styles.errorActions}>
                                <button
                                    onClick={this.handleRetry}
                                    className={styles.retryButton}
                                >
                                    Probeer opnieuw
                                </button>
                                <Link
                                    to="/"
                                    className={styles.homeButton}
                                >
                                    Terug naar home
                                </Link>
                            </div>

                            {import.meta.env.DEV && this.state.error && (
                                <details className={styles.errorDetails}>
                                    <summary>Technische details (alleen in development)</summary>
                                    <pre className={styles.errorStack}>
                                        {this.state.error.toString()}
                                        {'\n\n'}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
