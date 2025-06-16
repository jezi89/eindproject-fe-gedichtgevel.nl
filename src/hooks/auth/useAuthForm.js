/**
 * Custom hook for handling form state in authentication forms
 *
 * @module hooks/useAuthForm
 */

import {useState} from "react";

/**
 * useAuthForm Hook
 *
 * Manages form state for authentication forms (login, registration),
 * including values, errors, submission state, and form actions.
 *
 * Features:
 * - Form values management
 * - Error handling
 * - Submission state tracking
 * - Form reset
 * - Form action creation
 *
 * @param {Object} initialValues - Initial form values (default: {email: "", password: ""})
 * @returns {Object} Form state and methods
 * @returns {Object} .values - Current form values
 * @returns {Object} .errors - Form validation errors
 * @returns {boolean} .isSubmitting - Whether form is submitting
 * @returns {string} .formStatus - Current form status ("idle", "submitting", "success", "error")
 * @returns {Function} .handleChange - Handler for input changes
 * @returns {Function} .setValues - Function to update all values
 * @returns {Function} .setErrors - Function to update errors
 * @returns {Function} .resetForm - Function to reset form to initial state
 * @returns {Function} .createFormAction - Creates a form action function
 */
function useAuthForm(initialValues = {email: "", password: ""}) {
    // Form values, errors and submission state
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState("idle"); // "idle", "submitting", "success", "error"

    /**
     * Handles input field changes
     * @param {React.ChangeEvent} e - Change event object
     */
    const handleChange = (e) => {
        const {name, value} = e.target
        setValues({
            ...values,
            [name]: value
        });
    };

    /**
     * Reset form state to initial values and clear errors
     */
    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setFormStatus("idle");
    };

    /**
     * Create a form action to handle form submission
     * @param {Function} submitCallback - Callback function for form submission
     * @returns {Function} Form action function
     */

    const createFormAction = (submitCallback) => {
        return async (formData) => {
            if (formData instanceof FormData) {
                const newValues = {};
                initialValues && Object.keys(initialValues).forEach((key) => {
                    const value = formData.get(key);
                    if (value !== null) {
                        newValues[key] = value;
                    }
                });

                // Update form values with new values from formData
                if (Object.keys(newValues).length > 0) {
                    setValues(prevValues => ({
                        ...prevValues,
                        ...newValues
                    }));
                }
            }

            setIsSubmitting(true);
            setFormStatus("submitting");

            try {
                const result = await submitCallback(formData || values);
                // Check if result indicates an error
                if (result && !result.success && result.error) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        form: result.error
                    }));
                    setFormStatus("error");
                    return result;
                }
                setFormStatus("success");
                return result;
            } catch (error) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    form: error.message
                }));
                setFormStatus("error");
                // Don't throw the error - let the form handle it
                return {success: false, error: error.message};
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return {
        values,
        errors,
        isSubmitting,
        formStatus,
        handleChange,
        setValues,
        setErrors,
        resetForm,
        createFormAction
    };
}

export default useAuthForm;
