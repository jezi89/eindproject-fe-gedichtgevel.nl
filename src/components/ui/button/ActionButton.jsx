/**
 * ActionButton Components
 *
 * Specialized button components for actions and form submissions,
 * built upon the base Button component.
 *
 * @module components/ui/button/ActionButton
 */

import Button from "./Button.jsx"; // Import the enhanced Button
import styles from "./Button.module.scss"; // For specific submit button styling if needed

/**
 * General action button component.
 * This can often be replaced by using the base Button component directly
 * with appropriate props. It's kept here for semantic distinction if desired.
 *
 * @component
 * @param {Object} props - Props passed to the base Button component
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant="secondary"] - Default variant for action buttons
 * @returns {JSX.Element} Action button component
 */
export function ActionButton({children, variant = "secondary", ...props}) {
    return (
        <Button variant={variant} {...props}>
            {children}
        </Button>
    );
}

/**
 * Submit button component specifically styled for form submissions.
 *
 * @component
 * @param {Object} props - Props passed to the base Button component
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.type="submit"] - Default type for submit buttons
 * @param {string} [props.variant="primary"] - Default variant for submit buttons
 * @param {boolean} [props.fullWidth=true] - Default fullWidth for submit buttons in forms
 * @param {string} [props.className] - Additional class names
 * @returns {JSX.Element} Submit button component
 */
export function SubmitButton({
                                 children,
                                 type = "submit",
                                 variant = "primary",
                                 fullWidth = true, // Common for form submit buttons
                                 className = '',
                                 ...props
                             }) {
    // Combines base button styling with specific submit button styling from Button.module.scss
    const submitClassName = `${styles.formSubmit} ${className}`.trim();

    return (
        <Button
            type={type}
            variant={variant}
            fullWidth={fullWidth}
            className={submitClassName}
            {...props}
        >
            {children}
        </Button>
    );
}
