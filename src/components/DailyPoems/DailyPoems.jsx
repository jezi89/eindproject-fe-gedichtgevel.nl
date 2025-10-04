/**
 * DailyPoems Component
 *
 * Displays 3 random street poems using the useDailyPoems hook and renders them with SearchResults.
 */

import { useNavigate } from 'react-router';
import { SearchResults } from '@/components/search/SearchResults.jsx';
import { CanvasDataService } from '@/services/canvas/canvasDataService.js';
import { useDailyPoems } from '@/context/poem/DailyPoemsContext.jsx';

export const DailyPoems = () => {
    const navigate = useNavigate();
    const { dailyPoems, isLoading } = useDailyPoems();

    const handleNavigateToCanvas = (poemData) => {
        if (!poemData || !poemData.id) return;

        try {
            // Standardize and store the data for the canvas
            const standardizedPoem = CanvasDataService.storePoemForCanvas(poemData);

            // Navigate to the canvas with the poem ID
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

    // A simple loading state could be added here if desired
    if (isLoading || !dailyPoems || dailyPoems.length === 0) {
        return null; // Or a loading skeleton
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
