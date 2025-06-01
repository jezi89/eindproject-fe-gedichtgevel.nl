/**
 * StatusBanner Component
 *
 * Container component for displaying API status information.
 *
 * @module layouts/StatusBanner/StatusBanner
 */

import React from 'react';
import {ServicesStatusCard} from '@/components/system/ServicesStatusCard.jsx';
import styles from './StatusBanner.module.scss';

/**
 * StatusBanner component that acts as a container for ServicesStatusCard
 *
 * @component
 * @param {Object} props
 * @param {Array<string>} [props.apiTypes=['poemApi']] - Array of API types to monitor
 * @param {boolean} [props.collapsible=true] - Whether the status display is collapsible
 * @param {number} [props.checkInterval=300000] - API status polling interval in milliseconds
 * @returns {JSX.Element} Status banner component
 */
export default function StatusBanner({
                                         apiTypes,
                                         collapsible,
                                         checkInterval
                                     }) {
    // Render container with ServicesStatusCard
    // Pass props to ServicesStatusCard for monitoring API status
}