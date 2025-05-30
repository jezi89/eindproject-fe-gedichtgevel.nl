import {useLocation} from 'react-router';

/**
 * Custom hook to get prefilled form data from navigation state
 * Makes it easy to pass data between routes
 *
 * @param {string} fieldName - The field name to get from state
 * @param {*} defaultValue - Default value if not found in state
 * @returns {*} The value from navigation state or default
 */

export function useNavigationState(fieldName, defaultValue = '') {
    const location = useLocation(); // ReactRouter method: Returns the current navigation action which describes how the router came to the current location, either by a pop, push, or replace on the history stack.
    return location.state?.[fieldName] || defaultValue;
}

/**
 * Hook specifically for email prefilling across auth forms
 * @returns {string} The email from navigation state or empty string
 */
export function usePrefilledEmail() {
    return useNavigationState('email', '');
}

/**
 * Hook to get all navigation state
 * @returns {Object} The entire navigation state object
 */
export function useAllNavigationState() {
    const location = useLocation();
    return location.state || {};
}