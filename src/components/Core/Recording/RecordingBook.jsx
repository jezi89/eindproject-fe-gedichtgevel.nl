import React, {useRef, useState, useContext, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router';
import {AltSearchBar} from './ui/AltSearchBar';
import {AudioControls} from './ui/AudioControls';
import {TopNavigation} from './layout/TopNavigation';
import {SpiralBook} from './icons/SpiralBook';
import layoutStyles from '@/pages/Audio/AudioPage.module.scss';
import componentStyles from './RecordingPage.module.scss';
import {ControlsContext, TimeContext, CountdownContext} from './context/RecordingContext';
import {useRecording} from '../../../hooks/record/useWaveSurfer.js';
import {useRecordingStorage} from '../../../hooks/record/useRecordingStorage.js';
import {useSearchPoems} from '../../../hooks/search/useSearchPoems.js';
import {SearchResults} from '../../search/SearchResults';
import HighlightIcon from './icons/Higlight-icon.svg?react';
import DownArrowIcon from './icons/Down-arrow-icon.svg?react';
import {MicOnIcon} from './icons/MicOnIcon.jsx';
import {CanvasDataService} from '@/services/canvas/canvasDataService.js';

// Instruction text to show before any poem is selected
const INSTRUCTION_POEM = {
    title: 'Geen gedicht geladen',
    author: '',
    lines: [
        'Gebruik de zoekbalk hierboven of',
        'zoek uitgebreid op de homepage',
        'en klik op "Declameer!"'
    ],
    isInstruction: true
};

// Helper to format time from milliseconds to MM:SS (like imperative example)
const formatRecordingTime = (timeInMs) => {
    const minutes = Math.floor((timeInMs % 3600000) / 60000); // minutes
    const secs = Math.floor((timeInMs % 60000) / 1000); // seconds
    return [minutes, secs]
        .map((v) => (v < 10 ? '0' + v : v))
        .join(':');
};

// Timer display component that uses direct DOM updates for recording time
const TimerDisplay = () => {
    const {isRecording, subscribeToTimer} = useContext(ControlsContext);
    const {currentTime} = useContext(TimeContext);
    const displayRef = useRef(null);

    useEffect(() => {
        if (!isRecording || !subscribeToTimer) return;

        // Subscribe to timer updates and update DOM directly (no re-renders!)
        const unsubscribe = subscribeToTimer((timeInMs) => {
            const displayElement = displayRef.current;
            if (displayElement) {
                const formatted = formatRecordingTime(timeInMs);
                displayElement.textContent = `🔴 ${formatted}`;
            }
        });

        return () => {
            unsubscribe();
        };
    }, [isRecording, subscribeToTimer]);

    return (
        <div ref={displayRef}>
            {isRecording ? '🔴 00:00' : currentTime}
        </div>
    );
};

// A new component for the record button that consumes the countdown context
const RecordButton = () => {
    const {isRecording, handleRecordClick} = useContext(ControlsContext);
    const {isCountdownActive, countdownValue} = useContext(CountdownContext);

    return (
        <button
            className={`${componentStyles.RecordButton} ${isRecording ? componentStyles.recording : ''} ${isCountdownActive ? componentStyles.countdown : ''}`}
            onClick={handleRecordClick}
        >
            <div className={componentStyles.RecordButton_inner}/>
            {isCountdownActive && countdownValue && (
                <div className={componentStyles.CountdownOverlay}>
                    {countdownValue}
                </div>
            )}
        </button>
    );
};


export function RecordingBook() {
    const waveformRef = useRef(null);
    const timelineRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Geselecteerd Gedicht');
    const [selectedPoem, setSelectedPoem] = useState(INSTRUCTION_POEM);
    const [showOverlay, setShowOverlay] = useState(false);
    const storage = useRecordingStorage();

    // Search hook
    const { 
        searchTerm, 
        updateSearchTerm, 
        results, 
        loading: searchLoading, 
        handleSearch: searchPoems 
    } = useSearchPoems();

    // All complex logic is now in the custom hook, split into three state objects
    const {timeState, controlsState, countdownState} = useRecording(waveformRef, timelineRef);

    // Auto-scroll refs
    const poemContentRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const scrollAccumulatorRef = useRef(0);
    const scrollSpeedRef = useRef(3); // Ref for immediate access in loop
    
    // State
    const [isAutoScrollArmed, setIsAutoScrollArmed] = useState(false); // "Ready" state
    const [isActuallyScrolling, setIsActuallyScrolling] = useState(false); // Active state
    const [scrollSpeed, setScrollSpeed] = useState(3);

    // Sync state to ref for animation loop
    useEffect(() => {
        scrollSpeedRef.current = scrollSpeed;
    }, [scrollSpeed]);

    // Load poem from navigation state on mount
    useEffect(() => {
        try {
            const savedPoem = location.state?.selectedPoem;
            if (savedPoem) {
                const standardized = CanvasDataService.standardizePoemData(savedPoem);
                setSelectedPoem(standardized);
            }
        } catch (error) {
            console.error('Failed to load poem from navigation state:', error);
        }
    }, [location.state]);

    const handlePoemSelect = (poem) => {
        if (poem) {
            const standardized = CanvasDataService.standardizePoemData(poem);
            setSelectedPoem(standardized);
            setShowOverlay(false);
        } else {
            // No results found
            setSelectedPoem({
                title: 'Geen resultaat',
                author: '',
                lines: ['Probeer andere zoektermen...'],
                isNoResult: true
            });
        }
    };

    const handleManualSearch = () => {
        searchPoems();
        setShowOverlay(true);
    };

    const handleSearchStart = () => {
        // Clear instruction text when search starts
        if (selectedPoem?.isInstruction) {
            setSelectedPoem(null);
        }
    };

    const handleSaveRecording = async () => {
        if (controlsState.recordedAudioBlob) {
            try {
                await storage.saveRecording(controlsState.recordedAudioBlob, {
                    title: selectedPoem?.title || 'Naamloze Opname',
                    author: selectedPoem?.author || 'Onbekend',
                    duration: 0 // You might want to calculate this
                });
                alert("Opname opgeslagen in 'Mijn Opnames'!");
                setActiveTab('Beluister Opnames');
            } catch (e) {
                alert("Fout bij opslaan: " + e.message);
            }
        }
    };

    const handleComingSoon = () => {
        alert("Binnenkort beschikbaar (v2)");
    };

    // --- Auto-scroll Logic ---

    // Speed levels in pixels per second
    // Level 1: 3px/s (Very slow, for deep reading)
    // Level 2: 5.0px/s
    // Level 3: 8.0px/s (Moderate)
    // Level 4: 12.0px/s
    // Level 5: 16.0px/s (Fast)
    const SPEED_LEVELS_PX_PER_SEC = [3, 5, 8, 12, 16];

    // Toggle "Armed" state
    const toggleAutoScrollArm = () => {
        setIsAutoScrollArmed(prev => !prev);
    };

    // Start the actual scrolling loop
    const startScrollingLoop = () => {
        const element = poemContentRef.current;
        if (!element) return;

        setIsActuallyScrolling(true);
        scrollAccumulatorRef.current = 0;
        let lastFrameTime = performance.now();

        const scrollStep = (currentTime) => {
            if (!element) return;
            
            // Calculate delta time in seconds
            const deltaTime = (currentTime - lastFrameTime) / 1000;
            lastFrameTime = currentTime;

            // Check if we've reached the bottom
            if (Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight) {
                stopScrollingLoop(); // Just stop the loop, don't disarm
                return;
            }
            
            // Get target speed in pixels per second
            const speedIndex = scrollSpeedRef.current - 1; // 1-based to 0-based
            const targetSpeed = SPEED_LEVELS_PX_PER_SEC[speedIndex] || SPEED_LEVELS_PX_PER_SEC[2]; // Default to speed 3 if out of bounds

            // Calculate pixels to move this frame
            const pixelsToMove = targetSpeed * deltaTime;

            scrollAccumulatorRef.current += pixelsToMove;

            if (scrollAccumulatorRef.current >= 1) {
                const pixelsToScroll = Math.floor(scrollAccumulatorRef.current);
                element.scrollTop += pixelsToScroll;
                scrollAccumulatorRef.current -= pixelsToScroll;
            }
            
            scrollIntervalRef.current = requestAnimationFrame(scrollStep);
        };
        scrollIntervalRef.current = requestAnimationFrame(scrollStep);
    };

    const stopScrollingLoop = () => {
        if (scrollIntervalRef.current) {
            cancelAnimationFrame(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
        setIsActuallyScrolling(false);
    };

    // Watch for Recording State Changes
    useEffect(() => {
        let startTimeout;

        if (controlsState.isRecording) {
            // Recording started!
            if (isAutoScrollArmed) {
                // Wait 3 seconds before starting scroll
                startTimeout = setTimeout(() => {
                    startScrollingLoop();
                }, 3000);
            }
        } else {
            // Recording stopped or hasn't started
            stopScrollingLoop();
            
            // Reset scroll to top if we were recording
            if (poemContentRef.current) {
                 // Smooth scroll back to top
                 poemContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        return () => {
            if (startTimeout) clearTimeout(startTimeout);
            stopScrollingLoop();
        };
    }, [controlsState.isRecording, isAutoScrollArmed]); // Re-run if recording state or armed state changes

    // Clean up on unmount
    useEffect(() => {
        return () => stopScrollingLoop();
    }, []);

    return (
        <ControlsContext.Provider value={controlsState}>
            <TimeContext.Provider value={timeState}>
                <CountdownContext.Provider value={countdownState}>
                    <div className={layoutStyles.SpreekgevelApp}>
                        <div className={layoutStyles.MainContent}>
                            <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab}/>
                            <div className={componentStyles.BookContainer}>
                                <SpiralBook className={componentStyles.SpiralBinding}/>

                                {showOverlay && (
                                    <div className={componentStyles.SearchResultsOverlay}>
                                        <div className={componentStyles.OverlayHeader}>
                                            <div style={{display: 'flex', alignItems: 'baseline', gap: '1rem'}}>
                                                <h3>Zoekresultaten</h3>
                                                <span style={{fontSize: '0.9rem', color: '#666'}}>
                                                    {results.length} {results.length === 1 ? 'gedicht' : 'gedichten'} gevonden
                                                </span>
                                            </div>
                                            <button 
                                                className={componentStyles.CloseOverlayButton}
                                                onClick={() => setShowOverlay(false)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {results.length > 0 ? (
                                            <SearchResults 
                                                results={results}
                                                layoutMode="search"
                                                cardSize="compact"
                                                showGlobalToggle={false}
                                                onPoemSelect={handlePoemSelect}
                                                isOverlay={true}
                                                ResultsOverviewComponent={null}
                                                onNavigateToRecording={handlePoemSelect}
                                                onNavigateToCanvas={(poem) => {
                                                    navigate('/designgevel', { state: { selectedPoem: poem } });
                                                }}
                                            />
                                        ) : (
                                            <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
                                                <p>Geen gedichten gevonden voor "{searchTerm}".</p>
                                                <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>Probeer een andere zoekterm.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={`${componentStyles.PagePanel} ${componentStyles.RecordingPanel}`}>
                                    {/* Container for mic selection dropdown */}
                                    <div className={componentStyles.micSelectWrapper} onClick={controlsState.requestMicPermission}>
                                        <label htmlFor="mic-select">Kies microfoon:</label>
                                        {controlsState.micDevices.length > 0 ? (
                                            <select
                                                id="mic-select"
                                                className={componentStyles.micSelect}
                                                value={controlsState.selectedMicDeviceId}
                                                onChange={(e) => controlsState.handleSelectMic(e.target.value)}
                                                disabled={controlsState.isRecording || controlsState.isCountdownActive}
                                                title={controlsState.isRecording ? "Kan niet wisselen tijdens opname" : "Kies een microfoon"}
                                            >
                                                {controlsState.micDevices.map(device => (
                                                    <option key={device.deviceId} value={device.deviceId}>
                                                        {device.label || device.deviceId}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={componentStyles.micPlaceholder}>
                                                <strong style={{color: '#d09a47', cursor: 'pointer'}}>Klik hier</strong> om microfoons te laden...
                                            </span>
                                        )}
                                        {/* Display error messages */}
                                        {controlsState.error && <p className={componentStyles.errorMessage}>{controlsState.error}</p>}
                                    </div>
                                    <div className={componentStyles.micContainer}>
                                        {controlsState.isRecording && <MicOnIcon/>}
                                    </div>
                                    <h2 className={componentStyles.PageTitle}>Opnemen</h2>


                                    {/* Use the new RecordButton component */}
                                    <RecordButton/>

                                    <div className={componentStyles.waveformWrapper}>
                                        <div ref={waveformRef} className={componentStyles.waveform}></div>
                                        <div ref={timelineRef} className={componentStyles.timelineContainer}></div>
                                    </div>

                                    <div className={componentStyles.TimeDisplay}>
                                        <TimerDisplay/>
                                    </div>
                                    <div className={componentStyles.AudioControlsSection}>
                                        <AudioControls/>
                                    </div>

                                    <div className={componentStyles.SaveButtonSection}>
                                        <button
                                            className={componentStyles.SaveButton}
                                            onClick={handleSaveRecording}
                                            disabled={!controlsState.recordedAudioBlob}
                                            title={controlsState.recordedAudioBlob ? 'Sla opname op in browser' : 'Geen opname beschikbaar'}
                                        >
                                            {controlsState.recordedAudioBlob ? '💾 OPSLAAN' : 'GEEN OPNAME'}
                                        </button>
                                    </div>
                                </div>

                                <div className={`${componentStyles.PagePanel} ${componentStyles.PoemPanel}`}>
                                    {activeTab === 'Beluister Opnames' ? (
                                        <div className={componentStyles.PoemPanel_content}>
                                            <h2 className={componentStyles.PoemPanel_title}>Mijn Opnames</h2>
                                            {storage.recordings.length === 0 ? (
                                                <p>Hier komen jouw opgeslagen opnames te staan.</p>
                                            ) : (
                                                <ul style={{listStyle: 'none', padding: 0, width: '100%', overflowY: 'auto', maxHeight: '400px'}}>
                                                    {storage.recordings.map(rec => (
                                                        <li key={rec.id} style={{marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem'}}>
                                                            <div style={{fontWeight: 'bold'}}>{rec.title}</div>
                                                            <div style={{fontSize: '0.8rem', color: '#666'}}>{new Date(rec.date).toLocaleString()}</div>
                                                            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem'}}>
                                                                <audio controls src={URL.createObjectURL(rec.blob)} style={{height: '40px', width: '100%', maxWidth: '350px'}} />
                                                                <button onClick={() => storage.deleteRecording(rec.id)} style={{background: 'red', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className={componentStyles.SearchSection}>
                                                <AltSearchBar 
                                                    searchTerm={searchTerm}
                                                    onSearchTermChange={updateSearchTerm}
                                                    onSearch={handleManualSearch}
                                                    loading={searchLoading}
                                                />
                                            </div>
                                            
                                            <div className={componentStyles.PoemPanel_header}>
                                                <h2 className={componentStyles.PoemPanel_title}>
                                                    {selectedPoem?.title || INSTRUCTION_POEM.title}
                                                </h2>
                                                {selectedPoem?.author && (
                                                    <p className={componentStyles.PoemPanel_author}>
                                                        door {selectedPoem.author}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={componentStyles.PoemPanel_content} ref={poemContentRef}>
                                                {(selectedPoem?.lines || INSTRUCTION_POEM.lines)?.map((line, i) => (
                                                    <React.Fragment key={i}>
                                                        {line}<br/>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className={componentStyles.BottomButtonWrapper}>
                                                <button className={componentStyles.BrowseButton} onClick={handleComingSoon}>
                                                    <span>Klik voor text highlight</span>
                                                    <HighlightIcon className={componentStyles.ButtonIcon}/>
                                                </button>
                                                
                                                <div className={componentStyles.AutoScrollContainer}>
                                                    {/* Speed Controls - Moved ABOVE button */}
                                                    <div className={componentStyles.SpeedControl}>
                                                        <span className={componentStyles.SpeedLabel}>Snelheid:</span>
                                                        <div className={componentStyles.SpeedButtons}>
                                                            {[1, 2, 3, 4, 5].map(speed => (
                                                                <button 
                                                                    key={speed}
                                                                    className={`${componentStyles.SpeedBtn} ${scrollSpeed === speed ? componentStyles.active : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setScrollSpeed(speed);
                                                                    }}
                                                                    title={`Snelheid ${speed}`}
                                                                >
                                                                    {speed}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button 
                                                        className={componentStyles.ListenButton} 
                                                        onClick={toggleAutoScrollArm}
                                                        style={{
                                                            backgroundColor: isAutoScrollArmed ? '#e6b85c' : undefined,
                                                            borderColor: isAutoScrollArmed ? '#c29a4b' : undefined
                                                        }}
                                                        title="Activeer om automatisch te scrollen tijdens opname"
                                                    >
                                                        <span>
                                                            {isAutoScrollArmed 
                                                                ? (isActuallyScrolling ? 'Aan het scrollen...' : 'Auto-scroll GEREED') 
                                                                : 'Activeer Auto-scroll'}
                                                        </span>
                                                        <DownArrowIcon className={componentStyles.ButtonIcon}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CountdownContext.Provider>
            </TimeContext.Provider>
        </ControlsContext.Provider>
    );
}
