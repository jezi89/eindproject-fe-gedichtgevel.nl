import {useLocation} from 'react-router-dom';

/**
 * Custom hook to get prefilled form data from navigation state
 * Makes it easy to pass data between routes
 *
 * @param {string} fieldName - The field name to get from state
 * @param {*} defaultValue - Default value if not found in state
 * @returns {*} The value from navigation state or default
 */

// TODO Hook bouwen om prefilled data te krijgen van de vorige pagina