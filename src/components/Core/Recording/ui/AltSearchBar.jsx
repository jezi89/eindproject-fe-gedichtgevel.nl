import styles from '../RecordingPage.module.scss';
import {useSearchPoems} from '@/hooks/search';

export function AltSearchBar({ searchTerm, onSearchTermChange, onSearch, loading }) {
    
    const handleSearchClick = () => {
        if (onSearch) {
            onSearch();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (onSearchTermChange) {
            onSearchTermChange(value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleCheckboxChange = (e) => {
        e.preventDefault();
        alert("Binnenkort beschikbaar (v2)");
    };

    const handleFocus = (e) => {
        e.target.placeholder = "";
    };

    const handleBlur = (e) => {
        e.target.placeholder = "Zoek op dichter en/of titel...";
    };

    return (
        <div className={styles.AltSearchBar}>

            <div className={styles['AltSearchBar-collections']}>zoek in collecties
                <input
                    type="checkbox"
                    id="toggle-search-options"
                    className={styles['AltSearchBar-checkbox']}
                    style={{display: 'none'}}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="toggle-search-options" className={styles['CustomCheckbox']}></label></div>
            <div className={styles['AltSearchBar-separator']}>
                <input
                    className={styles['AltSearchBar-input']}
                    type="text"
                    placeholder="Verschuur: De Gevel van Mijn Dromen"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={loading}
                />
                <button
                    className={styles['AltSearchBar-button']}
                    onClick={handleSearchClick}
                    disabled={loading}
                >
                    {loading ? 'ZOEKEN...' : 'ZOEK'}
                </button>
            </div>
        </div>
    );
}
