/**
 * Button Component
 *
 * A versatile button component with various styles and functionalities.
 *
 * @module components/ui/button/Button
 */

import styles from "./Button.module.scss";

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children - Button content
 * @property {Function} [onClick] - Click handler function
 * @property {('button'|'submit'|'reset')} [type] - Button type attribute
 * @property {('primary'|'secondary'|'tertiary'|'danger'|'success')} [variant] - Button style variant
 * @property {('small'|'large')} [size] - Button size
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {boolean} [loading] - Whether the button is in a loading state
 * @property {boolean} [fullWidth] - Whether the button should take up the full width of its container
 * @property {string} [className] - Additional CSS class names
 * @property {React.ElementType} [as] - The HTML element to render the button as
 */

/**
 * Versatile button component
 *
 * @param {ButtonProps} props
 * @returns {JSX.Element} Button component
 */
function Button({
                    children,
                    onClick,
                    type = "button",
                    variant = "primary",
                    size,
                    disabled = false,
                    loading = false,
                    fullWidth = false,
                    className = '',
                    as: Component = 'button',
                    ...rest
                }) {

    const buttonClasses = [
        styles.button,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`], // e.g., styles.buttonPrimary
        size ? styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`] : '', // e.g., styles.buttonSmall
        fullWidth ? styles.buttonFullWidth : '',
        (disabled || loading) ? styles.buttonDisabled : '', // Apply disabled style if loading too
        loading ? styles.buttonLoading : '',
        className,
    ].filter(Boolean).join(' '); // Filter out empty strings and join

    return (
        <Component
            type={Component === 'button' ? type : undefined} // Only apply type if it's a button element
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            {...rest} // Spread any other props like 'aria-label', 'href' (if 'as' is 'a')
        >
            {/*// TODO improve basic loading text with a spinner or similar*/}
            {loading ? 'Laden...' : children} {/* Basic loading text, can be improved with a spinner */}
        </Component>
    );
}

export default Button;
