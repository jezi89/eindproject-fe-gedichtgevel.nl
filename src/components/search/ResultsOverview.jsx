import styles from './SearchResults.module.scss';

// ResultsOverview component - Simple or Circle variant
const ResultsOverview = ({resultCount, variant = 'circle'}) => {
    if (variant === 'simple') {
        return (
            <div className={styles.resultsOverviewSimple}>
                <span className={styles.simpleCount}>{resultCount}</span>
                <span className={styles.simpleLabel}>
                    {resultCount === 1 ? 'gedicht gevonden' : 'gedichten gevonden'}
                </span>
            </div>
        );
    }

    return (
        <div className={styles.resultsOverview}>
            <div className={styles.overviewCircle}>
                <div className={styles.overviewContent}>
                    <div className={styles.overviewTopHalf}>
                        <div className={styles.overviewLabel}>Ga naar overzicht:</div>
                        <div className={styles.overviewIcon}>♡</div>
                    </div>
                    <div className={styles.overviewBottomHalf}>
                        <div className={styles.overviewNumber}>{resultCount}</div>
                        <div className={styles.overviewLines}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};