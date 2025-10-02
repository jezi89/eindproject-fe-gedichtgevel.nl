import {useRef, useState} from 'react';
import {useCanvasStorage} from '@/hooks/canvas/useCanvasStorage.js';
import {useAuth} from '@/hooks/auth/useAuth.js';
import {useNavigate} from 'react-router';
import styles from './SaveDesignButton.module.scss';

export function SaveDesignButton({poemData, canvasState, currentDesignId = null}) {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {save, isLoading} = useCanvasStorage();
    const [showModal, setShowModal] = useState(false);
    const [designTitle, setDesignTitle] = useState('');
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const saveInProgressRef = useRef(false); // Prevent double-click

    const handleSaveClick = () => {
        if (!user) {
            // Redirect to login
            navigate('/login');
            return;
        }

        // Show modal to ask for title
        setShowModal(true);
        setDesignTitle(poemData?.title || '');
    };

    const handleConfirmSave = async () => {
        // Prevent double-click
        if (saveInProgressRef.current) {
            console.log('⚠️ Save already in progress, ignoring click');
            return;
        }

        if (!designTitle.trim()) {
            setSaveStatus('error');
            return;
        }

        saveInProgressRef.current = true;

        const result = await save(poemData, canvasState, designTitle.trim(), currentDesignId);

        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => {
                setShowModal(false);
                setSaveStatus(null);
                setDesignTitle('');
                saveInProgressRef.current = false;
            }, 1500);
        } else {
            setSaveStatus('error');
            saveInProgressRef.current = false;
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setSaveStatus(null);
        setDesignTitle('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleConfirmSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Check if user is logged in to determine button state
    const isDisabled = isLoading || !user;
    const buttonTitle = !user ? 'Log in om op te slaan' : 'Design opslaan';

    return (
        <>
            <button
                onClick={handleSaveClick}
                className={`${styles.saveButton} ${!user ? styles.disabled : ''}`}
                disabled={isDisabled}
                title={buttonTitle}
            >
                {isLoading ? '💾 Bezig...' : currentDesignId ? '💾 Bijwerken' : '💾 Opslaan'}
            </button>

            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCancel}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>{currentDesignId ? 'Design bijwerken' : 'Design opslaan'}</h3>

                        <div className={styles.formGroup}>
                            <label htmlFor="designTitle">Titel voor dit design:</label>
                            <input
                                id="designTitle"
                                type="text"
                                value={designTitle}
                                onChange={(e) => setDesignTitle(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Bijv: Mijn gedichtgevel"
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>

                        {saveStatus === 'success' && (
                            <div className={styles.success}>
                                ✓ Design succesvol opgeslagen!
                            </div>
                        )}

                        {saveStatus === 'error' && (
                            <div className={styles.error}>
                                ✗ Er ging iets mis. Probeer het opnieuw.
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                onClick={handleCancel}
                                className={styles.cancelBtn}
                                disabled={isLoading || saveStatus === 'success'}
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                className={styles.confirmBtn}
                                disabled={isLoading || !designTitle.trim() || saveStatus === 'success'}
                            >
                                {isLoading ? 'Bezig...' : currentDesignId ? 'Bijwerken' : 'Opslaan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
