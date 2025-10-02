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


export const PoemHeader = memo(({title, author, styles}) => {
    return (
        <div className={styles.cardHeader}>
            <h3
                className={styles.poemTitle}
                title={title.title}
            >
                {title.display}
            </h3>
            <p
                className={styles.poemAuthor}
                title={author.title}
            >
                {author.displayWithPrefix}
            </p>
        </div>
    );
});

