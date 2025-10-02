/**
 * MonthlyPoems Component
 *
 * Displays exactly 3 featured poems of the month using PoemResultItem functionality
 * Compact grid layout without carousel/navigation features
 */

import {useState} from 'react';
import {useNavigate} from 'react-router';
import PoemResultItem from '@/components/poem/PoemResultItem.jsx';
import {calculateCollapseScroll} from '@/utils/poemHeightCalculator';
import searchContextService from '@/services/context/searchContextService';
import styles from './MonthlyPoems.module.scss';

// Sample monthly poems data - exactly 3 poems
const MONTHLY_POEMS = [
    {
        title: "De Wind",
        author: "Herman Gorter",
        lines: [
            "De wind waait door de bomen",
            "En zingt zijn oude lied",
            "Van dagen die voorbij zijn",
            "En tijd die nimmer vliedt",
            "Hij fluistert van de verten",
            "Waar dromen worden waar"
        ]
    },
    {
        title: "Avondlied",
        author: "Guido Gezelle",
        lines: [
            "De dag gaat heen, de nacht komt aan",
            "De sterren aan de hemel staan",
            "Als lampjes in de duisternis",
            "Die ons de weg naar huis verwijst",
            "O stille nacht, zo vol van rust"
        ]
    },
    {
        title: "Lentemorgen",
        author: "J.H. Leopold",
        lines: [
            "Een lentemorgen lacht en zingt",
            "Door alle takken heen",
            "Het jonge groen dat opwaarts dringt",
            "Uit aarde, zacht en reen",
            "De bloesems open hun hart wijd",
            "Voor zon en wind en tijd"
        ]
    }
];

const MonthlyPoems = () => {
    const navigate = useNavigate();

    // Simple state for 3 poems only
    const [poemStates, setPoemStates] = useState({
        0: {phase: 'idle', expanded: false},
        1: {phase: 'idle', expanded: false},
        2: {phase: 'idle', expanded: false}
    });

    const handlePoemStateChange = (index, updates) => {
        setPoemStates(prev => ({
            ...prev,
            [index]: {...prev[index], ...updates}
        }));
    };

    // Handle recording page navigation (Declameer button)
    const handleNavigateToRecording = async (poemData) => {
        if (!poemData) return;

        try {
            console.log('🎤 MonthlyPoems: Navigating to Spreekgevel with poem:', poemData.title);

            // Save poem to SearchContext for retrieval on recording page
            await searchContextService.saveSelectedPoem(poemData);

            // Navigate to recording page
            navigate('/spreekgevel');
        } catch (error) {
            console.error('❌ Failed to navigate to recording page:', error);
            // Fallback: navigate anyway
            navigate('/spreekgevel');
        }
    };

    // TODO MonthlyPoems omzetten naar een systeem dat favorieten ranked en de 3 meest gelikte van die maand gedichten toont
    // Custom collapse event for monthly poems - return true to skip default scroll
    const handleMonthlyCollapseEvent = () => {
        // Direct scroll naar eerste monthly poem card
        setTimeout(() => {
            let targetElement = document.getElementById('first-monthly-poem');
            if (!targetElement) {
                targetElement = document.getElementById('monthly-poems-grid');
            }

            if (targetElement) {
                const elementRect = targetElement.getBoundingClientRect();
                const currentScrollY = window.scrollY;
                const elementTop = elementRect.top + currentScrollY;
                const targetScrollY = Math.max(0, elementTop - 80);

                console.log('Monthly collapse scroll to:', {
                    target: targetElement.id || 'monthly-poems-grid',
                    currentScrollY,
                    elementTop,
                    targetScrollY
                });

                if (Math.abs(targetScrollY - currentScrollY) > 50) {
                    window.scrollTo({
                        top: targetScrollY,
                        behavior: 'smooth'
                    });
                }
            }
        }, 300);

        // Return true om default search scroll te skippen
        return true;
    };

    return (
        <section className={styles.monthlyPoemsSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Staartgedichten van de Dag</h2>
                <p className={styles.sectionSubtitle}>Ontdek onze dagelijks wisseledende curatie van daadwerkelijk Nederlandse straatpoezie</p>
            </div>

            <div className={styles.poemsGrid} id="monthly-poems-grid">
                {MONTHLY_POEMS.map((poem, index) => (
                    <div
                        key={`monthly-${index}`}
                        className={styles.monthlyPoemCard}
                        id={index === 0 ? 'first-monthly-poem' : undefined}
                    >
                        <PoemResultItem
                            poem={poem}
                            index={index}
                            allPoems={null} // No carousel - single poems only
                            navigationDirection="initial"
                            poemState={poemStates[index]}
                            onPoemStateChange={handlePoemStateChange}
                            preCalculatedHeight={null}
                            canvasMode={false}
                            onPoemSelect={() => {
                            }} // Not needed for monthly
                            onLoadInCanvas={() => {
                            }} // Will show canvas button
                            onNavigateToCanvas={() => {
                            }} // Will show canvas button
                            onNavigateToRecording={() => handleNavigateToRecording(poem)}
                            onCollapseEvent={handleMonthlyCollapseEvent}
                            displayMode="monthly" // Special mode for monthly display
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MonthlyPoems;