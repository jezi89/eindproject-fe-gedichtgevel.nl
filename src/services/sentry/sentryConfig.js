/**
 * Sentry Configuratie voor Gedichtgevel.nl
 *
 * Deze configuratie initialiseert Sentry voor:
 * - Error tracking (automatisch opvangen van errors)
 * - Performance monitoring (tracing van pagina navigaties)
 * - React Router v7 integratie
 * - Session replay (optioneel)
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
 * Initialiseert Sentry met React Router v7 integratie
 *
 * @param {Object} options - Configuratie opties
 * @param {string} options.dsn - Sentry DSN (Data Source Name)
 * @param {string} options.environment - Omgeving (development, staging, production)
 * @param {number} options.tracesSampleRate - Percentage van traces om op te slaan (0.0 - 1.0)
 * @param {number} options.replaysSessionSampleRate - Percentage van sessies om op te nemen (0.0 - 1.0)
 * @param {number} options.replaysOnErrorSampleRate - Percentage van sessies met errors om op te nemen (0.0 - 1.0)
 */
export function initSentry({
    dsn = import.meta.env.VITE_SENTRY_DSN,
    environment = import.meta.env.MODE,
    tracesSampleRate = 1.0,
    replaysSessionSampleRate = 0.1,
    replaysOnErrorSampleRate = 1.0,
    enableLogs = true,
} = {}) {
    // Skip initialisatie als geen DSN is geconfigureerd
    if (!dsn) {
        console.warn('Sentry DSN niet gevonden. Sentry monitoring is uitgeschakeld.');
        return;
    }

    const isDevelopment = environment === 'development';

    Sentry.init({
        dsn,
        environment,

        // Send default PII (Personally Identifiable Information) zoals IP addresses
        // Dit helpt bij debugging maar respecteer privacy regelgeving (GDPR)
        sendDefaultPii: true,

        // Development-specific configuratie
        ...(isDevelopment ? {
            // Spotlight voor local debugging
            spotlight: true,

            // Capture alles in development
            sampleRate: 1.0,
            tracesSampleRate: 1.0,
            enableLogs: true,

            // Development integrations
            integrations: [
                // Spotlight Browser Integration voor local debugging
                Sentry.spotlightBrowserIntegration(),

                // React Router v7 Browser Tracing voor performance monitoring
                Sentry.reactRouterV7BrowserTracingIntegration({
                    useEffect: React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),

                // Console logging integratie (alle levels in dev)
                Sentry.consoleLoggingIntegration({
                    levels: ['log', 'warn', 'error']
                }),
            ],
        } : {
            // Production configuratie
            tracesSampleRate,
            replaysSessionSampleRate,
            replaysOnErrorSampleRate,
            enableLogs,

            // Production integrations
            integrations: [
                // React Router v7 Browser Tracing voor performance monitoring
                Sentry.reactRouterV7BrowserTracingIntegration({
                    useEffect: React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),

                // Session Replay voor het opnemen van gebruikerssessies
                Sentry.replayIntegration({
                    maskAllText: false, // Masker alle tekst voor privacy
                    blockAllMedia: false, // Blokkeer alle media (images, video, audio)
                }),

                // Console logging integratie (alleen errors en warnings in production)
                Sentry.consoleLoggingIntegration({
                    levels: ['error', 'warn']
                }),
            ],
        }),

        // Omgevingsspecifieke configuratie
        beforeSend(event, hint) {
            // In development, log events naar console maar stuur ze ook naar Sentry
            // (dit is nuttig voor local debugging met Spotlight)
            if (isDevelopment) {
                console.log('Sentry Event (dev):', event);
            }
            return event;
        },

        // Ignore bepaalde errors
        ignoreErrors: [
            // Browser extensie errors
            'top.GLOBALS',
            'canvas.contentDocument',
            // Random plugin errors
            'atomicFindClose',
            // Network errors die buiten onze controle zijn
            'NetworkError',
            'Failed to fetch',
            // ResizeObserver errors (vaak false positives)
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
        ],

        // Stel de release versie in (handig voor versie tracking)
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
    });
}

/**
 * Logger interface voor Sentry logs
 * Gebruik dit in plaats van console.log voor belangrijke logs
 */
export const logger = Sentry.logger || {
    trace: (...args) => console.trace(...args),
    debug: (...args) => console.debug(...args),
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    fatal: (...args) => console.error('[FATAL]', ...args),
};
