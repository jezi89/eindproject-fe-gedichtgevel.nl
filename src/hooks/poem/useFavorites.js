import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { favoritesService } from '@/services/favorites/favoritesService';
import { useToast } from '@/context/ui/ToastContext';

export function useFavorites() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [favoriteKeys, setFavoriteKeys] = useState(new Set());
    const [favoritePoems, setFavoritePoems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setFavoriteKeys(new Set());
            setFavoritePoems([]);
            return;
        }

        const fetchFavorites = async () => {
            const result = await favoritesService.getFavoritePoems(user.id);
            if (result.success) {
                const keys = new Set();
                result.data.forEach(f => {
                    if (f.poem) {
                        keys.add(`${f.poem.title}|${f.poem.author}`);
                    }
                });
                setFavoriteKeys(keys);
                setFavoritePoems(result.data);
            } else {
                console.error('Error fetching favorites:', result.error);
            }
        };

        fetchFavorites();
    }, [user]);

    const toggleFavorite = useCallback(async (poem) => {
        if (!user) {
            addToast('Log in om favorieten op te slaan', 'info');
            return;
        }

        const key = `${poem.title}|${poem.author}`;
        setLoading(true);

        try {
            if (favoriteKeys.has(key)) {
                const favoriteEntry = favoritePoems.find(f =>
                    f.poem && f.poem.title === poem.title && f.poem.author === poem.author
                );

                if (favoriteEntry) {
                    const result = await favoritesService.removeFavoritePoem(user.id, favoriteEntry.item_id);
                    if (result.success) {
                         setFavoriteKeys(prev => {
                            const next = new Set(prev);
                            next.delete(key);
                            return next;
                        });
                        setFavoritePoems(prev => prev.filter(f => f.item_id !== favoriteEntry.item_id));
                        addToast('Verwijderd uit favorieten', 'info');
                    } else {
                        throw new Error(result.error);
                    }
                }
            } else {
                const result = await favoritesService.addFavoritePoem(user.id, poem);
                if (result.success) {
                     setFavoriteKeys(prev => {
                        const next = new Set(prev);
                        next.add(key);
                        return next;
                    });

                    const newFavorite = {
                        ...result.data,
                        poem: {
                            ...poem,
                            lines_count: poem.lines_count || (Array.isArray(poem.lines) ? poem.lines.length : (poem.lines || '').split('\n').length)
                        }
                    };
                    setFavoritePoems(prev => [newFavorite, ...prev]);
                    addToast('Toegevoegd aan favorieten', 'success');
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            addToast('Er ging iets mis bij het opslaan', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, favoriteKeys, favoritePoems, addToast]);

    const isFavorite = useCallback((poem) => {
        if (!poem) return false;
        return favoriteKeys.has(`${poem.title}|${poem.author}`);
    }, [favoriteKeys]);

    const removePoem = useCallback(async (poemId) => {
        if (!user) return { success: false };

        const result = await favoritesService.removeFavoritePoem(user.id, poemId);

        if (result.success) {
            setFavoritePoems(prev => prev.filter(p => p.item_id !== poemId));

            setFavoriteKeys(prev => {
                const next = new Set(prev);
                const poemToRemove = favoritePoems.find(p => p.item_id === poemId);
                if (poemToRemove && poemToRemove.poem) {
                    next.delete(`${poemToRemove.poem.title}|${poemToRemove.poem.author}`);
                }
                return next;
            });

            addToast('Verwijderd uit favorieten', 'info');
        } else {
            console.error('Error removing favorite:', result.error);
            addToast('Kon favoriet niet verwijderen', 'error');
        }
        return result;
    }, [user, favoritePoems, addToast]);

    const removeAuthor = useCallback(async () => {
        addToast('Deze functie komt beschikbaar in versie 2.0', 'info');
        return { success: false };
    }, [addToast]);

    return { 
        isFavorite, 
        toggleFavorite, 
        loading, 
        favoritePoems,
        favoriteAuthors: [], 
        removePoem,
        removeAuthor
    };
}
