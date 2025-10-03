/**
 * FavoritesSection Component
 *
 * Displays user's favorite poems and authors
 * Allows switching between poems and authors with tabs
 * Provides remove functionality for favorites
 *
 * @module components/account/FavoritesSection
 */

import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useFavorites} from '@/hooks/account/useFavorites';
import styles from './FavoritesSection.module.scss';

/**
 * FavoritesSection component
 *
 * @returns {JSX.Element}
 */
export function FavoritesSection() {
    const {
        favoritePoems,
        favoriteAuthors,
        loading,
        error,
        removePoem,
        removeAuthor,
        clearError
    } = useFavorites();

    const [activeTab, setActiveTab] = useState('poems');

    /**
     * Handle removing a poem from favorites
     */
    const handleRemovePoem = async (poemId) => {
        const result = await removePoem(poemId);
        if (result.success) {
            // Success feedback could be added here
        }
    };

    /**
     * Handle removing an author from favorites
     */
    const handleRemoveAuthor = async (authorId) => {
        const result = await removeAuthor(authorId);
        if (result.success) {
            // Success feedback could be added here
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}/>
                <p>Favorieten laden...</p>
            </div>
        );
    }

    return (
        <div className={styles.favoritesSection}>
            {/* Error Message */}
            {error && (
                <div className={styles.errorMessage}>
                    <span>{error}</span>
                    <button onClick={clearError} className={styles.closeError}>
                        ✕
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div className={styles.tabNav}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'poems' ? styles.active : ''}`}
                    onClick={() => setActiveTab('poems')}
                >
                    <span className={styles.tabIcon}>📖</span>
                    <span className={styles.tabLabel}>
                        Gedichten ({favoritePoems.length})
                    </span>
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'authors' ? styles.active : ''}`}
                    onClick={() => setActiveTab('authors')}
                >
                    <span className={styles.tabIcon}>✍️</span>
                    <span className={styles.tabLabel}>
                        Dichters ({favoriteAuthors.length})
                    </span>
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'poems' ? (
                    <motion.div
                        key="poems"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                        className={styles.content}
                    >
                        {favoritePoems.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📚</span>
                                <h3>Geen favoriete gedichten</h3>
                                <p>Voeg gedichten toe aan je favorieten door op de ⭐ knop te klikken</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {favoritePoems.map((poem) => (
                                    <div key={poem.id} className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <h4 className={styles.poemTitle}>{poem.poem_title}</h4>
                                            <button
                                                onClick={() => handleRemovePoem(poem.id)}
                                                className={styles.removeButton}
                                                aria-label="Verwijder uit favorieten"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className={styles.author}>{poem.poem_author}</p>
                                        <div className={styles.poemPreview}>
                                            {poem.poem_lines?.slice(0, 3).map((line, idx) => (
                                                <p key={idx} className={styles.line}>{line}</p>
                                            ))}
                                            {poem.poem_lines?.length > 3 && (
                                                <p className={styles.more}>...</p>
                                            )}
                                        </div>
                                        <p className={styles.addedDate}>
                                            Toegevoegd: {new Date(poem.created_at).toLocaleDateString('nl-NL')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="authors"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3}}
                        className={styles.content}
                    >
                        {favoriteAuthors.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>✍️</span>
                                <h3>Geen favoriete dichters</h3>
                                <p>Voeg dichters toe aan je favorieten</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {favoriteAuthors.map((author) => (
                                    <div key={author.id} className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <h4 className={styles.authorName}>{author.author_name}</h4>
                                            <button
                                                onClick={() => handleRemoveAuthor(author.id)}
                                                className={styles.removeButton}
                                                aria-label="Verwijder uit favorieten"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className={styles.addedDate}>
                                            Toegevoegd: {new Date(author.created_at).toLocaleDateString('nl-NL')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}