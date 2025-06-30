// src/components/system/ApiStatusCard.jsx
import React, {useState, useCallback, useEffect} from 'react';
import {useApiHealth} from '@/hooks/data'; // Updated to use index import
import styles from './ApiStatusCard.module.scss';

function getApiName(apiType) {
    const apiNames = {
        'poemApi': 'PoetryDB API',
        'supabase': 'Supabase Database'
        // possibility to add more API names
    };
    return apiNames[apiType] || apiType;
}

export function ApiStatusCard({
                                  apiTypes = ['poemApi'],
                                  collapsible = true,
                                  checkInterval = 300000, // 5 minuten
                                  className = '' // Accept className prop
                              }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const createOnStatusChangeCallback = useCallback((capturedApiType) => {
        return (newStatus, oldStatus) => {
            if (oldStatus.hasPerformedInitialCheck && (oldStatus.isHealthy !== newStatus.isHealthy)) {
                console.log(`Status van ${getApiName(capturedApiType)} (in Card) veranderd: ${newStatus.isHealthy ? 'Gezond' : 'Problemen'}`);
                if (!newStatus.isHealthy && isCollapsed) {
                    setIsCollapsed(false);
                }
            }
        };
    }, [isCollapsed, setIsCollapsed]); // Dependency array voor createOnStatusChangeCallback

    const apiHealthHooks = apiTypes.map(apiType => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const healthHook = useApiHealth(apiType, {
            pollingInterval: checkInterval,
            onStatusChange: createOnStatusChangeCallback(apiType), // CORRECTED: onStatusChange
            // Specifieke opties voor poemApi (of andere API's) kunnen hier ook worden doorgegeven
            // expectedCount: ..., tolerance: ... (indien nodig per apiType anders dan default)
        });
        return {
            type: apiType,
            ...healthHook,
        };
    });

    const isLoadingOverall = apiHealthHooks.some(hook => hook.isLoading && !hook.status.hasPerformedInitialCheck);
    const allHealthyAfterCheck = apiHealthHooks.every(hook => hook.status.hasPerformedInitialCheck && hook.status.isHealthy);
    const anyIssuesAfterCheck = apiHealthHooks.some(hook => hook.status.hasPerformedInitialCheck && !hook.status.isHealthy);

    useEffect(() => {
        if (collapsible && allHealthyAfterCheck && !isLoadingOverall) {
            setIsCollapsed(true);
        }
    }, [collapsible, allHealthyAfterCheck, isLoadingOverall]);


    const handleRefreshAll = useCallback(() => {
        apiHealthHooks.forEach(hook => {
            hook.refreshApiStatus();
        });
    }, [apiHealthHooks]);

    if (collapsible && isCollapsed && allHealthyAfterCheck && !isLoadingOverall) {
        return (
            <div
                className={styles.statusIndicator}
                title="Alle gevolgde APIs zijn beschikbaar. Binnenkort krijg je hier meer info te zien."
                onClick={() => setIsCollapsed(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsCollapsed(false)}
            >
                <span className={styles.healthyDot}></span>
            </div>
        );
    }

    let containerClass = styles.statusCardContainer;
    if (isLoadingOverall) {
        containerClass += ` ${styles.statusCardChecking}`;
    } else if (allHealthyAfterCheck) {
        containerClass += ` ${styles.statusCardHealthy}`;
    } else if (anyIssuesAfterCheck) {
        containerClass += ` ${styles.statusCardError}`;
    } else {
        containerClass += ` ${styles.statusCardNeutral}`;
    }

    return (
        <div className={`${containerClass} ${className}`}>
            <div className={styles.statusContent}>
                {isLoadingOverall && (
                    <div className={styles.checkingMessage}>
                        <span className={styles.spinner}></span>
                        API statussen controleren...
                    </div>
                )}

                {!isLoadingOverall && allHealthyAfterCheck && (
                    <div className={styles.healthyMessage}>
                        <span className={styles.checkmark}>✓</span>
                        Alle gevolgde APIs zijn operationeel.
                    </div>
                )}

                {!isLoadingOverall && anyIssuesAfterCheck && (
                    <div className={styles.statusList}>
                        <div className={styles.statusHeader}>
                            <span className={styles.warningIcon}>⚠️</span>
                            API Status Waarschuwing:
                        </div>
                        <div className={styles.apiStatusDetails}>
                            {apiHealthHooks
                                .filter(hook => hook.status.hasPerformedInitialCheck && !hook.status.isHealthy)
                                .map(hook => (
                                    <div key={hook.type} className={styles.apiStatusItem}>
                                        <strong>{getApiName(hook.type)}:</strong>
                                        <span>{hook.status.message}</span>
                                    </div>
                                ))}
                        </div>
                        <button
                            className={styles.refreshButton}
                            onClick={handleRefreshAll}
                            disabled={isLoadingOverall}
                        >
                            {isLoadingOverall ? 'Controleren...' : 'Allemaal opnieuw controleren'}
                        </button>
                    </div>
                )}
            </div>
            {collapsible && !isLoadingOverall && (allHealthyAfterCheck || !isCollapsed) && (
                <button
                    className={styles.collapseButton}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Details tonen" : "Minimaliseren"}
                    style={{display: anyIssuesAfterCheck && !isCollapsed ? 'none' : 'flex'}}
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? '+' : '−'}
                </button>
            )}
        </div>
    );
}