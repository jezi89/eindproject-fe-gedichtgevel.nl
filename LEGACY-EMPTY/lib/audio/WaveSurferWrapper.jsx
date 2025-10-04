/**
 * WaveSurfer.js React Wrapper Component
 *
 * Provides a standardized React interface for WaveSurfer.js library
 * with consistent error handling and lifecycle management.
 *
 * @module lib/audio/WaveSurferWrapper
 */

import {useEffect, useRef, useState} from 'react';
import WaveSurfer from 'wavesurfer.js';
import styles from './WaveSurferWrapper.module.scss';

/**
 * WaveSurfer wrapper component with React lifecycle integration
 *
 * @component
 * @param {Object} props
 * @param {string} [props.audioUrl] - URL of audio file to load
 * @param {ArrayBuffer} [props.audioBuffer] - Audio buffer data
 * @param {Object} [props.options={}] - WaveSurfer configuration options
 * @param {Function} [props.onReady] - Callback when waveform is ready
 * @param {Function} [props.onPlay] - Callback when playback starts
 * @param {Function} [props.onPause] - Callback when playback pauses
 * @param {Function} [props.onFinish] - Callback when playback finishes
 * @param {Function} [props.onError] - Callback for error handling
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} WaveSurfer container with controls
 */
export function WaveSurferWrapper({
                                      audioUrl,
                                      audioBuffer,
                                      options = {},
                                      onReady,
                                      onPlay,
                                      onPause,
                                      onFinish,
                                      onError,
                                      className = ''
                                  }) {
    const containerRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    // Default WaveSurfer options with project-specific defaults
    const defaultOptions = {
        waveColor: '#d27c1b',
        progressColor: '#a85c12',
        cursorColor: '#333',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        normalize: true,
        ...options
    };

    // Initialize WaveSurfer instance
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            // Create WaveSurfer instance
            const wavesurfer = WaveSurfer.create({
                container: containerRef.current,
                ...defaultOptions
            });

            wavesurferRef.current = wavesurfer;

            // Set up event listeners
            wavesurfer.on('ready', () => {
                setIsReady(true);
                setError(null);
                onReady?.(wavesurfer);
            });

            wavesurfer.on('play', () => {
                setIsPlaying(true);
                onPlay?.(wavesurfer);
            });

            wavesurfer.on('pause', () => {
                setIsPlaying(false);
                onPause?.(wavesurfer);
            });

            wavesurfer.on('finish', () => {
                setIsPlaying(false);
                onFinish?.(wavesurfer);
            });

            wavesurfer.on('error', (err) => {
                setError(err);
                setIsReady(false);
                onError?.(err);
            });

            // Load audio if provided
            if (audioUrl) {
                wavesurfer.load(audioUrl);
            } else if (audioBuffer) {
                wavesurfer.loadBlob(audioBuffer);
            }

        } catch (err) {
            setError(err);
            onError?.(err);
        }

        // Cleanup on unmount
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, [audioUrl, audioBuffer]);

    // Public methods via ref
    const play = () => wavesurferRef.current?.play();
    const pause = () => wavesurferRef.current?.pause();
    const stop = () => wavesurferRef.current?.stop();
    const seekTo = (progress) => wavesurferRef.current?.seekTo(progress);

    return (
        <div className={`${styles.wavesurferWrapper} ${className}`}>
            {error && (
                <div className={styles.error}>
                    Audio Error: {error.message}
                </div>
            )}

            <div
                ref={containerRef}
                className={`${styles.waveformContainer} ${!isReady ? styles.loading : ''}`}
            />

            {!isReady && !error && (
                <div className={styles.loadingIndicator}>
                    Loading waveform...
                </div>
            )}
        </div>
    );
}
