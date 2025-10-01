import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useCanvasStorage } from '@/hooks/canvas/useCanvasStorage';
import styles from './MyDesignsPage.module.scss';

export function MyDesignsPage() {
    const navigate = useNavigate();
    const { designs, totalCount, isLoading, error, list, remove } = useCanvasStorage();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        // Load designs when component mounts
        list({ limit: 50, orderBy: 'updated_at', ascending: false });
    }, [list]);

    const handleOpenDesign = (design) => {
        // Navigate to canvas with design ID
        navigate(`/designgevel?design=${design.id}`);
    };

    const handleDeleteClick = (designId, e) => {
        e.stopPropagation();
        setDeleteConfirm(designId);
    };

    const handleConfirmDelete = async (designId, e) => {
        e.stopPropagation();
        const result = await remove(designId);
        if (result.success) {
            setDeleteConfirm(null);
        }
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setDeleteConfirm(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.myDesignsPage}>
            <div className={styles.header}>
                <h1>Mijn Designs</h1>
                <p className={styles.subtitle}>
                    {totalCount} {totalCount === 1 ? 'design' : 'designs'}
                </p>
            </div>

            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && designs.length === 0 ? (
                <div className={styles.loading}>
                    <p>Designs laden...</p>
                </div>
            ) : designs.length === 0 ? (
                <div className={styles.empty}>
                    <h2>Nog geen designs</h2>
                    <p>Begin met het maken van je eerste gedichtgevel!</p>
                    <button
                        className={styles.createButton}
                        onClick={() => navigate('/designgevel')}
                    >
                        Nieuw Design Maken
                    </button>
                </div>
            ) : (
                <div className={styles.designGrid}>
                    {designs.map((design) => (
                        <div
                            key={design.id}
                            className={styles.designCard}
                            onClick={() => handleOpenDesign(design)}
                        >
                            <div className={styles.thumbnail}>
                                {design.thumbnail_url || design.background_url ? (
                                    <img
                                        src={design.thumbnail_url || design.background_url}
                                        alt={design.title}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.noImage}>
                                        <span>Geen afbeelding</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.designInfo}>
                                <h3 className={styles.designTitle}>{design.title}</h3>

                                {design.poem && (
                                    <div className={styles.poemInfo}>
                                        <p className={styles.poemTitle}>{design.poem.title}</p>
                                        <p className={styles.poemAuthor}>{design.poem.author}</p>
                                    </div>
                                )}

                                <div className={styles.designMeta}>
                                    <span className={styles.date}>
                                        {formatDate(design.updated_at)}
                                    </span>
                                    {design.is_public && (
                                        <span className={styles.badge}>Openbaar</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {deleteConfirm === design.id ? (
                                    <div className={styles.deleteConfirm}>
                                        <button
                                            className={styles.confirmBtn}
                                            onClick={(e) => handleConfirmDelete(design.id, e)}
                                        >
                                            Verwijderen
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={handleCancelDelete}
                                        >
                                            Annuleren
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={(e) => handleDeleteClick(design.id, e)}
                                        aria-label="Verwijder design"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
