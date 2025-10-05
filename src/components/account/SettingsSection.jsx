/**
 * SettingsSection Component
 *
 * User account settings and preferences management
 * Includes profile settings, password change, and privacy controls
 *
 * @module components/account/SettingsSection
 */

import {useState} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '@/hooks/auth/useAuth';
import {useUserSettings} from '@/hooks/account/useUserSettings';
import styles from './SettingsSection.module.scss';

/**
 * SettingsSection component
 *
 * @returns {JSX.Element}
 */
export function SettingsSection() {
    const navigate = useNavigate();
    const {user, signOut} = useAuth();
    const {
        settings,
        loading,
        error,
        saveSuccess,
        updateDisplayName,
        toggleEmailNotifications,
        updateTheme,
        changePassword,
        deleteAccount,
        exportData,
        clearMessages
    } = useUserSettings();

    const [displayNameInput, setDisplayNameInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    /**
     * Handle display name update
     */
    const handleUpdateDisplayName = async (e) => {
        e.preventDefault();
        if (!displayNameInput.trim()) return;

        const result = await updateDisplayName(displayNameInput.trim());
        if (result.success) {
            setDisplayNameInput('');
        }
    };

    /**
     * Handle password change
     */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        // Validation
        if (newPassword.length < 8) {
            setPasswordError('Wachtwoord moet minimaal 8 tekens bevatten');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Wachtwoorden komen niet overeen');
            return;
        }

        const result = await changePassword(newPassword);
        if (result.success) {
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    /**
     * Handle account deletion
     */
    const handleDeleteAccount = async () => {
        const result = await deleteAccount();
        if (result.success) {
            await signOut();
            navigate('/');
        }
    };

    /**
     * Handle data export
     */
    const handleExportData = async () => {
        await exportData();
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}/>
                <p>Instellingen laden...</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsSection}>
            {/* Messages */}
            {error && (
                <div className={styles.errorMessage}>
                    <span>{error?.message || String(error) || 'Er is een fout opgetreden'}</span>
                    <button onClick={clearMessages} className={styles.closeMessage}>
                        ✕
                    </button>
                </div>
            )}

            {saveSuccess && (
                <div className={styles.successMessage}>
                    <span>✓ Wijzigingen opgeslagen</span>
                    <button onClick={clearMessages} className={styles.closeMessage}>
                        ✕
                    </button>
                </div>
            )}

            {/* Profile Settings */}
            <section className={styles.settingCard}>
                <h3 className={styles.cardTitle}>
                    <span className={styles.cardIcon}>👤</span>
                    Profielinstellingen
                </h3>

                <div className={styles.settingItem}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className={`${styles.input} ${styles.disabled}`}
                    />
                    <p className={styles.helpText}>Je email kan niet worden gewijzigd</p>
                </div>

                <form onSubmit={handleUpdateDisplayName} className={styles.settingItem}>
                    <label className={styles.label} htmlFor="displayName">
                        Weergavenaam
                    </label>
                    <div className={styles.inputGroup}>
                        <input
                            id="displayName"
                            type="text"
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            placeholder={settings?.display_name || 'Voer een weergavenaam in'}
                            className={styles.input}
                        />
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!displayNameInput.trim()}
                        >
                            Opslaan
                        </button>
                    </div>
                    {settings?.display_name && (
                        <p className={styles.helpText}>Huidige naam: {settings.display_name}</p>
                    )}
                </form>
            </section>

            {/* Password Change */}
            <section className={styles.settingCard}>
                <h3 className={styles.cardTitle}>
                    <span className={styles.cardIcon}>🔒</span>
                    Wachtwoord wijzigen
                </h3>

                <form onSubmit={handleChangePassword}>
                    <div className={styles.settingItem}>
                        <label className={styles.label} htmlFor="newPassword">
                            Nieuw wachtwoord
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimaal 8 tekens"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.settingItem}>
                        <label className={styles.label} htmlFor="confirmPassword">
                            Bevestig wachtwoord
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Herhaal je nieuwe wachtwoord"
                            className={styles.input}
                        />
                    </div>

                    {passwordError && (
                        <p className={styles.errorText}>{passwordError}</p>
                    )}

                    <button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={!newPassword || !confirmPassword}
                    >
                        Wachtwoord wijzigen
                    </button>
                </form>
            </section>

            {/* Preferences */}
            <section className={styles.settingCard}>
                <h3 className={styles.cardTitle}>
                    <span className={styles.cardIcon}>⚙️</span>
                    Voorkeuren
                </h3>

                <div className={styles.settingItem}>
                    <label className={styles.label}>Thema</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="theme"
                                value="dark"
                                checked={settings?.theme_preference === 'dark'}
                                onChange={() => updateTheme('dark')}
                                className={styles.radio}
                            />
                            <span>Donker</span>
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="theme"
                                value="light"
                                checked={settings?.theme_preference === 'light'}
                                onChange={() => updateTheme('light')}
                                className={styles.radio}
                            />
                            <span>Licht</span>
                        </label>
                    </div>
                </div>

                <div className={styles.settingItem}>
                    <label className={styles.switchLabel}>
                        <input
                            type="checkbox"
                            checked={settings?.email_notifications || false}
                            onChange={toggleEmailNotifications}
                            className={styles.checkbox}
                        />
                        <span>Email notificaties ontvangen</span>
                    </label>
                </div>
            </section>

            {/* Privacy & Data */}
            <section className={styles.settingCard}>
                <h3 className={styles.cardTitle}>
                    <span className={styles.cardIcon}>🔐</span>
                    Privacy & Gegevens
                </h3>

                <div className={styles.settingItem}>
                    <button onClick={handleExportData} className={styles.secondaryButton}>
                        📥 Export mijn gegevens
                    </button>
                    <p className={styles.helpText}>
                        Download al je gegevens in JSON-formaat
                    </p>
                </div>
            </section>

            {/* Danger Zone */}
            <section className={`${styles.settingCard} ${styles.dangerCard}`}>
                <h3 className={styles.cardTitle}>
                    <span className={styles.cardIcon}>⚠️</span>
                    Gevarenzone
                </h3>

                {!showDeleteConfirm ? (
                    <div className={styles.settingItem}>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className={styles.dangerButton}
                        >
                            🗑️ Account verwijderen
                        </button>
                        <p className={styles.helpText}>
                            Permanent verwijderen van je account en alle gegevens
                        </p>
                    </div>
                ) : (
                    <div className={styles.confirmDelete}>
                        <p className={styles.warningText}>
                            ⚠️ Dit kan niet ongedaan worden gemaakt. Al je favorieten en gegevens worden permanent verwijderd.
                        </p>
                        <div className={styles.confirmButtons}>
                            <button
                                onClick={handleDeleteAccount}
                                className={styles.dangerButton}
                            >
                                Ja, verwijder mijn account
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className={styles.secondaryButton}
                            >
                                Annuleren
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
