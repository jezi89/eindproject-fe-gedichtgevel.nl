import styles from './RecordingPage.module.scss';

export function SearchBar() {
    return (
        <div className={styles.SearchBar}>

            <div className={styles['SearchBar-collections']}>zoek in collecties
                <input
                    type="checkbox"
                    id="toggle-search-options"
                    className={styles['SearchBar-checkbox']}
                    style={{display: 'none'}}
                />
                <label htmlFor="toggle-search-options" className={styles['CustomCheckbox']}></label></div>
            <div className={styles['SearchBar-separator']}>
                <input className={styles['SearchBar-input']} type="text" placeholder="Verschuur: De Gevel van Mijn Dromen"/>
                <button className={styles['SearchBar-button']}>ZOEK</button>
            </div>
        </div>
    );
}
