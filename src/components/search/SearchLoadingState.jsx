import styles from './SearchProgress.module.scss';

// TODO SearchLoadingState checken en stylen

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
