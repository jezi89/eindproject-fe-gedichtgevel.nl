import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCanvasStorage } from '@/hooks/canvas/useCanvasStorage';
import styles from './CollectionPage.module.scss';

export function CollectionPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { designs, totalCount, isLoading, error, list, remove } = useCanvasStorage();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        // Load designs when component mounts and user is logged in
        if (user) {
            console.log('📋 CollectionPage: Loading designs for user:', user.id);
            list({ limit: 50, orderBy: 'updated_at', ascending: false });
        }
    }, [user, list]);

    const handleOpenDesign = (design) => {
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
        <div className={styles.collectionPage}>
            <div className={styles.pageHeader}>
                <h1>Collectiegevel</h1>
                <p className={styles.subtitle}>
                    Jouw verzameling gedichtgevels en inspiratie
                </p>
            </div>

            {/* Mijn Designs Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Mijn Designs</h2>
                    {user && (
                        <span className={styles.count}>
                            {totalCount} {totalCount === 1 ? 'design' : 'designs'}
                        </span>
                    )}
                </div>

                {!user ? (
                    <div className={styles.authPrompt}>
                        <p>Log in om je opgeslagen designs te bekijken</p>
                        <button
                            className={styles.loginButton}
                            onClick={() => navigate('/login')}
                        >
                            Inloggen
                        </button>
                    </div>
                ) : error ? (
                    <div className={styles.error}>
                        <p>{error}</p>
                    </div>
                ) : isLoading && designs.length === 0 ? (
                    <div className={styles.loading}>
                        <p>Designs laden...</p>
                    </div>
                ) : designs.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Nog geen designs</h3>
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
                                            <span>📝</span>
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

                                    {design.design_settings?.backgroundImage && (
                                        <div className={styles.photoInfo}>
                                            {design.design_settings.backgroundImage.alt && (
                                                <p className={styles.photoAlt}>
                                                    📸 {design.design_settings.backgroundImage.alt}
                                                </p>
                                            )}
                                            <div className={styles.photoMeta}>
                                                {design.design_settings.backgroundImage.photographer && (
                                                    <span className={styles.photographer}>
                                                        👤 {design.design_settings.backgroundImage.photographer}
                                                    </span>
                                                )}
                                                {design.design_settings.backgroundImage.width && design.design_settings.backgroundImage.height && (
                                                    <span className={styles.dimensions}>
                                                        📐 {design.design_settings.backgroundImage.width} × {design.design_settings.backgroundImage.height}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.designMeta}>
                                        <span className={styles.date}>
                                            {formatDate(design.updated_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    {deleteConfirm === design.id ? (
                                        <div className={styles.deleteConfirm}>
                                            <button
                                                className={styles.confirmBtn}
                                                onClick={(e) => handleConfirmDelete(design.id, e)}
                                            >
                                                Verwijder
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={handleCancelDelete}
                                            >
                                                Annuleer
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDeleteClick(design.id, e)}
                                            title="Verwijder design"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* TODO: Add more sections here later */}
            {/* - Publieke collectie */}
            {/* - Favorieten */}
            {/* - Gedeeld met mij */}
        </div>
    );
}