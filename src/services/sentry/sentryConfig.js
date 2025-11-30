/**
 * Sentry Configuration for Gedichtgevel.nl
 *
 * This configuration initializes Sentry for:
 * - Error tracking (automatic error capturing)
 * - Performance monitoring (tracing of page navigations)
 * - React Router v7 integration
 * - Session replay (optional)
 */

import * as Sentry from '@sentry/react';
import React from 'react';
import {
    createRoutesFromChildren,
    matchRoutes,
    useLocation,
    useNavigationType,
} from 'react-router';

/**
 * Initializes Sentry with React Router v7 integration
 *
 * @param {Object} options - Configuration options
 * @param {string} options.dsn - Sentry DSN (Data Source Name)
 * @param {string} options.environment - Environment (development, staging, production)
 * @param {number} options.tracesSampleRate - Percentage of traces to capture (0.0 - 1.0)
 * @param {number} options.replaysSessionSampleRate - Percentage of sessions to record (0.0 - 1.0)
 * @param {number} options.replaysOnErrorSampleRate - Percentage of sessions with errors to record (0.0 - 1.0)
 */
export function initSentry({
    dsn = import.meta.env.VITE_SENTRY_DSN,
    environment = import.meta.env.MODE,
    tracesSampleRate = 1.0,
    replaysSessionSampleRate = 0.1,
    replaysOnErrorSampleRate = 1.0,
    enableLogs = true,
} = {}) {
    // Skip initialization if no DSN is configured
    if (!dsn) {
        return;
    }

    const isDevelopment = environment === 'development';

    Sentry.init({
        dsn,
        environment,

        // Send default PII (Personally Identifiable Information) like IP addresses
        // This helps with debugging but respect privacy regulations (GDPR)
        sendDefaultPii: true,

        // Development-specific configuration
        ...(isDevelopment ? {
            // Spotlight voor local debugging
            spotlight: true,

            // Capture everything in development
            sampleRate: 1.0,
            tracesSampleRate: 1.0,
            enableLogs: true,

            // Development integrations
            integrations: [
                // Spotlight Browser Integration voor local debugging
                Sentry.spotlightBrowserIntegration(),

                // React Router v7 Browser Tracing for performance monitoring
                Sentry.reactRouterV7BrowserTracingIntegration({
                    useEffect: React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),

                // Console logging integration (all levels in dev)
                Sentry.consoleLoggingIntegration({
                    levels: ['log', 'warn', 'error']
                }),
            ],
        } : {
            // Production configuration
            tracesSampleRate,
            replaysSessionSampleRate,
            replaysOnErrorSampleRate,
            enableLogs,

            // Production integrations
            integrations: [
                // React Router v7 Browser Tracing for performance monitoring
                Sentry.reactRouterV7BrowserTracingIntegration({
                    useEffect: React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),

                // Session Replay for recording user sessions
                Sentry.replayIntegration({
                    maskAllText: false, // Mask all text for privacy
                    blockAllMedia: false, // Block all media (images, video, audio)
                }),

                // Console logging integration (only errors and warnings in production)
                Sentry.consoleLoggingIntegration({
                    levels: ['error', 'warn']
                }),
            ],
        }),

        // Environment specific configuration
        beforeSend(event) {
            // In development, log events to console but also send to Sentry
            // (this is useful for local debugging with Spotlight)
            // if (isDevelopment) {
            // }
            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser extension errors
            'top.GLOBALS',
            'canvas.contentDocument',
            // Random plugin errors
            'atomicFindClose',
            // Network errors that are out of our control
            'NetworkError',
            'Failed to fetch',
            // ResizeObserver errors (often false positives)
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
        ],

        // Set the release version (useful for version tracking)
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
    });
}


