import styles from './SearchProgress.module.scss';

// TODO Check and style SearchLoadingState

export function SearchLoadingState() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}>
                <div className={styles.spinnerRing}></div>
            </div>
            <p className={styles.loadingText}>Zoeken naar gedichten...</p>
        </div>
    );
}
