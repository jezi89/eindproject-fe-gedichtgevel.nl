/**
 * Authentication Context for managing user authentication state
 *
 * *@returns {Object|null} The current authentication context value, or null if not within a provider.
 */

import {createContext, useContext} from 'react';

// Implementation
const AuthContext = createContext(null);

export function useAuthContext() {
    return useContext(AuthContext);
}

export default AuthContext;

    
    


