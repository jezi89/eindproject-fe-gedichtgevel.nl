/**
 * DailyPoems Component
 *
 * Displays 3 random street poems from Supabase using SearchResults component
 * Poems are cached in sessionStorage for consistency during browser session
 */

import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {SearchResults} from '@/components/search/SearchResults.jsx';
import {supabase} from "@/services/supabase/supabase.js";
import {CanvasDataService} from "@/services/canvas/canvasDataService.js";

export const DailyPoems = () => {
    const navigate = useNavigate();
    const [dailyPoems, setDailyPoems] = useState([]);

    const DAILY_POEMS_KEY = 'daily-poems-session';

    useEffect(() => {
        const fetchDailyStreetPoems = async () => {
            try {
                // Check voor cached poems in sessionStorage
                const cachedPoems = sessionStorage.getItem(DAILY_POEMS_KEY);
                if (cachedPoems) {
                    const parsed = JSON.parse(cachedPoems);
                    console.log('✅ DailyPoems: Loaded from session cache');

                    // Valideer dat alle poems lines hebben
                    const validated = parsed.map(poem => {
                        if (!poem.lines || poem.lines.length === 0) {
                            console.warn('⚠️ Poem missing lines, regenerating:', poem.title);
                            return {
                                ...poem,
                                lines: poem.originalContent
                                    ? poem.originalContent.split(/<br\s*\/?>/i).map(l => l.trim())
                                    : []
                            };
                        }
                        return poem;
                    });

                    setDailyPoems(validated);
                    return;
                }

                // Haal nieuwe random poems op
                const {data, error} = await supabase.rpc('get_random_poems_by_source', {
                    source_name: 'straatpoezie_nl'
                });

                if (error) {
                    console.error('Fout bij het ophalen van de straatgedichten:', error);
                    return;
                }

                // Transform data to match component expectations
                const transformedData = data.map(poem => {
                    console.log('📝 Processing poem:', poem.title, 'content length:', poem.content?.length);

                    // Split content op <br> tags, behoud lege regels voor strofes
                    let lines = [];
                    if (poem.content) {
                        lines = poem.content
                            .split(/<br\s*\/?>/i)
                            .map(line => line.trim()); // Trim witruimte, maar behoud lege regels
                    }

                    console.log('  → Generated', lines.length, 'lines');

                    return {
                        ...poem,
                        lines: lines,
                        // Behoud location data voor AddressDisplay
                        address: poem.address,
                        location_lat: poem.location_lat,
                        location_lon: poem.location_lon,
                        // Behoud originele content voor fallback
                        originalContent: poem.content
                    };
                });

                // Sla op in sessionStorage voor consistent gedrag tijdens sessie
                sessionStorage.setItem(DAILY_POEMS_KEY, JSON.stringify(transformedData));
                console.log('✅ DailyPoems: Fetched and cached new poems');
                setDailyPoems(transformedData);
            } catch (err) {
                console.error('Onverwachte fout bij ophalen gedichten:', err);
            }
        };

        fetchDailyStreetPoems();
    }, []);

    const handleNavigateToCanvas = (poemData) => {
        if (!poemData || !poemData.id) return;

        try {
            // Standaardiseer en sla de data op in sessionStorage
            const standardizedPoem = CanvasDataService.storePoemForCanvas(poemData);

            // Navigeer naar canvas met het gedicht ID
            navigate(`/designgevel/${standardizedPoem.id}`, {
                state: {
                    selectedPoem: standardizedPoem,
                    source: 'daily'
                }
            });
        } catch (error) {
            console.error('❌ Failed to navigate to canvas:', error);
        }
    };

    const handleNavigateToRecording = (poemData) => {
        if (!poemData) return;

        try {
            console.log('🎤 DailyPoems: Navigating to Spreekgevel with poem:', poemData.title);

            // Navigate to recording page with poem data in state
            navigate('/spreekgevel', {
                state: {
                    selectedPoem: poemData,
                    source: 'daily'
                }
            });
        } catch (error) {
            console.error('❌ Failed to navigate to recording page:', error);
            navigate('/spreekgevel');
        }
    };

    // Don't render anything until poems are loaded
    if (!dailyPoems || dailyPoems.length === 0) {
        return null;
    }

    return (
        <SearchResults
            results={dailyPoems}
            layoutMode="daily"
            cardSize="compact"
            showGlobalToggle={false}
            sectionTitle="Straatgedichten van de Dag"
            sectionSubtitle="Ontdek onze dagelijks wisselende curatie van daadwerkelijke Nederlandse straatpoëzie"
            onNavigateToCanvas={handleNavigateToCanvas}
            onNavigateToRecording={handleNavigateToRecording}
            focusMode={false}
            canvasMode={false}
        />
    );
};
