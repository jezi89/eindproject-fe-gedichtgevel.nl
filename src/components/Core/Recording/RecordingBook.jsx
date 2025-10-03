import React, {useRef, useState, useContext, useEffect} from 'react';
import {useLocation} from 'react-router';
import {AltSearchBar} from './ui/AltSearchBar';
import {AudioControls} from './ui/AudioControls';
import {TopNavigation} from './layout/TopNavigation';
import {SpiralBook} from './icons/SpiralBook';
import layoutStyles from '@/pages/Audio/AudioPage.module.scss';
import componentStyles from './RecordingPage.module.scss';
import {ControlsContext, TimeContext, CountdownContext} from './context/RecordingContext';
import {useRecording} from '../../../hooks/record/useWaveSurfer.js';
import HighlightIcon from './icons/Higlight-icon.svg?react';
import DownArrowIcon from './icons/Down-arrow-icon.svg?react';
import {MicOnIcon} from './icons/MicOnIcon.jsx';

// Instruction text to show before any poem is selected
const INSTRUCTION_POEM = {
    title: 'Zoek een gedicht',
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
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Geselecteerd Gedicht');
    const [selectedPoem, setSelectedPoem] = useState(INSTRUCTION_POEM);

    // All complex logic is now in the custom hook, split into three state objects
    const {timeState, controlsState, countdownState} = useRecording(waveformRef);

    // Load poem from navigation state on mount
    useEffect(() => {
        try {
            const savedPoem = location.state?.selectedPoem;
            if (savedPoem) {
                setSelectedPoem(savedPoem);
                console.log('📚 Loaded poem from navigation state:', savedPoem);
            }
        } catch (error) {
            console.error('Failed to load poem from navigation state:', error);
        }
    }, [location.state]);

    const handlePoemSelect = (poem) => {
        if (poem) {
            setSelectedPoem(poem);
            console.log('📝 Selected poem:', poem);
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

    const handleSearchStart = () => {
        // Clear instruction text when search starts
        if (selectedPoem?.isInstruction) {
            setSelectedPoem(null);
        }
    };

    return (
        <ControlsContext.Provider value={controlsState}>
            <TimeContext.Provider value={timeState}>
                <CountdownContext.Provider value={countdownState}>
                    <div className={layoutStyles.SpreekgevelApp}>
                        <div className={layoutStyles.MainContent}>
                            <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab}/>
                            <div className={componentStyles.BookContainer}>
                                <SpiralBook className={componentStyles.SpiralBinding}/>

                                <div className={`${componentStyles.PagePanel} ${componentStyles.RecordingPanel}`}>
                                    {/* Container for mic selection dropdown */}
                                    <div className={componentStyles.micSelectWrapper} onClick={controlsState.loadMicDevices}>
                                        <label htmlFor="mic-select">Kies microfoon:</label>
                                        {controlsState.micDevices.length > 0 && (
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
                                        )}
                                    </div>
                                    <div className={componentStyles.micContainer}>
                                        {controlsState.isRecording && <MicOnIcon/>}
                                    </div>
                                    <h2 className={componentStyles.PageTitle}>Opnemen</h2>


                                    {/* Use the new RecordButton component */}
                                    <RecordButton/>

                                    <div className={componentStyles.waveformWrapper}>
                                        <div ref={waveformRef} className={componentStyles.waveform}></div>
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
                                            onClick={controlsState.handleDownloadRecording}
                                            disabled={!controlsState.recordedAudioBlob}
                                            title={controlsState.recordedAudioBlob ? 'Download opgenomen audio' : 'Geen opname beschikbaar'}
                                        >
                                            {controlsState.recordedAudioBlob ? '💾 OPSLAAN' : 'GEEN OPNAME'}
                                        </button>
                                    </div>
                                </div>

                                <div className={`${componentStyles.PagePanel} ${componentStyles.PoemPanel}`}>
                                    <div className={componentStyles.SearchSection}>
                                        <AltSearchBar onPoemSelect={handlePoemSelect} onSearchStart={handleSearchStart}/>
                                    </div>
                                    <div className={componentStyles.PoemPanel_header}>
                                        <h2 className={componentStyles.PoemPanel_title}>
                                            {selectedPoem?.title || ''}
                                        </h2>
                                        {selectedPoem?.author && (
                                            <p className={componentStyles.PoemPanel_author}>
                                                door {selectedPoem.author}
                                            </p>
                                        )}
                                    </div>
                                    <div className={componentStyles.PoemPanel_content}>
                                        {selectedPoem?.lines?.map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}<br/>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className={componentStyles.BottomButtonWrapper}>
                                        <button className={componentStyles.BrowseButton}>
                                            <span>Klik voor text highlight</span>
                                            <HighlightIcon className={componentStyles.ButtonIcon}/>
                                        </button>
                                        <button className={componentStyles.ListenButton}>
                                            <span>Klik om te auto-scrollen</span>
                                            <DownArrowIcon className={componentStyles.ButtonIcon}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CountdownContext.Provider>
            </TimeContext.Provider>
        </ControlsContext.Provider>
    );
}
