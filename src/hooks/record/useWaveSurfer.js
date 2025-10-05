import {useState, useEffect, useCallback, useRef, useMemo} from 'react';
import {useWavesurfer} from '@wavesurfer/react';
import RecordPlugin from 'wavesurfer.js/plugins/record';
import Timeline from 'wavesurfer.js/plugins/timeline';
import {useAuth} from "@/hooks/auth/useAuth";

// Helper to format time from seconds to MM:SS:CS
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
};

export const useRecording = (containerRef) => {
    const { user } = useAuth();
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState('00:00:00');
    const [recordingTime, setRecordingTime] = useState(0);
    const [timeWarning, setTimeWarning] = useState('');
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
    const [isTimelineVisible, setIsTimelineVisible] = useState(false);
    const [countdownValue, setCountdownValue] = useState(null);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [micDevices, setMicDevices] = useState([]);
    const [selectedMicDeviceId, setSelectedMicDeviceId] = useState('');
    const [error, setError] = useState(null);
    const recordingTimeRef = useRef(0);
    const recordingIntervalRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const recordingStartTime = useRef(0);
    const timelinePluginRef = useRef(null);
    const timerSubscribers = useRef(new Set());


    // Create a memoized canvas gradient for the recorded waveform
    const gradient = useMemo(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 250); // Matches waveform height
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        return grad;
    }, []);

    // Memoize the plugins array to prevent re-creation on every render
    // Only include RecordPlugin - Timeline will be added dynamically
    const plugins = useMemo(() => {
        return [
            RecordPlugin.create({scrollingWaveform: false, renderRecordedAudio: true}),
        ];
    }, []);

    // Use the official @wavesurfer/react hook with declarative plugins
    const {wavesurfer, isReady: isWaveformReady} = useWavesurfer({
        container: containerRef,
        waveColor: '#000000',
        progressColor: '#d09a47',
        height: 250,
        barWidth: 5,
        barRadius: 2,
        interact: true,
        hideScrollbar: true,
        scrollParent: false,
        plugins: plugins
    });

    // New function to request permissions and load devices
    const requestMicPermission = useCallback(async () => {
        setError(null);
        try {
            // Request permission - this triggers the browser prompt
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // If permission is granted, get the devices
            const devices = await RecordPlugin.getAvailableAudioDevices();
            setMicDevices(devices);
            if (devices.length > 0 && !selectedMicDeviceId) {
                setSelectedMicDeviceId(devices[0].deviceId);
            }
        } catch (err) {
            console.error("Error requesting mic permission:", err);
            setError("Microfoontoegang is geweigerd. Sta toegang toe in je browserinstellingen.");
        }
    }, [selectedMicDeviceId]);


    // Effect to attach event listeners
    useEffect(() => {
        if (!wavesurfer) return;

        const record = wavesurfer.getActivePlugins().find(p => p instanceof RecordPlugin);
        if (!record) {
            console.error('❌ RecordPlugin not found in active plugins!');
            return;
        }

        const unsubscribe = [
            wavesurfer.on('play', () => setIsPlaying(true)),
            wavesurfer.on('pause', () => setIsPlaying(false)),
            wavesurfer.on('timeupdate', (time) => setCurrentTime(formatTime(time))),
            record.on('record-start', () => {
                recordingTimeRef.current = 0;
                setRecordingTime(0);
                setTimeWarning(''); // Reset warning on new recording
                setIsRecording(true);
                setIsTimelineVisible(false);

                // Store the start time using performance.now()
                recordingStartTime.current = performance.now();

                wavesurfer.setOptions({
                    barWidth: 5,
                    waveColor: '#000000',
                    hideScrollbar: true,
                    scrollParent: false
                });

                // Destroy timeline plugin during recording (after setOptions)
                setTimeout(() => {
                    if (timelinePluginRef.current) {
                        timelinePluginRef.current.destroy();
                        timelinePluginRef.current = null;
                    }
                }, 0);

                // Start interval for recording timer using performance.now()
                recordingIntervalRef.current = setInterval(() => {
                    const elapsedMs = performance.now() - recordingStartTime.current;
                    const elapsedSeconds = elapsedMs / 1000;
                    recordingTimeRef.current = elapsedMs;

                    // Enforce recording limits
                    const maxRecordingTime = user ? 90 : 60; // 90s for logged-in, 60s for anonymous

                    if (elapsedSeconds >= maxRecordingTime) {
                        const recordPlugin = wavesurfer?.getActivePlugins().find(p => p instanceof RecordPlugin);
                        if (recordPlugin?.isRecording()) {
                            recordPlugin.stopRecording();
                        }
                    }

                    // Show warning for anonymous users at 30 seconds
                    if (!user && Math.floor(elapsedSeconds) === 30) {
                        setTimeWarning('U heeft nog 30 seconden opnametijd.');
                    }


                    // Only notify subscribers - NO state update to avoid re-renders!
                    timerSubscribers.current.forEach(callback => callback(elapsedMs));
                }, 100); // Update every 100ms
            }),
        ];

        const endUnsubscribe = record.on('record-end', (blob) => {

            // Clear the recording timer interval
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }

            setTimeWarning(''); // Clear any existing warnings
            setRecordedAudioBlob(blob);
            setIsRecording(false);
            setIsTimelineVisible(true);

            const onReady = () => {
                wavesurfer.setOptions({
                    barWidth: null,
                    waveColor: gradient,
                    minPxPerSec: 100,
                    hideScrollbar: false,
                    scrollParent: true
                });

                // Register timeline plugin after recording ends (no separate container)
                if (!timelinePluginRef.current) {
                    timelinePluginRef.current = wavesurfer.registerPlugin(Timeline.create({
                        height: 20,
                        timeInterval: 0.2,
                        primaryLabelInterval: 5,
                        secondaryLabelInterval: 1,
                        style: {
                            fontSize: '12px',
                            color: '#333'
                        }
                    }));
                }
            };
            wavesurfer.once('ready', onReady);
        });
        unsubscribe.push(endUnsubscribe);

        return () => {
            unsubscribe.forEach((fn) => fn?.());
            // Clear recording timer interval on cleanup
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            // Clear countdown interval on cleanup
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
    }, [wavesurfer, gradient]);


    // Countdown function that starts mic, counts down, then starts recording
    const startCountdownRecording = useCallback(async (record) => {
        try {
            setIsCountdownActive(true);
            setCountdownValue(3);
            await record.startMic({deviceId: selectedMicDeviceId});
            let countdown = 3;
            countdownIntervalRef.current = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    setCountdownValue(countdown);
                } else {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                    setIsCountdownActive(false);
                    setCountdownValue(null);
                    record.startRecording({ audioBitsPerSecond: 160000 }).catch(e => console.error('Error starting recording after countdown:', e));
                }
            }, 1000);
        } catch (error) {
            console.error('Error starting microphone:', error);
            setError("Kon de microfoon niet starten. Controleer of een ander programma het niet gebruikt.");
            setIsCountdownActive(false);
            setCountdownValue(null);
        }
    }, [selectedMicDeviceId]);

    const handleRecordClick = useCallback(() => {
        // Requirement A: Check if a microphone is selected
        if (!selectedMicDeviceId) {
            setError("Kies eerst een microfoon uit de lijst.");
            return;
        }

        setError(null); // Clear previous errors
        const record = wavesurfer?.getActivePlugins().find(p => p instanceof RecordPlugin);
        if (!record) return;

        if (isCountdownActive) {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            setIsCountdownActive(false);
            setCountdownValue(null);
            record.stopMic();
            return;
        }

        if (record.isRecording() || record.isPaused()) {
            record.stopRecording();
        } else {
            setRecordedAudioBlob(null);
            startCountdownRecording(record);
        }
    }, [wavesurfer, isCountdownActive, startCountdownRecording, selectedMicDeviceId]);


    const handleSelectMic = useCallback((deviceId) => {
        setSelectedMicDeviceId(deviceId);
        setError(null); // Clear error when user selects a mic
    }, []);

    const handlePlayPause = useCallback(() => wavesurfer?.playPause(), [wavesurfer]);
    const handleStop = useCallback(() => wavesurfer?.stop(), [wavesurfer]);

    const handleToggleAudioMute = useCallback(() => {
        if (!wavesurfer) return;
        const currentMuted = wavesurfer.getMuted();
        wavesurfer.setMuted(!currentMuted);
        setIsAudioMuted(!currentMuted);
    }, [wavesurfer]);

    const handleDownloadRecording = useCallback(() => {
        if (!recordedAudioBlob) return;
        const url = URL.createObjectURL(recordedAudioBlob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
        link.download = `spreekgevel-opname-${timestamp}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [recordedAudioBlob]);

    const handleZoomIn = useCallback(() => {
        if (!wavesurfer) return;
        const currentZoom = wavesurfer.options.minPxPerSec || 50;
        wavesurfer.zoom(Math.min(currentZoom * 1.5, 500));
    }, [wavesurfer]);

    const handleZoomOut = useCallback(() => {
        if (!wavesurfer) return;
        const currentZoom = wavesurfer.options.minPxPerSec || 50;
        wavesurfer.zoom(Math.max(currentZoom / 1.5, 50));
    }, [wavesurfer]);

    const handleZoomReset = useCallback(() => {
        wavesurfer?.zoom(50);
    }, [wavesurfer]);

    // Subscribe/unsubscribe pattern for timer updates
    const subscribeToTimer = useCallback((callback) => {
        timerSubscribers.current.add(callback);
        return () => timerSubscribers.current.delete(callback);
    }, []);

    const handleVolumeUp = useCallback(() => {
        if (!wavesurfer) return;
        const currentVolume = wavesurfer.getVolume();
        wavesurfer.setVolume(Math.min(currentVolume + 0.1, 1));
    }, [wavesurfer]);

    const handleVolumeDown = useCallback(() => {
        if (!wavesurfer) return;
        const currentVolume = wavesurfer.getVolume();
        wavesurfer.setVolume(Math.max(currentVolume - 0.1, 0));
    }, [wavesurfer]);

    // Memoize the time-related state separately (no recordingTime to avoid re-renders)
    const timeState = useMemo(() => ({
        currentTime,
        timeWarning,
    }), [currentTime, timeWarning]);

    // Memoize the countdown state separately
    const countdownState = useMemo(() => ({
        countdownValue,
        isCountdownActive,
    }), [countdownValue, isCountdownActive]);

    // Memoize the controls and less frequently updated state
    const controlsState = useMemo(() => ({
        isReady: isWaveformReady,
        isRecording,
        isPlaying,
        isAudioMuted,
        recordedAudioBlob,
        isTimelineVisible,
        micDevices,
        selectedMicDeviceId,
        error, // Expose the new error state
        requestMicPermission, // Expose the new permission function
        handleRecordClick,
        handleToggleAudioMute,
        handleDownloadRecording,
        handlePlayPause,
        handleStop,
        handleZoomIn,
        handleZoomOut,
        handleZoomReset,
        handleVolumeUp,
        handleVolumeDown,
        handleSelectMic,
        subscribeToTimer,
        recordingTimeRef,
    }), [
        isWaveformReady, isRecording, isPlaying, isAudioMuted, recordedAudioBlob, isTimelineVisible, micDevices, selectedMicDeviceId, error,
        requestMicPermission, handleRecordClick, handleToggleAudioMute, handleDownloadRecording,
        handlePlayPause, handleStop, handleZoomIn, handleZoomOut, handleZoomReset, handleVolumeUp, handleVolumeDown, handleSelectMic,
        subscribeToTimer
    ]);

    return {timeState, controlsState, countdownState};
};
