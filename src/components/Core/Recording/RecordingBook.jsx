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

const formatRecordingTime = (timeInMs) => {
    const minutes = Math.floor((timeInMs % 3600000) / 60000);
    const secs = Math.floor((timeInMs % 60000) / 1000);
    return [minutes, secs]
        .map((v) => (v < 10 ? '0' + v : v))
        .join(':');
};

const TimerDisplay = () => {
    const {isRecording, subscribeToTimer} = useContext(ControlsContext);
    const {currentTime} = useContext(TimeContext);
    const displayRef = useRef(null);

    useEffect(() => {
        if (!isRecording || !subscribeToTimer) return;

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

    const {
        searchTerm,
        updateSearchTerm,
        results,
        loading: searchLoading,
        handleSearch: searchPoems
    } = useSearchPoems();

    const {timeState, controlsState, countdownState} = useRecording(waveformRef, timelineRef);

    const poemContentRef = useRef(null);
    const scrollIntervalRef = useRef(null);
    const scrollAccumulatorRef = useRef(0);
    const scrollSpeedRef = useRef(3);

    const [isAutoScrollArmed, setIsAutoScrollArmed] = useState(false);
    const [isActuallyScrolling, setIsActuallyScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(3);

    useEffect(() => {
        scrollSpeedRef.current = scrollSpeed;
    }, [scrollSpeed]);
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

    const SPEED_LEVELS_PX_PER_SEC = [3, 5, 8, 12, 16];

    const toggleAutoScrollArm = () => {
        setIsAutoScrollArmed(prev => !prev);
    };

    const startScrollingLoop = () => {
        const element = poemContentRef.current;
        if (!element) return;

        setIsActuallyScrolling(true);
        scrollAccumulatorRef.current = 0;
        let lastFrameTime = performance.now();

        const scrollStep = (currentTime) => {
            if (!element) return;

            const deltaTime = (currentTime - lastFrameTime) / 1000;
            lastFrameTime = currentTime;

            if (Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight) {
                stopScrollingLoop();
                return;
            }

            const speedIndex = scrollSpeedRef.current - 1;
            const targetSpeed = SPEED_LEVELS_PX_PER_SEC[speedIndex] || SPEED_LEVELS_PX_PER_SEC[2];

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

    useEffect(() => {
        let startTimeout;

        if (controlsState.isRecording) {
            if (isAutoScrollArmed) {
                startTimeout = setTimeout(() => {
                    startScrollingLoop();
                }, 3000);
            }
        } else {
            stopScrollingLoop();

            if (poemContentRef.current) {
                 poemContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        return () => {
            if (startTimeout) clearTimeout(startTimeout);
            stopScrollingLoop();
        };
    }, [controlsState.isRecording, isAutoScrollArmed]);

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
