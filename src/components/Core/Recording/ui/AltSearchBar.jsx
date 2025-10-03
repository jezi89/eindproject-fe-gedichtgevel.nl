import styles from '../RecordingPage.module.scss';
import {useSearchPoems} from '@/hooks/search';

export function AltSearchBar({onPoemSelect, onSearchStart}) {
    const {searchTerm, updateSearchTerm, handleSearch, results, loading} = useSearchPoems();

    const handleSearchClick = async () => {
        await handleSearch();
        // Return first result to parent if available, otherwise null (no results)
        if (onPoemSelect) {
            onPoemSelect(results.length > 0 ? results[0] : null);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        updateSearchTerm(value);

        // Notify parent when typing starts (first character typed)
        if (value.length === 1 && onSearchStart) {
            onSearchStart();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className={styles.AltSearchBar}>

            <div className={styles['AltSearchBar-collections']}>zoek in collecties
                <input
                    type="checkbox"
                    id="toggle-search-options"
                    className={styles['AltSearchBar-checkbox']}
                    style={{display: 'none'}}
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
