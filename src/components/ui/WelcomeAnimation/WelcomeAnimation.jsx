import styles from './WelcomeAnimation.module.scss';

export function WelcomeAnimation({ videoUrl, onAnimationEnd }) {
    return (
        <div className={styles.overlay}>
            <video
                src={videoUrl}
                autoPlay
                muted
                playsInline
                onEnded={onAnimationEnd}
                className={styles.videoPlayer}
            />
            <button
                className={styles.skipButton}
                onClick={onAnimationEnd}
            >
                Animatie overslaan
            </button>
        </div>
    );
}
