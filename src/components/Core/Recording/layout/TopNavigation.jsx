import styles from '../RecordingPage.module.scss';

export function TopNavigation({activeTab, setActiveTab}) {
    const leftTabs = ["Audio Interface"];
    const rightTabs = ["Geselecteerd Gedicht", "Beluister Opnames"];

    return (
        <div className={styles.TopNavContainer}>
            <nav className={styles.TopNavigation + ' ' + styles['TopNavigation--left']}>
                {leftTabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.TabButton} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.replace(' ', '\n')}
                    </button>
                ))}
            </nav>
            <nav className={styles.TopNavigation + ' ' + styles['TopNavigation--right']}>
                {rightTabs.map(tab => (
                    <button
                        key={tab}
                        className={`${styles.TabButton} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.replace(' ', '\n')}
                    </button>
                ))}
            </nav>
        </div>
    )
}
