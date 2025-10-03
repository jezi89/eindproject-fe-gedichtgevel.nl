/**
 * AccountNav Component
 *
 * Navigation tabs for account page sections
 * Allows switching between Favorites, Stats, and Settings
 *
 * @module components/account/AccountNav
 */

import {motion} from 'framer-motion';
import styles from './AccountNav.module.scss';

const tabs = [
    {
        id: 'favorites',
        label: 'Mijn Favorieten',
        icon: '⭐'
    },
    {
        id: 'stats',
        label: 'Statistieken',
        icon: '📊'
    },
    {
        id: 'settings',
        label: 'Instellingen',
        icon: '⚙️'
    }
];

/**
 * AccountNav component
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Callback when tab is changed
 * @returns {JSX.Element}
 */
export function AccountNav({activeTab, onTabChange}) {
    return (
        <nav className={styles.accountNav}>
            <div className={styles.tabContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <span className={styles.tabIcon}>{tab.icon}</span>
                        <span className={styles.tabLabel}>{tab.label}</span>

                        {/* Active indicator */}
                        {activeTab === tab.id && (
                            <motion.div
                                className={styles.activeIndicator}
                                layoutId="activeTab"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
}
