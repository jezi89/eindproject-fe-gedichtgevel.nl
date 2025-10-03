/**
 * StatsSection Component
 *
 * Displays user activity statistics and insights
 * Shows favorite counts, top authors, and activity trends
 *
 * @module components/account/StatsSection
 */

import {useUserStats} from '@/hooks/account/useUserStats';
import styles from './StatsSection.module.scss';

/**
 * StatsSection component
 *
 * @returns {JSX.Element}
 */
export function StatsSection() {
    const {
        stats,
        dailyActivity,
        favoriteThemes,
        loading,
        error,
        getSummary,
        clearError
    } = useUserStats();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}/>
                <p>Statistieken laden...</p>
            </div>
        );
    }

    const summary = getSummary();

    return (
        <div className={styles.statsSection}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage}>
                    <span>{error}</span>
                    <button onClick={clearError} className={styles.closeError}>
                        ✕
                    </button>
                </div>
            )}

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>⭐</div>
                    <div className={styles.cardContent}>
                        <h3>Totaal Favorieten</h3>
                        <p className={styles.statNumber}>{summary.totalFavorites}</p>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>✍️</div>
                    <div className={styles.cardContent}>
                        <h3>Favoriete Dichter</h3>
                        <p className={styles.statText}>{summary.mostFavoritedAuthor}</p>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>📅</div>
                    <div className={styles.cardContent}>
                        <h3>Laatste Activiteit</h3>
                        <p className={styles.statText}>{summary.lastActivity}</p>
                    </div>
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.cardIcon}>📊</div>
                    <div className={styles.cardContent}>
                        <h3>Deze Maand</h3>
                        <p className={styles.statNumber}>{summary.activeThisMonth}</p>
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className={styles.detailsGrid}>
                {/* Top Authors */}
                <div className={styles.detailCard}>
                    <h3 className={styles.detailTitle}>
                        <span className={styles.detailIcon}>🏆</span>
                        Top Dichters
                    </h3>
                    {stats.topAuthors?.length > 0 ? (
                        <div className={styles.authorList}>
                            {stats.topAuthors.slice(0, 5).map((author, idx) => (
                                <div key={idx} className={styles.authorItem}>
                                    <span className={styles.rank}>#{idx + 1}</span>
                                    <span className={styles.authorName}>{author.author}</span>
                                    <span className={styles.count}>{author.count} gedichten</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noData}>Nog geen data beschikbaar</p>
                    )}
                </div>

                {/* Monthly Activity */}
                <div className={styles.detailCard}>
                    <h3 className={styles.detailTitle}>
                        <span className={styles.detailIcon}>📈</span>
                        Activiteit (6 maanden)
                    </h3>
                    {dailyActivity?.length > 0 ? (
                        <div className={styles.activityChart}>
                            {dailyActivity.map((month, idx) => {
                                const maxCount = Math.max(...dailyActivity.map(m => m.count));
                                const heightPercent = maxCount > 0 ? (month.count / maxCount) * 100 : 0;

                                return (
                                    <div key={idx} className={styles.monthColumn}>
                                        <div className={styles.barContainer}>
                                            <div
                                                className={styles.bar}
                                                style={{height: `${heightPercent}%`}}
                                            >
                                                <span className={styles.barValue}>{month.count}</span>
                                            </div>
                                        </div>
                                        <span className={styles.monthLabel}>{month.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.noData}>Nog geen activiteit</p>
                    )}
                </div>

                {/* Favorite Themes */}
                <div className={styles.detailCard}>
                    <h3 className={styles.detailTitle}>
                        <span className={styles.detailIcon}>🎨</span>
                        Favoriete Thema's
                    </h3>
                    {favoriteThemes?.length > 0 ? (
                        <div className={styles.themeList}>
                            {favoriteThemes.slice(0, 5).map((theme, idx) => (
                                <div key={idx} className={styles.themeItem}>
                                    <span className={styles.themeName}>{theme.theme}</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{width: `${theme.percentage}%`}}
                                        />
                                    </div>
                                    <span className={styles.percentage}>{theme.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noData}>Nog geen thema data</p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className={styles.detailCard}>
                    <h3 className={styles.detailTitle}>
                        <span className={styles.detailIcon}>🕐</span>
                        Recente Activiteit
                    </h3>
                    {stats.recentActivity?.length > 0 ? (
                        <div className={styles.activityList}>
                            {stats.recentActivity.slice(0, 5).map((activity, idx) => (
                                <div key={idx} className={styles.activityItem}>
                                    <div className={styles.activityDot}/>
                                    <div className={styles.activityContent}>
                                        <p className={styles.activityText}>
                                            {activity.poem_title}
                                        </p>
                                        <p className={styles.activityAuthor}>
                                            {activity.poem_author}
                                        </p>
                                        <p className={styles.activityDate}>
                                            {new Date(activity.created_at).toLocaleDateString('nl-NL', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noData}>Nog geen recente activiteit</p>
                    )}
                </div>
            </div>
        </div>
    );
}
