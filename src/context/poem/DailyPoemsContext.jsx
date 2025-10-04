
import React, { createContext, useContext } from 'react';
import { useDailyPoems as useDailyPoemsHook } from '@/hooks/poem/useDailyPoems.js';

// 1. Create the context
const DailyPoemsContext = createContext(null);

/**
 * 2. Create the Provider component
 * This component will hold the state and logic, and provide it to its children.
 */
export const DailyPoemsProvider = ({ children }) => {
    // Use the original hook once to get the data and functions
    const dailyPoemsData = useDailyPoemsHook();

    return (
        <DailyPoemsContext.Provider value={dailyPoemsData}>
            {children}
        </DailyPoemsContext.Provider>
    );
};

/**
 * 3. Create a custom hook to easily consume the context
 * This simplifies usage in consumer components.
 */
export const useDailyPoems = () => {
    const context = useContext(DailyPoemsContext);
    if (!context) {
        throw new Error('useDailyPoems must be used within a DailyPoemsProvider');
    }
    return context;
};
