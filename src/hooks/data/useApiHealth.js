// src/hooks/useApiHealth.js
// Deze custom hook moet verantwoordelijk worden voor het leveren van de API gezondheidsstatus aan componenten.
// Het moet gebruik maken van de 'poemService' om de daadwerkelijke health check uit te voeren en
// luisteren naar globale events voor statusupdates.

/*
Daarbij moet het:
    * API Health Monitoring Hook
     *
     * Deze hook verzorgt het monitoren van API health status voor React componenten
     * met ondersteuning voor:
     * - Meerdere API types via configuratie
     * - Adaptieve polling intervallen
     * - Event-gebaseerde updates
     * - Status callbacks voor UI notificaties
*/

// Voor nu een eenvoudigere implementatie, waarbij we gebruik maken van checkPoetryDbHealth.js en de API-type 'poemApi'.


import {useState, useCallback, useEffect, useRef} from 'react';
import {checkPoetryDbHealth} from "@/services/monitoring/checkPoetryDbHealth.js";

/**
 * Custom hook for API health monitoring
 *
 * @param {string} apiType - Type of API to monitor (e.g., 'poemApi', 'supabase')
 * @param {Object} options - Configuration options
 * @param {number} [options.pollingInterval=300000] - Interval between health checks in milliseconds
 * @param {Function} [options.onStatusChange] - Callback for status changes
 * @param {number} [options.expectedCount=3010] - Expected number of records for health check
 * @param {number} [options.tolerance=10] - Tolerance margin for expected count
 * @returns {Object} Health status and control functions
 * @returns {Object} .status - Current API health status
 * @returns {boolean} .status.isHealthy - Whether API is healthy
 * @returns {string} .status.message - Status message
 * @returns {number} .status.count - Record count (if applicable)
 * @returns {boolean} .status.hasPerformedInitialCheck - Whether initial check has been performed
 * @returns {boolean} .isLoading - Whether check is in progress
 * @returns {Function} .refreshApiStatus - Function to manually refresh status
 */

export const useApiHealth = (
    apiType,
    {
        pollingInterval = 300000,
        onStatusChange,
        expectedCount = 3010,
        tolerance = 10,
    } = {}
) => {
    const [status, setStatus] = useState({
        isHealthy: true, // Start optimistically as healthy
        message: 'API status wordt gecontroleerd...',
        count: 0,
        hasPerformedInitialCheck: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Gebruik een ref om de laatste versie van onStatusChange bij te houden
    // zonder het een dependency te maken van useCallback/useEffect die re-renders veroorzaakt.
    const onStatusChangeRef = useRef(onStatusChange);

    // Update de ref als de onStatusChange prop verandert.
    useEffect(() => {
        onStatusChangeRef.current = onStatusChange;
    }, [onStatusChange]);

    const performCheck = useCallback(async () => {
        setIsLoading(true);
        let healthResult;

        if (apiType === 'poemApi') {
            healthResult = await checkPoetryDbHealth(expectedCount, tolerance);
        } else if (apiType === 'supabase') {
            healthResult = {ok: true, message: 'Supabase health check placeholder.', count: 0};
            console.warn("Supabase health check is een placeholder in useApiHealth.");
        } else {
            healthResult = {ok: false, message: `Onbekend API type: ${apiType}`, count: 0};
            console.error(`Onbekend API type opgegeven aan useApiHealth: ${apiType}`);
        }

        const newStatusData = {
            isHealthy: healthResult.ok,
            message: healthResult.message,
            count: healthResult.count || 0,
            hasPerformedInitialCheck: true,
        };

        setStatus(prevStatus => {
            // Gebruik de callback uit de ref.
            if (typeof onStatusChangeRef.current === 'function' &&
                (prevStatus.isHealthy !== newStatusData.isHealthy ||
                    !prevStatus.hasPerformedInitialCheck
                )) {
                onStatusChangeRef.current(newStatusData, prevStatus);
            }
            return newStatusData;
        });

        setIsLoading(false);
        // onStatusChange is nu verwijderd uit de dependency array.
        // De afhankelijkheid van apiType, expectedCount, en tolerance is correct
        // als deze waarden daadwerkelijk de check-logica beïnvloeden.
    }, [apiType, expectedCount, tolerance]);

    useEffect(() => {
        // Add a small delay before the first check to allow page to stabilize
        const initialDelay = setTimeout(() => {
            performCheck();
        }, 1500); // 1.5 second delay before first check

        let intervalId = null;
        if (pollingInterval > 0) {
            // Start interval after initial check completes
            intervalId = setInterval(performCheck, pollingInterval);
        }

        return () => {
            clearTimeout(initialDelay);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [performCheck, pollingInterval]);

    const refreshApiStatus = useCallback(() => {
        setIsLoading(true);
        setStatus(prevStatus => ({...prevStatus, message: 'Status handmatig aan het vernieuwen...'}));
        performCheck();
    }, [performCheck]);

    return {status, isLoading, refreshApiStatus};
};
export default useApiHealth;

// TODO Comments en jdocs op juiste plek


/*
    // State for health status
    // - isHealthy: Whether API is functioning correctly
    // - message: Status message for display
    // - count: Number of records (if applicable)
    // - hasPerformedInitialCheck: Whether initial check has been performed
    
    // Loading state tracking
    
    // Ref for onStatusChange callback to avoid unnecessary re-renders
    
    /!**
     * Performs API health check based on apiType
     * 
     * @async
     * @function
     *!/
    const performCheck = useCallback(async () => {
        // Set loading state
        // Perform health check based on API type
        // Update status with health check results
        // Trigger onStatusChange callback if status changed
        // Reset loading state
    }, [apiType, expectedCount, tolerance]);

    /!**
     * Effect for initial check and polling
     *!/
    useEffect(() => {
        // Perform initial check
        // Set up polling interval if configured
        // Clean up interval on unmount
    }, [performCheck, pollingInterval]);

    /!**
     * Manually refresh API status
     * 
     * @function
     *!/
    const refreshApiStatus = useCallback(() => {
        // Set loading state
        // Update message to indicate manual refresh
        // Perform health check
    }, [performCheck]);

    // Return status and control functions
    return {status, isLoading, refreshApiStatus};
};

*/
