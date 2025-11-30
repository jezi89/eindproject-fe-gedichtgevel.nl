
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase/supabase.js';

const DAILY_POEMS_KEY = 'daily-poems-session';

/**
 * Hook to manage fetching and re-fetching daily street poems.
 * Caches the poems in sessionStorage to maintain consistency during a session.
 */
export const useDailyPoems = () => {
    const [dailyPoems, setDailyPoems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDailyStreetPoems = useCallback(async () => {
        setIsLoading(true);
        try {
            // Check for cached poems first, unless a refetch is forced (by clearing the cache before calling)
            const cachedPoems = sessionStorage.getItem(DAILY_POEMS_KEY);
            if (cachedPoems) {
                const parsed = JSON.parse(cachedPoems);
                setDailyPoems(parsed);
                setIsLoading(false);
                return;
            }

            // If no cache, fetch new random poems
            const { data, error } = await supabase.rpc('get_random_poems_by_source', {
                source_name: 'straatpoezie_nl'
            });

            if (error) {
                console.error('Fout bij het ophalen van de straatgedichten:', error);
                setIsLoading(false);
                return;
            }

            // Transform data to include lines and preserve original content
            const transformedData = data.map(poem => {
                let lines = [];
                if (poem.content) {
                    lines = poem.content.split(/<br\s*\/?>/i).map(line => line.trim());
                }
                return {
                    ...poem,
                    lines: lines,
                    originalContent: poem.content
                };
            });

            // Cache the new poems in sessionStorage
            sessionStorage.setItem(DAILY_POEMS_KEY, JSON.stringify(transformedData));
            setDailyPoems(transformedData);
        } catch (err) {
            console.error('Onverwachte fout bij ophalen gedichten:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchDailyStreetPoems();
    }, [fetchDailyStreetPoems]);

    // Function to manually trigger a refetch
    const refetchDailyPoems = useCallback(async () => {
        // Clear the cache to force a new fetch
        sessionStorage.removeItem(DAILY_POEMS_KEY);
        // Call the fetch function again
        await fetchDailyStreetPoems();
    }, [fetchDailyStreetPoems]);

    return { dailyPoems, isLoading, refetchDailyPoems };
};
