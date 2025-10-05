import { useNavigate } from 'react-router';
import { CanvasDataService } from '../../services/canvas/canvasDataService.js';

/**
 * Custom hook for canvas navigation utilities
 * 
 * Provides functions to navigate to and from the canvas with proper
 * data management and cleanup. Handles poem data transport via
 * sessionStorage and ensures proper navigation flow.
 * 
 * @returns {Object} Navigation utilities
 */
export function useCanvasNavigation() {
    const navigate = useNavigate();
    
    /**
     * Navigate to canvas with poem data
     * 
     * Stores the poem data in sessionStorage and navigates to the
     * canvas route with the poem ID. Handles data validation and
     * error cases gracefully.
     * 
     * @param {Object} poemData - Poem data to transport to canvas
     * @param {string} poemData.title - Poem title
     * @param {string} poemData.author - Poem author
     * @param {Array<string>|string} poemData.lines - Poem lines or text content
     * @param {string} [poemData.id] - Optional poem ID
     * @param {Object} [options] - Navigation options
     * @param {string} [options.source='search'] - Source of navigation for tracking
     * @param {boolean} [options.replace=false] - Whether to replace current history entry
     */
    const navigateToCanvas = (poemData, options = {}) => {
        try {
            // Validate poem data
            if (!poemData) {

                throw new Error('Poem data is required for canvas navigation');
            }
            
            // Check if we have essential data
            const hasTitle = poemData.title && poemData.title.trim();
            const hasContent = (Array.isArray(poemData.lines) && poemData.lines.length > 0) ||
                             (typeof poemData.text === 'string' && poemData.text.trim()) ||
                             (typeof poemData.content === 'string' && poemData.content.trim()) ||
                             (typeof poemData.body === 'string' && poemData.body.trim());
            
            if (!hasTitle && !hasContent) {

                throw new Error('Poem must have either a title or content');
            }
            
            // Store poem data using CanvasDataService
            const standardizedData = CanvasDataService.storePoemForCanvas(poemData);
            
            // Prepare navigation options
            const { source = 'search', replace = false } = options;
            
            // Build navigation URL
            const canvasUrl = `/designgevel/${standardizedData.id}`;
            const searchParams = new URLSearchParams();
            searchParams.set('source', source);
            
            const fullUrl = `${canvasUrl}?${searchParams.toString()}`;

            // Navigate to canvas
            if (replace) {
                navigate(fullUrl, { replace: true });
            } else {
                navigate(fullUrl);
            }
            
            return standardizedData;
            
        } catch (error) {

            // Re-throw with more context for the calling component
            throw new Error(`Canvas navigation failed: ${error.message}`);
        }
    };
    
    /**
     * Navigate back from canvas
     * 
     * Cleans up sessionStorage and navigates back to the previous
     * location or a specified fallback route. Handles cleanup
     * gracefully even if navigation fails.
     * 
     * @param {string} [fallback='/'] - Fallback route if no previous location
     * @param {Object} [options] - Navigation options
     * @param {boolean} [options.replace=false] - Whether to replace current history entry
     * @param {boolean} [options.clearData=true] - Whether to clear poem data from storage
     */
    const navigateBack = (fallback = '/', options = {}) => {
        try {
            const { replace = false, clearData = true } = options;
            
            // Clear poem data from storage if requested
            if (clearData) {
                CanvasDataService.clearPoemData();

            }
            
            // Try to go back in history first
            if (window.history.length > 1) {

                window.history.back();
            } else {
                // Fallback to specified route

                if (replace) {
                    navigate(fallback, { replace: true });
                } else {
                    navigate(fallback);
                }
            }
            
        } catch (error) {

            // Emergency fallback - try to navigate to home
            try {
                navigate('/', { replace: true });

            } catch (emergencyError) {

                // Last resort - reload the page
                window.location.href = '/';
            }
        }
    };
    
    /**
     * Navigate to canvas with demo poem
     * 
     * Convenience method to navigate to canvas with demo content.
     * Useful for showcasing canvas functionality or as a fallback.
     * 
     * @param {Object} [options] - Navigation options
     */
    const navigateToCanvasDemo = (options = {}) => {
        try {
            // Clear any existing poem data first
            CanvasDataService.clearPoemData();
            
            // Navigate to designgevel without poem ID (will load demo)
            const searchParams = new URLSearchParams();
            searchParams.set('source', 'demo');
            
            const demoUrl = `/designgevel?${searchParams.toString()}`;

            const { replace = false } = options;
            if (replace) {
                navigate(demoUrl, { replace: true });
            } else {
                navigate(demoUrl);
            }
            
        } catch (error) {

            throw new Error(`Canvas demo navigation failed: ${error.message}`);
        }
    };
    
    /**
     * Check if canvas data is available
     * 
     * Utility function to check if there's poem data available
     * for canvas without actually retrieving it.
     * 
     * @returns {boolean} True if canvas data is available
     */
    const hasCanvasData = () => {
        try {
            return CanvasDataService.getPoemForCanvas() !== null;
        } catch (error) {

            return false;
        }
    };
    
    /**
     * Get canvas data info
     * 
     * Returns information about stored canvas data without
     * retrieving the full data object.
     * 
     * @returns {Object} Canvas data information
     */
    const getCanvasDataInfo = () => {
        try {
            const storageInfo = CanvasDataService.getStorageInfo();
            const poemData = CanvasDataService.getPoemForCanvas();
            
            return {
                ...storageInfo,
                hasValidData: !!poemData,
                poemTitle: poemData?.title || null,
                poemAuthor: poemData?.author || null,
                lineCount: poemData?.lines?.length || 0,
                source: poemData?.source || null,
                timestamp: poemData?.timestamp || null
            };
        } catch (error) {

            return {
                hasData: false,
                hasValidData: false,
                size: 0,
                error: error.message
            };
        }
    };
    
    return {
        navigateToCanvas,
        navigateBack,
        navigateToCanvasDemo,
        hasCanvasData,
        getCanvasDataInfo
    };
}