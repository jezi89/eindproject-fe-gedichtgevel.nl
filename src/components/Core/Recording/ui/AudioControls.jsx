import React, {useContext, memo} from 'react';
import {ControlsContext} from '../context/RecordingContext.js';
import styles from './AudioControls.module.scss';
import {PlayIcon} from '../icons/PlayIcon.jsx';
import {PauseIcon} from '../icons/PauseIcon.jsx';
import {StopIcon} from '../icons/StopIcon.jsx';
import {VolumeUpIcon} from '../icons/VolumeUpIcon.jsx';
import {VolumeDownIcon} from '../icons/VolumeDownIcon.jsx';
import {MuteSoundIcon} from '../icons/MuteSoundIcon.jsx';

export const AudioControls = memo(() => {
    console.log('🔄 AudioControls re-render');
    const {
        isPlaying,
        isAudioMuted,
        recordedAudioBlob,
        handlePlayPause, // New function from context
        handleStop,      // New function from context
        handleVolumeUp,  // New function from context
        handleVolumeDown,// New function from context
        handleToggleAudioMute
    } = useContext(ControlsContext);

    // FIXED: Use recordedAudioBlob instead of getDuration() to avoid re-render loops
    const hasAudio = !!recordedAudioBlob;
    console.log('📊 hasAudio check:', hasAudio, 'recordedAudioBlob exists:', !!recordedAudioBlob);

    return (
        <div className={styles.frame}>


            <button onClick={handlePlayPause} className={`${styles.button} ${styles.playPause}`}>
                {isPlaying ? <PauseIcon/> : <PlayIcon/>}
            </button>
            <button onClick={handleStop} className={styles.button}>
                <StopIcon/>
            </button>
            <button onClick={handleVolumeDown} className={styles.button}>
                <VolumeDownIcon/>
            </button>

            <button onClick={handleVolumeUp} className={styles.button}>
                <VolumeUpIcon/>
            </button>
            {hasAudio && (
                <button onClick={handleToggleAudioMute} className={styles.button}>
                    <MuteSoundIcon isMuted={isAudioMuted}/>
                </button>
            )}

        </div>
    );
});