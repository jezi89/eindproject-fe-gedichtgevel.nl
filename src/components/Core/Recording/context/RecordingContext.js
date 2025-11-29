import { createContext } from 'react';

// Context for state that changes frequently (e.g., timers)
export const TimeContext = createContext(null);

// Context for state and functions that are more stable
export const ControlsContext = createContext(null);

// Context specifically for countdown state to prevent re-renders
export const CountdownContext = createContext(null);


