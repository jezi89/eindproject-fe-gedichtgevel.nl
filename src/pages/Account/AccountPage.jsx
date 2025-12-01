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
import {useToast} from '@/context/ui/ToastContext';
import styles from './AccountPage.module.scss';

import {supabase} from '@/services/supabase/supabase';

/**
 * AccountPage component for user account management
 *
 * @component
 * @returns {JSX.Element} Account page component
 */
export function AccountPage() {
    const {user, loading} = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('favorites');
    const [displayName, setDisplayName] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth/login', {replace: true});
        }
    }, [user, loading, navigate]);

    // Fetch user settings (display name)
    useEffect(() => {
        if (user) {
            const fetchSettings = async () => {
                try {
                    const { data, error } = await supabase
                        .from('user_settings')
                        .select('display_name')
                        .eq('id', user.id)
                        .single();
                    
                    if (data && data.display_name) {
                        setDisplayName(data.display_name);
                    }
                } catch (error) {
                    console.error('Error fetching user settings:', error);
                }
            };
            fetchSettings();
        }
    }, [user]);

    // Show loading state while checking auth
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading account...</p>
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
            <h1 className={styles.title}>My Account</h1>
            <p className={styles.subtitle}>
              Welcome back,{" "}
              {displayName || user.user_metadata?.full_name || user.email}
            </p>
          </header>

          {/* Navigation Tabs */}
          <AccountNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              if (tab === "stats") {
                addToast(
                  "This feature will be available in version 2.0",
                  "info"
                );
                return;
              }
              setActiveTab(tab);
            }}
          />

          {/* Tab Content */}
          <div className={styles.content}>
            {activeTab === "favorites" && <FavoritesSection />}
            {activeTab === "settings" && <SettingsSection />}
          </div>
        </div>
      </div>
    );
}
