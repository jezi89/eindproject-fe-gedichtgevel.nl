import styles from './forms.module.scss';
import {forwardRef} from 'react';

export const FormField = forwardRef(({id, label, name, type, value, onChange, error, required = false, ...props}, ref) => {
    const inputId = id || name;
    return (
        <div className={styles.formGroup}>
            {label && ( // Conditionally render label
                <label
                    htmlFor={inputId}
                    className={`${styles.formLabel}${required ? ' ' + styles.formLabelRequired : ''}`}
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                aria-invalid={!!error}
                aria-errormessage={error ? `${inputId}-error` : undefined}
                className={`${styles.formInput} ${error ? styles.formInputInvalid : ''}`}
                ref={ref} // Forward ref to the input element
                {...props}
            />
            {error && ( // Ensure error is displayed correctly
                <div id={`${inputId}-error`} className={styles.formError} role="alert">
                    {error}
                </div>
            )}
        </div>
    );
});


