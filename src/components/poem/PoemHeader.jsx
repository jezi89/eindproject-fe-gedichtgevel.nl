/**
 * PoemHeader Component
 * Displays poem title and author information
 * Extracted from PoemResultItem for modularity
 *
 * @component
 * @param {Object} props
 * @param {{display: string, title?: string}} props.title - Title object with display and optional title string.
 * @param {{display: string, displayWithPrefix: string, title?: string}} props.author - Author object with display, displayWithPrefix, and optional title string.
 * @param {Object} props.styles - CSS module or style object for class names.
 */

import {memo} from 'react';


export const PoemHeader = memo(({title, author, styles, isFavorite, onToggleFavorite, onAuthorFavorite}) => {
    return (
        <div className={styles.cardHeader}>
            <div className={styles.titleRow} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                <h3
                    className={styles.poemTitle}
                    title={title.title}
                    style={{margin: 0}}
                >
                    {title.display}
                </h3>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: isFavorite ? '#d09a47' : '#ccc', // $accent-gold or grey
                        padding: '0 0.5rem',
                        lineHeight: 1
                    }}
                    title={isFavorite ? "Verwijder uit favorieten" : "Sla op als favoriet"}
                >
                    {isFavorite ? '★' : '☆'}
                </button>
            </div>
            <div className={styles.authorRow} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <p
                    className={styles.poemAuthor}
                    title={author.title}
                    style={{margin: 0}}
                >
                    {author.displayWithPrefix}
                </p>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onAuthorFavorite();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: '#ccc',
                        padding: 0,
                        lineHeight: 1
                    }}
                    title="Favoriete dichter (Coming in v2)"
                >
                    ☆
                </button>
            </div>
        </div>
    );
});

