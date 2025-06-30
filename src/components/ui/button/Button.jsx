/**
 * Button Component
 *
 * A versatile button component with various styles and functionalities.
 *
 * @module components/ui/button/Button
 */

import styles from "./Button.module.scss";
import PropTypes from 'prop-types';

/**
 * Versatile button component
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler function
 * @param {string} [props.type="button"] - Button type attribute ('button', 'submit', 'reset')
 * @param {string} [props.variant="primary"] - Button style variant ('primary', 'secondary', 'tertiary', 'danger', 'success')
 * @param {string} [props.size] - Button size ('small', 'large')
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether the button is in a loading state
 * @param {boolean} [props.fullWidth=false] - Whether the button should take up the full width of its container
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ElementType} [props.as='button'] - The HTML element to render the button as (e.g., 'a' for link-styled buttons)
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

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'danger', 'success']),
    size: PropTypes.oneOf(['small', 'large']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
    as: PropTypes.elementType,
};

export default Button;
