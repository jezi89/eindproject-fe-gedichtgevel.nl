/**
 * AccountPage Component
 *
 * User account management page that displays user information
 * and account settings.
 *
 * @module pages/Account/AccountPage
 */

import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '@/hooks/auth/useAuth';
import {AccountNav} from '@/components/account/AccountNav';
import {FavoritesSection} from '@/components/account/FavoritesSection';
import {StatsSection} from '@/components/account/StatsSection';
import {SettingsSection} from '@/components/account/SettingsSection';
import styles from './AccountPage.module.scss';

/**
 * AccountPage component for user account management
 *
 * @component
 * @returns {JSX.Element} Account page component
 */
export function AccountPage() {
    const {user, loading} = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('favorites');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth/login', {replace: true});
        }
    }, [user, loading, navigate]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}/>
                <p>Account laden...</p>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className={styles.accountPage}>
            <div className={styles.container}>
                {/* Page Header */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Mijn Account</h1>
                    <p className={styles.subtitle}>
                        Welkom terug, {user.email}
                    </p>
                </header>

                {/* Navigation Tabs */}
                <AccountNav activeTab={activeTab} onTabChange={setActiveTab}/>

                {/* Tab Content */}
                <div className={styles.content}>
                    {activeTab === 'favorites' && <FavoritesSection/>}
                    {activeTab === 'stats' && <StatsSection/>}
                    {activeTab === 'settings' && <SettingsSection/>}
                </div>
            </div>
        </div>
    );
}
