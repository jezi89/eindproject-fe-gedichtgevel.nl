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
import {useNavigate} from 'react-router';
import {useFavorites} from '@/hooks/poem/useFavorites';
import {useToast} from '@/context/ui/ToastContext';
import {getAuthorEra} from '@/utils/eraMapping';
import {generateMapsUrl} from '@/utils/addressFormatter';
import {useCanvasNavigation} from '@/hooks/canvas/useCanvasNavigation';
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
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { navigateToCanvas } = useCanvasNavigation();

    const [activeTab, setActiveTab] = useState('poems');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortPoems = (poems) => {
        return [...poems].sort((a, b) => {
            let comparison = 0;
            if (sortField === 'title') {
                comparison = (a.poem?.title || '').localeCompare(b.poem?.title || '');
            } else if (sortField === 'author') {
                comparison = (a.poem?.author || '').localeCompare(b.poem?.author || '');
            } else if (sortField === 'date') {
                comparison = new Date(a.created_at) - new Date(b.created_at);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    // Split poems into categories
    // Updated filter to check for 'straatpoezie_nl' as found in DB
    const streetPoems = sortPoems(favoritePoems.filter(f => 
        f.poem?.source === 'Straatpoëzie' || 
        f.poem?.source === 'straatpoezie_nl' || 
        f.poem?.street
    ));
    
    const poetryDBPoems = sortPoems(favoritePoems.filter(f => 
        f.poem?.source !== 'Straatpoëzie' && 
        f.poem?.source !== 'straatpoezie_nl' && 
        !f.poem?.street
    ));

    const countLines = (poem) => {
        if (poem?.lines_count) return poem.lines_count;
        if (!poem?.content) return 0;
        return poem.content.split('\n').length;
    };

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

    const handleNavigateToDesign = (poem) => {
        try {
            navigateToCanvas(poem, { source: 'favorites' });
        } catch (error) {
            console.error("Navigation failed:", error);
            addToast("Kon canvas niet openen", "error");
        }
    };

    const handleNavigateToRecord = (poem) => {
        navigate('/spreekgevel', { state: { selectedPoem: poem } });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}/>
                <p>Favorieten laden...</p>
            </div>
        );
    }

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

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
                    onClick={() => {
                        // setActiveTab('authors');
                        addToast('Deze functie komt beschikbaar in versie 2.0', 'info');
                    }}
                >
                    <span className={styles.tabIcon}>✍️</span>
                    <span className={styles.tabLabel}>
                        Dichters
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
                            <div className={styles.tablesWrapper}>
                                {/* Straatgedichten Table */}
                                {streetPoems.length > 0 && (
                                    <div className={styles.tableSection}>
                                        <h3 className={styles.tableTitle}>Straatgedichten</h3>
                                        <div className={styles.tableContainer}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort('title')} className={styles.sortableHeader}>
                                                            Titel {renderSortIcon('title')}
                                                        </th>
                                                        <th onClick={() => handleSort('author')} className={styles.sortableHeader}>
                                                            Dichter {renderSortIcon('author')}
                                                        </th>
                                                        <th>Locatie</th>
                                                        <th>Regels</th>
                                                        <th className={styles.actionHeader}>Acties</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {streetPoems.map((fav) => {
                                                        const locationText = fav.poem.street || fav.poem.address || fav.poem.city || '-';
                                                        const mapsUrl = generateMapsUrl(fav.poem.location_lat, fav.poem.location_lon, locationText);
                                                        return (
                                                            <tr key={fav.id}>
                                                                <td className={styles.titleCell}>
                                                                    <span className={styles.cellLabel}>Titel:</span>
                                                                    {fav.poem?.title || 'Onbekend'}
                                                                </td>
                                                                <td className={styles.authorCell}>
                                                                    <span className={styles.cellLabel}>Dichter:</span>
                                                                    {fav.poem?.author || 'Onbekend'}
                                                                </td>
                                                                <td className={styles.locationCell}>
                                                                    <span className={styles.cellLabel}>Locatie:</span>
                                                                    {locationText !== '-' ? (
                                                                        mapsUrl ? (
                                                                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                                                                                {locationText} 📍
                                                                            </a>
                                                                        ) : (
                                                                            <span>{locationText}</span>
                                                                        )
                                                                    ) : '-'}
                                                                </td>
                                                                <td className={styles.linesCell}>
                                                                    <span className={styles.cellLabel}>Regels:</span>
                                                                    {countLines(fav.poem)}
                                                                </td>
                                                                <td className={styles.actionCell}>
                                                                    <div className={styles.actionButtons}>
                                                                        <button onClick={() => handleNavigateToDesign(fav.poem)} title="Ontwerp gevel" className={styles.iconButton}>🎨</button>
                                                                        <button onClick={() => handleNavigateToRecord(fav.poem)} title="Spreek in" className={styles.iconButton}>🎤</button>
                                                                        <button onClick={() => handleRemovePoem(fav.item_id)} title="Verwijder" className={styles.removeButton}>🗑️</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* PoetryDB Table */}
                                {poetryDBPoems.length > 0 && (
                                    <div className={styles.tableSection}>
                                        <h3 className={styles.tableTitle}>PoetryDB Gedichten</h3>
                                        <div className={styles.tableContainer}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort('title')} className={styles.sortableHeader}>
                                                            Titel {renderSortIcon('title')}
                                                        </th>
                                                        <th onClick={() => handleSort('author')} className={styles.sortableHeader}>
                                                            Dichter {renderSortIcon('author')}
                                                        </th>
                                                        <th>Tijdperk</th>
                                                        <th>Regels</th>
                                                        <th className={styles.actionHeader}>Acties</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {poetryDBPoems.map((fav) => (
                                                        <tr key={fav.id}>
                                                            <td className={styles.titleCell}>
                                                                <span className={styles.cellLabel}>Titel:</span>
                                                                {fav.poem?.title || 'Onbekend'}
                                                            </td>
                                                            <td className={styles.authorCell}>
                                                                <span className={styles.cellLabel}>Dichter:</span>
                                                                {fav.poem?.author || 'Onbekend'}
                                                            </td>
                                                            <td className={styles.eraCell}>
                                                                <span className={styles.cellLabel}>Tijdperk:</span>
                                                                {getAuthorEra(fav.poem?.author)}
                                                            </td>
                                                            <td className={styles.linesCell}>
                                                                <span className={styles.cellLabel}>Regels:</span>
                                                                {countLines(fav.poem)}
                                                            </td>
                                                            <td className={styles.actionCell}>
                                                                <div className={styles.actionButtons}>
                                                                    <button onClick={() => handleNavigateToDesign(fav.poem)} title="Ontwerp gevel" className={styles.iconButton}>🎨</button>
                                                                    <button onClick={() => handleNavigateToRecord(fav.poem)} title="Spreek in" className={styles.iconButton}>🎤</button>
                                                                    <button onClick={() => handleRemovePoem(fav.item_id)} title="Verwijder" className={styles.removeButton}>🗑️</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
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