/**
 * PoemHeader Component
 * Displays poem title and author information
 * Extracted from PoemResultItem for modularity
 */

import {memo} from 'react';
import PropTypes from 'prop-types';

// TODO Checken waarom memo hier gebruikt wordt en of dat nodig is onder de noemer Child componenten in lijsten, of dat hier Premature optimization wordt toegepast
const PoemHeader = memo(({title, author, styles}) => {
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

PoemHeader.displayName = 'PoemHeader';

PoemHeader.propTypes = {
    title: PropTypes.shape({
        display: PropTypes.string.isRequired,
        title: PropTypes.string
    }).isRequired,
    author: PropTypes.shape({
        display: PropTypes.string.isRequired,
        displayWithPrefix: PropTypes.string.isRequired,
        title: PropTypes.string
    }).isRequired,
    styles: PropTypes.object.isRequired
};

export default PoemHeader;
