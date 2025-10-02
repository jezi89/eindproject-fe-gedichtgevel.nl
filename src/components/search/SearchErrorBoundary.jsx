import {Component} from 'react';
import styles from './SearchProgress.module.scss';

// TODO error boundary check en stylen

/**
 * Error Boundary specifically for search functionality
 * Provides graceful fallback when search components crash
 */
export class SearchErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        this.setState({
            error,
            errorInfo
        });

        // Log to error tracking service
        if (typeof window !== 'undefined' && window.console) {
            console.error('Search Error Boundary caught an error:', error, errorInfo);
        }

        // TODO: Send to error tracking service
        // trackSearchError(error, { componentStack: errorInfo.componentStack });
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
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3 className={styles.errorTitle}>
                            Er is iets misgegaan met zoeken
                        </h3>
                        <p className={styles.errorMessage}>
                            We konden de zoekfunctie niet laden. Probeer het opnieuw of ververs de pagina.
                        </p>

                        <div className={styles.errorActions}>
                            <button
                                onClick={this.handleRetry}
                                className={styles.retryButton}
                            >
                                Probeer opnieuw
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className={styles.reloadButton}
                            >
                                Pagina verversen
                            </button>
                        </div>

                        {/* Show error details in development */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary>Technische details (alleen in development)</summary>
                                <pre className={styles.errorStack}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
