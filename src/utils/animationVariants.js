// TODO checken hoe dit nu gebruikt wordt en of er geen redundancy en css/framer conflicten optreden

/**
 * Animation Variants for SearchResultItem
 * Centralized Framer Motion animation configurations
 */

// Poem card animations
export const poemCardVariants = {
    initial: {opacity: 0, y: 20},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: -20}
};

// Poem line animations
export const poemLineVariants = {
    preview: {
        initial: {opacity: 0, y: 10},
        animate: {opacity: 1, y: 0},
        transition: (i) => ({
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
        })
    },
    hidden: {
        initial: {opacity: 0, x: -30, y: 10},
        animate: {opacity: 1, x: 0, y: 0},
        transition: (delay) => ({
            delay: delay / 1000,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        })
    }
};

// Button animations
export const buttonVariants = {
    container: {
        initial: {opacity: 0, y: 20, scale: 0.9},
        animate: {opacity: 1, y: 0, scale: 1},
        exit: {opacity: 0, scale: 0.9},
        transition: {duration: 0.3}
    },
    button: {
        hover: {
            scale: 1.02,
            y: -2,
            transition: {duration: 0.2}
        },
        tap: {
            scale: 0.98,
            transition: {duration: 0.1}
        }
    }
};

// Ellipsis and expand section animations
export const ellipsisVariants = {
    initial: {opacity: 0, scale: 0.9},
    animate: {opacity: 1, scale: 1},
    exit: {opacity: 0, scale: 0.9},
    transition: {duration: 0.3}
};

// Expanded content animations
export const expandedContentVariants = {
    initial: {opacity: 0},
    animate: {opacity: 1},
    exit: {opacity: 0},
    transition: {duration: 0.3}
};

// Hidden content indicator
export const hiddenIndicatorVariants = {
    initial: {opacity: 0},
    animate: {opacity: 1},
    transition: {delay: 0.3, duration: 0.3}
};

// Toast animations
export const toastVariants = {
    initial: {opacity: 0, y: 10},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: 10},
    transition: {duration: 0.2}
};

// Non-expandable actions
export const nonExpandableVariants = {
    initial: {opacity: 0, y: 10},
    animate: {opacity: 1, y: 0},
    transition: {duration: 0.3, delay: 0.2}
};

// Layout animations
export const layoutVariants = {
    card: {
        layout: true,
        transition: {
            layout: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    },
    content: {
        layout: true,
        transition: {
            layout: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }
};

// Expansion container animations (for expand controls)
export const expansionVariants = {
    initial: {height: 0},
    expand: (totalHeight) => ({
        height: totalHeight,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "tween"
        }
    }),
    collapse: {
        height: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};